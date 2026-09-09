<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

/**
 * Resizes and re-compresses an uploaded image before it's stored, so a
 * banner/course/testimonial/page-content image is never served to the
 * public site at its original, unbounded camera/phone resolution — and,
 * just as importantly, is never stored as a needlessly large PNG when it
 * could be a JPEG (see the second half of this docblock).
 *
 * Why this exists: nothing about the upload flow (BannerRequest etc.) ever
 * capped pixel *dimensions* — only file size (`image`, `max:2048` KB). A
 * banner photo straight off a phone is commonly 3000-4000px wide; even
 * comfortably under the 2MB size cap, an image that large forces the
 * browser to download and decode far more pixels than the hero slider
 * ever displays (it's rendered at a few hundred px wide), which is exactly
 * what was reported as a slow-loading homepage slider. Capping the actual
 * dimensions server-side, once, at upload time, fixes this at the source
 * for every future upload — no per-request cost on the public site, and
 * no client-side workaround needed.
 *
 * A real-world upload then surfaced a second, bigger problem this alone
 * doesn't fix: a photographic banner uploaded as a PNG (1536×1024, no
 * transparency) was already *within* the dimension cap, so no resize
 * happened, and simply re-compressing an already-well-compressed lossless
 * PNG barely changes its size at all — measured on the actual file, 1.69MB
 * in, 1.69MB out, a 0.0% reduction, because PNG's lossless compression is
 * bound by image content/noise, not a quality knob the way JPEG's is.
 * Converting that same file to JPEG (still GD, still no new dependency)
 * measured 1.69MB → 175KB, a 90% reduction, entirely from the format
 * change — nothing to do with resolution. So: any upload that turns out to
 * have no real transparency (checked by sampling actual pixel alpha
 * values, not just "was it a PNG") is now re-encoded as JPEG regardless of
 * its original format, since PNG/GIF/WEBP's only real advantage over JPEG
 * — an alpha channel — isn't being used. An image that genuinely needs
 * transparency (a logo, an icon on a transparent background) keeps it.
 *
 * Deliberately built on PHP's built-in GD extension rather than adding a
 * Composer package (e.g. intervention/image) — GD ships enabled on the
 * overwhelming majority of PHP installs, including typical shared hosting
 * (see docs/DEPLOYMENT.md), and this project has consistently preferred a
 * small local implementation over a new dependency for small, self-
 * contained needs (see HasSlug for the same reasoning). No queue is used
 * either — GD resizing a single image is a low-cost, sub-second operation,
 * and this app can't rely on a queue worker existing at all (see
 * QUEUE_CONNECTION's docblock in .env.production.example) — so, same as
 * Phase 11's admin notification email, this runs synchronously in the
 * request.
 */
class ImageOptimizer
{
    /**
     * Reads an uploaded image, downscales it if it's wider/taller than the
     * given bounds (never upscales — a smaller original is left alone),
     * re-compresses it — converting to JPEG unless the image actually uses
     * transparency — and returns an `OptimizedImage` with the resulting
     * bytes and the file extension they must be stored under. **Every
     * caller must use `$result->extension` when building its storage
     * path** — it will not always match the original upload's extension.
     *
     * Falls back to returning the untouched original bytes (under the
     * original extension) if GD can't read the file (an unexpected format
     * that passed the `image` validation rule, or GD is unavailable) — a
     * slightly larger image is preferable to a failed upload.
     */
    public static function optimize(UploadedFile $file, int $maxWidth = 1920, int $maxHeight = 1080, int $jpegQuality = 82): OptimizedImage
    {
        $originalExtension = strtolower((string) ($file->extension() ?: pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION))) ?: 'jpg';
        $original = file_get_contents($file->getRealPath());

        if ($original === false) {
            return new OptimizedImage('', $originalExtension);
        }

        if (! function_exists('imagecreatefromstring')) {
            // Fails open (returns the untouched original) rather than
            // failing the upload — but this is exactly the situation that
            // was hard to notice in practice (see `images:optimize`'s own
            // upfront check for the CLI side of this same gap), so at least
            // leave a trail in the log for whoever's debugging a slow page
            // later.
            Log::warning('ImageOptimizer: PHP GD extension is not available — storing image at its original, unoptimized size.', [
                'file' => $file->getClientOriginalName(),
            ]);

            return new OptimizedImage($original, $originalExtension);
        }

        $source = @imagecreatefromstring($original);

        if ($source === false) {
            // Not something GD can decode (or a corrupt file that somehow
            // passed validation) — store the original rather than fail
            // the whole upload over an optimization step.
            return new OptimizedImage($original, $originalExtension);
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $scale = min(1, $maxWidth / $width, $maxHeight / $height);

        if ($scale >= 1) {
            // Already within bounds — nothing to resize, but still worth
            // re-compressing (and, below, re-encoding as JPEG) rather than
            // returning the original as-is.
            $target = $source;
            $targetWidth = $width;
            $targetHeight = $height;
        } else {
            $targetWidth = max(1, (int) round($width * $scale));
            $targetHeight = max(1, (int) round($height * $scale));
            $target = imagecreatetruecolor($targetWidth, $targetHeight);

            // Preserve transparency (PNG/GIF/WEBP) while resampling —
            // without this, a transparent background resamples to opaque
            // black. Whether the *output* actually keeps that alpha
            // channel is decided below, once we know if any of it is real.
            imagealphablending($target, false);
            imagesavealpha($target, true);
            $transparent = imagecolorallocatealpha($target, 0, 0, 0, 127);
            imagefilledrectangle($target, 0, 0, $targetWidth, $targetHeight, $transparent);

            imagecopyresampled($target, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
        }

        $originalMime = $file->getMimeType();

        // A JPEG source never has an alpha channel to begin with; anything
        // else gets a real (sampled, not format-assumed) check — a PNG/
        // GIF/WEBP upload is very often a flat, fully-opaque photo with no
        // transparency actually used, and that's the case worth converting
        // to JPEG (see this class's docblock for the measured difference).
        $hasAlpha = $originalMime !== 'image/jpeg' && self::hasRealTransparency($target);

        [$encodeMime, $extension] = match (true) {
            ! $hasAlpha => ['image/jpeg', 'jpg'],
            $originalMime === 'image/gif' => ['image/gif', 'gif'],
            $originalMime === 'image/webp' && function_exists('imagewebp') => ['image/webp', 'webp'],
            // PNG, and the safe fallback for anything else that turned out
            // to have real transparency — PNG always supports alpha.
            default => ['image/png', 'png'],
        };

        if ($encodeMime === 'image/png' || $encodeMime === 'image/webp') {
            // Without this, GD can silently drop the alpha channel on
            // encode even though it was read correctly on decode — and
            // critically, `$target` isn't always the freshly-built image
            // from the resize branch above (which already sets this): when
            // no resize was needed, `$target` is `$source` straight from
            // imagecreatefromstring(), which does NOT have this enabled by
            // default. Set it unconditionally right before encoding rather
            // than relying on whichever branch built `$target`.
            imagesavealpha($target, true);
        }

        ob_start();
        match ($encodeMime) {
            'image/png' => imagepng($target, null, 6),
            'image/gif' => imagegif($target),
            'image/webp' => imagewebp($target, null, $jpegQuality),
            default => imagejpeg($target, null, $jpegQuality),
        };
        $encoded = ob_get_clean();

        imagedestroy($source);
        if ($target !== $source) {
            imagedestroy($target);
        }

        return $encoded !== false && $encoded !== ''
            ? new OptimizedImage($encoded, $extension)
            : new OptimizedImage($original, $originalExtension);
    }

    /**
     * Whether an image resource has any pixel that isn't fully opaque —
     * checked with GD's actual alpha values rather than assumed from the
     * file format, since a PNG/GIF/WEBP upload is routinely a flat photo
     * with no transparency actually used. Sampled on a grid (not every
     * pixel) to stay fast on a multi-megapixel image — a real transparent
     * background or icon covers far more than one sample point, so this
     * doesn't need pixel-perfect coverage to be reliable in practice.
     */
    private static function hasRealTransparency($image): bool
    {
        // A palette image with a designated fully-transparent color index.
        if (imagecolortransparent($image) >= 0) {
            return true;
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $step = max(1, (int) (min($width, $height) / 40));

        for ($y = 0; $y < $height; $y += $step) {
            for ($x = 0; $x < $width; $x += $step) {
                // GD's alpha channel ranges 0 (opaque) to 127 (fully
                // transparent) — bits 24-30 of the ARGB value.
                $alpha = (imagecolorat($image, $x, $y) >> 24) & 0x7F;
                if ($alpha > 0) {
                    return true;
                }
            }
        }

        return false;
    }
}

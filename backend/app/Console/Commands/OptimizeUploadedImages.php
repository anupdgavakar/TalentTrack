<?php

namespace App\Console\Commands;

use App\Models\Banner;
use App\Models\Course;
use App\Models\Testimonial;
use App\Support\ImageOptimizer;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * One-time backfill for images uploaded before ImageOptimizer existed
 * (banner/course/testimonial uploads used to be stored at their original,
 * unbounded resolution and, just as often, an unnecessarily large PNG —
 * see ImageOptimizer's own docblock for the real example that surfaced
 * this). New uploads are optimized automatically going forward; this
 * command re-processes whatever is already sitting in storage, so a site
 * that already has real content doesn't have to have every image manually
 * re-uploaded to get the same fix.
 *
 * When an image gets converted to a different format (a flat/opaque PNG
 * becoming a JPEG, the common case), the file is written under a new path
 * and the model's column is updated to match, with the old file deleted —
 * this is the one case where this command changes something other than
 * an image's bytes in place.
 *
 * Safe to run more than once — an image already converted/within-bounds
 * from a previous run stays exactly as it is (there's no format left to
 * convert away from, and nothing left to resize), so re-running this
 * doesn't compound quality loss or do redundant work.
 *
 * Usage: php artisan images:optimize
 *        php artisan images:optimize --dry-run   (report sizes, change nothing)
 */
class OptimizeUploadedImages extends Command
{
    protected $signature = 'images:optimize {--dry-run : Report potential savings without changing any files}';

    protected $description = 'Re-compress and cap the dimensions of already-uploaded banner/course/testimonial images';

    public function handle(): int
    {
        // ImageOptimizer silently hands back the original, unmodified file
        // when the GD extension isn't available (see its own docblock) —
        // deliberately "fail open" so a missing extension can never break an
        // upload. That's the right call for a live request, but it means
        // this command would otherwise report "Processed N images" with a
        // suspiciously flat 0.0% reduction and no explanation. Since this
        // command's entire job is optimizing files, silently doing nothing
        // is worth refusing loudly instead — this is the one gap where a
        // missing GD extension should be impossible to miss.
        if (! function_exists('imagecreatefromstring')) {
            $this->error('The PHP GD extension is not enabled — no images can be optimized.');
            $this->line('Every image below would be copied back unchanged, so nothing was processed.');
            $this->newLine();
            $this->line('To fix this, enable GD in your php.ini:');
            $this->line('  1. Find php.ini (run `php --ini` to see its path).');
            $this->line('  2. Remove the leading ";" from the line ";extension=gd" (or add "extension=gd" if it\'s missing).');
            $this->line('  3. Restart PHP (restart `php artisan serve`, or your local server — Laragon/XAMPP/WAMP — if you use one).');
            $this->line('  4. Confirm it worked: `php -m` should list "gd".');
            $this->line('Then run this command again.');

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');

        $jobs = [
            ['model' => Banner::class, 'column' => 'image', 'maxWidth' => 1920, 'maxHeight' => 1080, 'label' => 'banner'],
            ['model' => Course::class, 'column' => 'image', 'maxWidth' => 1200, 'maxHeight' => 900, 'label' => 'course'],
            ['model' => Testimonial::class, 'column' => 'avatar', 'maxWidth' => 400, 'maxHeight' => 400, 'label' => 'testimonial avatar'],
        ];

        $totalBefore = 0;
        $totalAfter = 0;
        $totalCount = 0;

        foreach ($jobs as $job) {
            [$before, $after, $count] = $this->processModel(...$job, dryRun: $dryRun);
            $totalBefore += $before;
            $totalAfter += $after;
            $totalCount += $count;
        }

        if ($totalCount === 0) {
            $this->info('No images found to process.');

            return self::SUCCESS;
        }

        $this->newLine();
        $this->info(sprintf(
            '%s%d image(s): %s → %s (%.1f%% smaller)',
            $dryRun ? '[dry run] Would process ' : 'Processed ',
            $totalCount,
            $this->formatBytes($totalBefore),
            $this->formatBytes($totalAfter),
            $totalBefore > 0 ? (1 - $totalAfter / $totalBefore) * 100 : 0,
        ));

        if ($dryRun) {
            $this->comment('Run without --dry-run to actually replace the stored files.');
        }

        return self::SUCCESS;
    }

    /**
     * @return array{0: int, 1: int, 2: int} [bytesBefore, bytesAfter, count]
     */
    private function processModel(string $model, string $column, int $maxWidth, int $maxHeight, string $label, bool $dryRun): array
    {
        $disk = Storage::disk('public');
        $bytesBefore = 0;
        $bytesAfter = 0;
        $count = 0;

        /** @var Model $record */
        foreach ($model::query()->whereNotNull($column)->get() as $record) {
            $path = $record->{$column};

            if (! $path || ! $disk->exists($path)) {
                $this->warn("Skipping {$label} #{$record->id}: file not found on disk ({$path}).");

                continue;
            }

            $before = $disk->size($path);

            // Wrap the already-stored file as an UploadedFile so it can go
            // through the exact same ImageOptimizer path a fresh upload
            // does — no separate "optimize an existing file" code path to
            // keep in sync with the real one.
            $absolutePath = $disk->path($path);
            $uploadedFile = new UploadedFile($absolutePath, basename($absolutePath), mime_content_type($absolutePath) ?: null, null, true);

            $optimized = ImageOptimizer::optimize($uploadedFile, $maxWidth, $maxHeight);
            $after = strlen($optimized->data);

            $bytesBefore += $before;
            $bytesAfter += $after;
            $count++;

            // A flat/opaque PNG is routinely converted to JPEG (see
            // ImageOptimizer's docblock) — when that happens, the file has
            // to move to a new path under the new extension; the DB column
            // is updated to match, and the old file is removed so it
            // doesn't linger as an orphan.
            $currentExtension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            $newPath = $currentExtension === $optimized->extension
                ? $path
                : preg_replace('/\.[^.\/]+$/', '.'.$optimized->extension, $path);

            $this->line(sprintf(
                '%s %s #%d: %s → %s%s',
                $dryRun ? '[dry run]' : 'Optimized',
                $label,
                $record->id,
                $this->formatBytes($before),
                $this->formatBytes($after),
                $newPath !== $path ? " ({$currentExtension} → {$optimized->extension})" : '',
            ));

            if (! $dryRun) {
                $disk->put($newPath, $optimized->data);

                if ($newPath !== $path) {
                    $disk->delete($path);
                    $record->{$column} = $newPath;
                    $record->save();
                }
            }
        }

        return [$bytesBefore, $bytesAfter, $count];
    }

    private function formatBytes(int $bytes): string
    {
        return $bytes >= 1_048_576
            ? round($bytes / 1_048_576, 2).' MB'
            : round($bytes / 1024, 1).' KB';
    }
}

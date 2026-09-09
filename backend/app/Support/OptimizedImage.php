<?php

namespace App\Support;

/**
 * Result of ImageOptimizer::optimize() — the re-encoded image bytes, plus
 * the file extension they must actually be stored under.
 *
 * The extension isn't always the source upload's original one:
 * `ImageOptimizer` converts a flat/opaque PNG, GIF or WEBP (one with no
 * real transparency) to JPEG, since that's routinely 5-10x smaller than
 * PNG for photographic content at the exact same resolution — in
 * practice a bigger win than the dimension cap alone (see
 * `ImageOptimizer`'s own docblock for how this was discovered). Every
 * caller must build its storage path from `$result->extension`, never
 * from the original `UploadedFile`'s extension.
 */
final class OptimizedImage
{
    public function __construct(
        public readonly string $data,
        public readonly string $extension,
    ) {
    }
}

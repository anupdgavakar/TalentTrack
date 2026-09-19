<?php

namespace App\Support;

/**
 * The closed set of valid (page, section_key) combinations for PageSection
 * rows — same role as utils/iconMap.js's ICON_NAMES: a curated list rather
 * than a free-text field, so a typo in the admin panel can't create a
 * content block that silently never renders anywhere.
 *
 * Mirrored on the frontend in src/utils/pageSectionKeys.js, which also
 * carries the human-readable label/hint/singleton-vs-repeatable metadata
 * the admin form needs — this file only needs the bare keys, to validate
 * against. If a section_key is ever added, removed, or moved to a
 * different page, update BOTH files — see the frontend file's own comment.
 */
class PageSectionKeys
{
    public const PAGES = ['about', 'contact'];

    public const KEYS = [
        'about' => [
            'hero',
            'intro',
            'why_choose_us_intro',
            'why_choose_us_item',
            'logo_marquee_intro',
            'hiring_partner_logo',
            'approach_intro',
            'approach_card',
            'who_we_work_with_intro',
            'job_seekers_intro',
            'job_seeker_item',
            'employers_intro',
            'employer_item',
            'cta',
        ],
        'contact' => [
            'hero',
            'get_in_touch',
        ],
    ];

    /**
     * All (page, section_key) pairs flattened — not directly used for
     * validation (see PageSectionRequest, which validates `page` and
     * `section_key` together via a closure so an otherwise-valid key isn't
     * accepted under the wrong page), but handy for anything that needs
     * the full set, e.g. the seeder's own sanity check.
     */
    public static function allKeysFor(string $page): array
    {
        return self::KEYS[$page] ?? [];
    }
}

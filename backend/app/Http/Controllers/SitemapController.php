<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Course;
use App\Models\JobPosting;
use Illuminate\Http\Response;

/**
 * GET /sitemap.xml (Phase 12) — deliberately outside `routes/api.php` and
 * the `{success, message, data}` envelope every other endpoint uses:
 * search engines expect plain XML at this path, not JSON. Lists every
 * public page a crawler should index — the static marketing pages, plus
 * every *active* course, job posting and job category — so course/job
 * detail pages get discovered even though nothing on the site links to
 * every single one of them from one crawlable path (they're mostly reached
 * via filtered list pages with pagination).
 *
 * Every `<loc>` points at the frontend (`config('app.frontend_url')`,
 * added in Phase 11), since that's where these pages are actually served
 * from — this API is not a page host.
 *
 * Production note: if the frontend and this API end up on different
 * domains (the default local setup already has them on different ports),
 * a URL only *reliably* counts as that domain's sitemap when it's
 * submitted directly through Google Search Console for the frontend's own
 * property — the `Sitemap:` reference in `frontend/public/robots.txt`
 * (generated at build time, see `frontend/vite.config.js`) is a courtesy
 * for crawlers that follow it, not a substitute for that Search Console
 * submission.
 */
class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $base = rtrim(config('app.frontend_url'), '/');

        $staticPages = [
            ['loc' => '/', 'priority' => '1.0'],
            ['loc' => '/about', 'priority' => '0.6'],
            ['loc' => '/training', 'priority' => '0.9'],
            ['loc' => '/placement', 'priority' => '0.9'],
            ['loc' => '/recruitment', 'priority' => '0.7'],
            ['loc' => '/consulting', 'priority' => '0.7'],
            ['loc' => '/contact', 'priority' => '0.6'],
            // /privacy-policy and /terms are deliberately left out — both
            // are still the Phase 1 placeholder page (noindex'd on the
            // frontend too, see PrivacyPolicyPage.jsx) until real legal
            // copy replaces them.
        ];

        $courses = Course::active()
            ->select('slug', 'updated_at')
            ->get()
            ->map(fn (Course $course) => [
                'loc' => "/training/{$course->slug}",
                'lastmod' => $course->updated_at?->toAtomString(),
                'priority' => '0.8',
            ]);

        $jobCategories = Category::active()
            ->where('type', 'job')
            ->select('slug', 'updated_at')
            ->get()
            ->map(fn (Category $category) => [
                'loc' => "/placement/{$category->slug}",
                'lastmod' => $category->updated_at?->toAtomString(),
                'priority' => '0.6',
            ]);

        $jobPostings = JobPosting::active()
            ->select('slug', 'updated_at')
            ->get()
            ->map(fn (JobPosting $job) => [
                'loc' => "/jobs/{$job->slug}",
                'lastmod' => $job->updated_at?->toAtomString(),
                'priority' => '0.8',
            ]);

        $urls = collect($staticPages)
            ->merge($courses)
            ->merge($jobCategories)
            ->merge($jobPostings)
            ->map(fn (array $url) => [
                'loc' => $base.$url['loc'],
                'lastmod' => $url['lastmod'] ?? null,
                'priority' => $url['priority'],
            ]);

        return response()
            ->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml');
    }
}

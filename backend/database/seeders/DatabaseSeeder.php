<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Course;
use App\Models\JobPosting;
use App\Models\Setting;
use App\Models\Statistic;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Local development / demo data only — every string here is either a
 * clearly-fake credential or copy already flagged as a placeholder
 * elsewhere in the project (matching the frontend's placeholder
 * illustrations and footer copy). Nothing here should be treated as real
 * production content; it exists so `php artisan migrate:fresh --seed`
 * gives a working database to build the API (Phase 4) and admin dashboard
 * (Phase 9) against, and so the client can see Phase 3 actually holding
 * data end to end.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---- Users -------------------------------------------------------
        // DEV-ONLY credentials (password: "password"). Change or remove
        // before any shared/staging/production deploy.
        User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Talent Track Admin',
                'password' => Hash::make('123456789'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'candidate@talenttracktech.local'],
            [
                'name' => 'Demo Candidate',
                'password' => Hash::make('password'),
                'role' => 'candidate',
                'email_verified_at' => now(),
            ]
        );

        // ---- Categories ----------------------------------------------------
        $courseCategories = collect([
            'Web Development', 'Data & Analytics', 'Digital Marketing', 'Cloud & DevOps',
        ])->mapWithKeys(fn (string $name) => [$name => Category::firstOrCreate(
            ['slug' => Str::slug($name)],
            ['type' => 'course', 'name' => $name, 'is_active' => true]
        )]);

        $jobCategories = collect([
            'Information Technology', 'Banking & Finance', 'Sales & Marketing', 'Engineering',
        ])->mapWithKeys(fn (string $name) => [$name => Category::firstOrCreate(
            ['slug' => Str::slug($name)],
            ['type' => 'job', 'name' => $name, 'is_active' => true]
        )]);

        // ---- Courses (Training module, Phase 6) -----------------------------
        $courses = [
            ['title' => 'Full-Stack Web Development', 'category' => 'Web Development', 'level' => 'beginner', 'duration' => '3 months', 'fee' => 24999],
            ['title' => 'Data Analytics with Python', 'category' => 'Data & Analytics', 'level' => 'intermediate', 'duration' => '2 months', 'fee' => 17999],
            ['title' => 'Digital Marketing Certification', 'category' => 'Digital Marketing', 'level' => 'beginner', 'duration' => '6 weeks', 'fee' => 9999],
            ['title' => 'AWS Cloud Practitioner', 'category' => 'Cloud & DevOps', 'level' => 'intermediate', 'duration' => '4 weeks', 'fee' => 12999],
        ];

        foreach ($courses as $c) {
            Course::firstOrCreate(
                ['slug' => Str::slug($c['title'])],
                [
                    'category_id' => $courseCategories[$c['category']]->id,
                    'title' => $c['title'],
                    'short_description' => "Industry-oriented {$c['title']} program, built around real hiring needs.",
                    'description' => "Placeholder course description for \"{$c['title']}\" — replace with real curriculum copy via the admin panel once Phase 9 (Admin dashboard) is built.",
                    'duration' => $c['duration'],
                    'level' => $c['level'],
                    'mode' => 'hybrid',
                    'fee' => $c['fee'],
                    'syllabus' => "Placeholder syllabus outline for \"{$c['title']}\".",
                    'is_featured' => true,
                    'is_active' => true,
                ]
            );
        }

        // ---- Job postings (Placement + Recruitment, Phase 7) ----------------
        $jobs = [
            ['title' => 'Junior Frontend Developer', 'category' => 'Information Technology', 'listing_type' => 'placement', 'job_type' => 'full_time'],
            ['title' => 'Business Development Executive', 'category' => 'Sales & Marketing', 'listing_type' => 'placement', 'job_type' => 'full_time'],
            ['title' => 'Site Reliability Engineer', 'category' => 'Engineering', 'listing_type' => 'recruitment', 'job_type' => 'full_time'],
            ['title' => 'Financial Analyst', 'category' => 'Banking & Finance', 'listing_type' => 'recruitment', 'job_type' => 'contract'],
        ];

        foreach ($jobs as $j) {
            JobPosting::firstOrCreate(
                ['slug' => Str::slug($j['title'])],
                [
                    'category_id' => $jobCategories[$j['category']]->id,
                    'title' => $j['title'],
                    'company_name' => $j['listing_type'] === 'recruitment' ? 'Confidential — Hiring Partner' : 'Talent Track Placement Partner',
                    'location' => 'Pune, Maharashtra',
                    'job_type' => $j['job_type'],
                    'experience_level' => '1-3 years',
                    'salary_min' => 30000,
                    'salary_max' => 60000,
                    'description' => "Placeholder job description for \"{$j['title']}\" — replace via the admin panel once Phase 9 is built.",
                    'requirements' => "Placeholder requirements list for \"{$j['title']}\".",
                    'listing_type' => $j['listing_type'],
                    'is_featured' => true,
                    'is_active' => true,
                    'closing_date' => now()->addMonths(2),
                ]
            );
        }

        // ---- Testimonials (admin-managed, Phase 9/10) ------------------------
        if (Testimonial::count() === 0) {
            Testimonial::factory()->count(3)->create();
        }

        // ---- Banners (mirrors the frontend's former static HERO_SLIDES —
        // Phase 5 made the homepage hero read from this table instead) --------
        // The four illustrations bundled in database/seeders/assets/banners/
        // are the exact same placeholder SVGs the frontend used before Phase
        // 5 (not real photography — still flagged everywhere as a swap-out
        // item). Copying them into the `public` disk here means a fresh
        // `migrate:fresh --seed` renders a real, working hero out of the
        // box instead of a broken image link.
        $bannerAssetDir = database_path('seeders/assets/banners');

        $banners = [
            [
                'eyebrow' => 'Training · Placement · Recruitment · Consulting',
                'title' => 'Build Skills. Get Trained. Get Placed.',
                'description' => 'Industry-oriented technical and professional training — certification courses to corporate programs — built around what employers are actually hiring for.',
                'source_image' => 'training.svg',
                'alt_text' => 'Illustration of a learner studying at a desk with a laptop',
                'primary_cta_label' => 'Explore Training', 'primary_cta_url' => '/training',
                'secondary_cta_label' => 'Find Placement Opportunities', 'secondary_cta_url' => '/placement',
            ],
            [
                'eyebrow' => 'Training · Placement · Recruitment · Consulting',
                'title' => 'Get Placed. Get Ahead.',
                'description' => 'Category-wise job opportunities across IT, banking, sales, engineering and more — with end-to-end placement assistance from resume to offer.',
                'source_image' => 'placement.svg',
                'alt_text' => 'Illustration of two people shaking hands over a job placement',
                'primary_cta_label' => 'Find Placement Opportunities', 'primary_cta_url' => '/placement',
                'secondary_cta_label' => 'Explore Training', 'secondary_cta_url' => '/training',
            ],
            [
                'eyebrow' => 'Training · Placement · Recruitment · Consulting',
                'title' => 'Hire the Right Talent, Faster.',
                'description' => 'We source and screen the right candidates for employers, cutting time-to-hire without cutting quality.',
                'source_image' => 'recruitment.svg',
                'alt_text' => 'Illustration of a recruiter reviewing candidate profiles',
                'primary_cta_label' => 'Partner With Us', 'primary_cta_url' => '/recruitment',
                'secondary_cta_label' => 'Enquire Now', 'secondary_cta_url' => '/contact',
            ],
            [
                'eyebrow' => 'Training · Placement · Recruitment · Consulting',
                'title' => 'Plan Your Next Career Move.',
                'description' => 'One-on-one career and business consulting — dedicated counsellors guide your next step with clarity and confidence.',
                'source_image' => 'consulting.svg',
                'alt_text' => 'Illustration of a career consulting conversation',
                'primary_cta_label' => 'Talk to a Consultant', 'primary_cta_url' => '/consulting',
                'secondary_cta_label' => 'Enquire Now', 'secondary_cta_url' => '/contact',
            ],
        ];

        foreach ($banners as $order => $b) {
            $sourceImage = $b['source_image'];
            unset($b['source_image']);

            $storagePath = "banners/{$sourceImage}";
            if (! Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->put($storagePath, file_get_contents("{$bannerAssetDir}/{$sourceImage}"));
            }

            Banner::firstOrCreate(
                ['title' => $b['title']],
                [...$b, 'image' => $storagePath, 'sort_order' => $order, 'is_active' => true]
            );
        }

        // ---- Statistics (admin-managed homepage stat chips) ------------------
        $stats = [
            ['label' => 'Candidates Placed', 'value' => '500+', 'icon' => 'Briefcase'],
            ['label' => 'Hiring Partners', 'value' => '80+', 'icon' => 'Building2'],
            ['label' => 'Training Programs', 'value' => '25+', 'icon' => 'GraduationCap'],
            ['label' => 'Placement Rate', 'value' => '92%', 'icon' => 'TrendingUp'],
        ];

        foreach ($stats as $order => $s) {
            Statistic::firstOrCreate(
                ['label' => $s['label']],
                [...$s, 'sort_order' => $order, 'is_active' => true]
            );
        }

        // ---- Settings — starting values match the placeholders already in
        // Footer.jsx, so the admin Settings screen (Phase 9) has real rows to
        // edit instead of appearing empty.
        $settings = [
            'footer_address' => '2nd Floor, Tech Park Road, Baner, Pune, Maharashtra 411045',
            'footer_phone' => '+91 12345 67890',
            'footer_email' => 'info@talenttracktech.com',
            'social_facebook_url' => '#',
            'social_instagram_url' => '#',
            'social_linkedin_url' => '#',
            'social_youtube_url' => '#',
            'admin_notification_email' => env('ADMIN_NOTIFICATION_EMAIL', 'admin@talenttracktech.local'),
        ];

        foreach ($settings as $key => $value) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value]);
        }

        // ---- About/Contact page content — split into its own seeder since,
        // unlike the rest of this file, it's meant to also be run standalone
        // against an already-live production database. See
        // PageSectionSeeder's own docblock for why.
        $this->call(PageSectionSeeder::class);
    }
}

<?php

namespace Database\Seeders;

use App\Models\PageSection;
use Illuminate\Database\Seeder;

/**
 * Starter content for the About and Contact pages' admin-editable content
 * blocks (see the create_page_sections_table migration). Split out from
 * the main DatabaseSeeder — unlike that seeder, which is documented as
 * local-dev/demo data only, this one is meant to also be run against an
 * already-live production database (`php artisan db:seed
 * --class=PageSectionSeeder --force`), since a site that already has real
 * banners/courses/leads still needs *some* starting content in this new
 * table — the alternative is an admin opening the new "About Content" /
 * "Contact Content" screens to a blank list and having to write every
 * heading and paragraph from scratch. The copy below is the same real,
 * production-appropriate copy the About/Contact pages shipped with before
 * this became admin-editable — not placeholder/lorem-ipsum text — so
 * running this is a safe, sensible default either way, and every field
 * stays fully editable afterward from the admin dashboard.
 *
 * Idempotent via firstOrCreate keyed on (page, section_key, sort_order),
 * so running it more than once (e.g. once locally, then again after
 * deploying) does not create duplicate rows.
 */
class PageSectionSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAbout();
        $this->seedContact();
    }

    private function seedAbout(): void
    {
        $this->row('about', 'hero', 0, [
            'title' => 'About Talent Track Technologies',
            'subtitle' => 'Training, placement, recruitment and career consulting — under one roof.',
        ]);

        $this->row('about', 'intro', 0, [
            // Two paragraphs, separated by a blank line — AboutPage.jsx
            // splits `body` on a blank line into separate <p> tags (see its
            // `renderParagraphs` helper), so this is also the format an
            // admin should use in the "Introduction" content block's Body
            // field if they want a paragraph break of their own.
            'body' => "Talent Track Technologies was founded on a simple idea: training and hiring shouldn't be two "
                ."disconnected worlds. Most training providers hand you a certificate and wish you luck. Most "
                ."recruiters only look at candidates who already have the exact experience they're hiring for. "
                .'We built our platform to close that gap — pairing practical, job-ready training with a direct '
                .'path into placement, so the skills people learn with us are the skills employers are actually '
                ."hiring for.\n\n"
                ."That's why every course on our platform is built around real, current employer feedback rather "
                .'than a syllabus written once and left to go stale, and why every candidate we put forward has '
                .'already been checked against the actual requirements of the role, not just a keyword match on a '
                .'resume. It\'s also why training and hiring live on the same platform in the first place: a '
                .'candidate who finishes a course with us can move straight into our placement pipeline, and a '
                .'company that hires through us can ask for a training cohort built around exactly what they need '
                .'next.',
        ]);

        // "Why Choose Us?" — rendered on both the homepage and the About
        // page (see frontend WhyChooseUs.jsx), but managed from this one
        // spot on the About Content admin screen so there's a single list
        // to keep up to date rather than two.
        $this->row('about', 'why_choose_us_intro', 0, [
            'title' => 'Why Choose Us?',
        ]);

        $whyChooseUsItems = [
            ['icon' => 'FolderKanban', 'title' => 'Live Industry Projects'],
            ['icon' => 'MessagesSquare', 'title' => 'Mock Interviews'],
            ['icon' => 'FileCheck2', 'title' => 'ATS-Optimized Resume'],
            ['icon' => 'IndianRupee', 'title' => 'Pay After Placement'],
            ['icon' => 'UserCheck', 'title' => 'Dedicated Placement Team'],
            ['icon' => 'PlayCircle', 'title' => 'Free Demo Sessions'],
            ['icon' => 'Briefcase', 'title' => '100% Job Assistance'],
            ['icon' => 'IdCard', 'title' => 'LinkedIn Profile Optimization'],
        ];
        foreach ($whyChooseUsItems as $i => $item) {
            $this->row('about', 'why_choose_us_item', $i, $item);
        }

        // Scrolling company strip on the homepage (LogoMarquee.jsx). The
        // heading is deliberately framed around the *skills/industry* the
        // training targets, not a claim that every listed company has hired
        // graduates or has a formal agreement with Talent Track
        // Technologies — see the entries below, which are text-only
        // (no logo files, since we don't hold rights to these companies'
        // marks) major IT employers in India, shown as context for the
        // kind of roles this training prepares candidates for. If/when a
        // genuine hiring partner signs on, add them the same way and
        // upload their logo from the admin panel — the component renders
        // a logo image automatically once one is set on a row.
        $this->row('about', 'logo_marquee_intro', 0, [
            'title' => 'Top IT Companies Hiring in India',
            'subtitle' => 'Our training is built around the skills these companies are actively hiring for.',
        ]);

        $topItCompanies = [
            'Tata Consultancy Services (TCS)', 'Infosys', 'HCLTech', 'Wipro', 'Tech Mahindra', 'LTIMindtree',
            'Cognizant', 'Capgemini India', 'Accenture in India', 'IBM India', 'Oracle India', 'Microsoft India',
            'Mphasis', 'Persistent Systems', 'Hexaware Technologies', 'Coforge', 'Birlasoft', 'Cyient',
            'KPIT Technologies', 'Zensar Technologies', 'Sonata Software', 'L&T Technology Services (LTTS)',
            'Happiest Minds Technologies', 'Firstsource Solutions', 'Intellect Design Arena',
            'Oracle Financial Services Software (OFSS)', 'Sasken Technologies', 'Newgen Software',
            'Ramco Systems', '3i Infotech',
        ];
        foreach ($topItCompanies as $i => $name) {
            $this->row('about', 'hiring_partner_logo', $i, ['title' => $name]);
        }

        $this->row('about', 'approach_intro', 0, [
            'title' => 'Outcomes over certificates',
        ]);

        $approachCards = [
            [
                'icon' => 'Target',
                'title' => 'Employer-reviewed curriculum',
                'body' => "Every syllabus is checked against what employers are actually hiring for, not just what's trending.",
            ],
            [
                'icon' => 'ClipboardCheck',
                'title' => 'Hands-on, project-based learning',
                'body' => 'Practical projects and assessments built for retention, not passive lectures and a certificate.',
            ],
            [
                'icon' => 'Handshake',
                'title' => 'Every match is human-reviewed',
                'body' => 'Our team checks each application and shortlist against skills, experience and expectations.',
            ],
            [
                'icon' => 'Search',
                'title' => 'Custom cohorts on request',
                'body' => 'Hiring companies can request a training cohort built around their exact requirements.',
            ],
        ];
        foreach ($approachCards as $i => $card) {
            $this->row('about', 'approach_card', $i, $card);
        }

        $this->row('about', 'who_we_work_with_intro', 0, [
            'title' => 'Job seekers and employers, on one platform',
        ]);

        $this->row('about', 'job_seekers_intro', 0, [
            'title' => 'Job seekers',
            'body' => 'We work with people at every stage of their career.',
        ]);

        $jobSeekerItems = [
            'Students preparing for their first role',
            'Working professionals looking to upskill',
            'Career changers exploring something new',
        ];
        foreach ($jobSeekerItems as $i => $body) {
            $this->row('about', 'job_seeker_item', $i, ['body' => $body]);
        }

        $this->row('about', 'employers_intro', 0, [
            'title' => 'Employers',
            'body' => 'We work with companies who need a faster, more reliable way to hire.',
        ]);

        $employerItems = [
            'Companies of all sizes looking to hire faster',
            'Teams that want pre-screened, role-ready candidates',
            'Organizations that need a custom-trained cohort',
        ];
        foreach ($employerItems as $i => $body) {
            $this->row('about', 'employer_item', $i, ['body' => $body]);
        }

        $this->row('about', 'cta', 0, [
            'title' => 'Ready to get started?',
            'body' => "Whether you're building skills, ready to apply, or hiring for your team — Talent Track "
                .'Technologies is ready to help.',
            'primary_label' => 'Enquire Now',
            'primary_url' => '/contact',
            'secondary_label' => 'Explore Training',
            'secondary_url' => '/training',
        ]);
    }

    private function seedContact(): void
    {
        $this->row('contact', 'hero', 0, [
            'title' => 'Contact Us',
            'subtitle' => "Questions about a course, a job opening, or anything else — send us a message and we'll get back to you.",
        ]);

        $this->row('contact', 'get_in_touch', 0, [
            'title' => 'Get in touch',
            'body' => 'Prefer to reach out directly? Our team is available on the details below during business '
                .'hours, Monday to Saturday.',
        ]);
    }

    private function row(string $page, string $sectionKey, int $sortOrder, array $fields): void
    {
        PageSection::firstOrCreate(
            ['page' => $page, 'section_key' => $sectionKey, 'sort_order' => $sortOrder],
            [...$fields, 'is_active' => true]
        );
    }
}

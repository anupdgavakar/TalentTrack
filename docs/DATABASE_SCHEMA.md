# Database Schema (Phase 3)

12 new migrations + 10 new Eloquent models, on top of Laravel's default
`users` table (extended, not replaced). Every table maps directly to a
module in the 15-phase plan, and several are deliberately shaped to match
data the frontend already expects (see the "Frontend alignment" note under
each one) — so wiring up the real API in Phase 4+ is mostly "return this
table as JSON", not a redesign.

## Users (`users`, extended)

Laravel's default table plus `role` (`admin` | `candidate`, default
`candidate`), `phone`, and `is_active`. Two account types only, for now —
platform admins (Phase 9 dashboard) and candidates (people enrolling in
training / applying for jobs). No separate employer login: recruitment and
consulting enquiries are captured as `leads` instead, since nothing in the
brief calls for employer accounts yet. `User` now uses Sanctum's
`HasApiTokens` trait, backed by the new `personal_access_tokens` table
(Sanctum's own migration, included as-is).

## `categories`

One shared table for both Training and Placement categories (`type`:
`course` | `job`) — e.g. "Web Development", "Information Technology",
"Banking & Finance". Keeps the admin's category CRUD (Phase 9) to a single
screen instead of two nearly-identical ones.

## `courses` — Training module (Phase 6)

`category_id` (nullable FK → categories), `title`, `slug`, `short_description`,
`description`, `duration`, `level` (beginner/intermediate/advanced), `mode`
(online/offline/hybrid), `fee`, `image`, `syllabus`, `is_featured`,
`is_active`. Powers `/training` and the homepage's "Featured Training"
section (currently a marked insertion point in `HomePage.jsx`, pending
`GET /api/courses`).

## `job_postings` — Placement + Recruitment module (Phase 7)

**Named `job_postings`, not `jobs`** — Laravel's queue system already owns a
`jobs` table for queued background jobs (see
`0001_01_01_000002_create_jobs_table.php`); reusing that name would have
collided with the framework's own job-queue storage.

`category_id` (nullable FK), `title`, `slug`, `company_name`, `location`,
`job_type` (full_time/part_time/internship/contract), `experience_level`,
`salary_min`/`salary_max`, `description`, `requirements`, `listing_type`
(`placement` | `recruitment` — the same table serves both the public job
board and roles being actively sourced for a client employer),
`is_featured`, `is_active`, `closing_date`.

## `course_enrollments` / `job_applications` — Candidate application system (Phase 8)

Both link back to their parent record (`course_id` / `job_posting_id`,
`cascadeOnDelete`) and optionally a `user_id` (`nullOnDelete` — the public
enrollment/application form doesn't require an account; a logged-in
candidate gets it pre-filled, a guest just supplies contact details
directly on the row). Each has its own `status` workflow — enrollments:
new → contacted → enrolled/rejected; applications: new → shortlisted →
interview → placed/rejected — for the admin dashboard's pipeline views.

## `leads` — Lead management (Phase 10)

Catches everything that isn't a structured enrollment/application: the
general Contact form, Recruitment ("we need to hire") requests, and
Consulting bookings. `type` (recruitment/consulting/training/placement/
general) is what the admin Lead dashboard filters and reports on; `company`
is only meaningful for recruitment leads; `source` records which page/form
it came from.

## `testimonials`, `banners`, `statistics` — admin-managed content (Phase 9/10)

- **`testimonials`** — feeds the existing `TestimonialCard` component:
  name, role/company, quote, avatar, rating (1–5), `is_featured`.
- **`banners`** — the real source for the homepage hero. Column set
  (`eyebrow`, `title`, `description`, `image`, `alt_text`,
  `primary_cta_label`/`_url`, `secondary_cta_label`/`_url`, `sort_order`)
  matches the frontend's `HERO_SLIDES` shape in `HomePage.jsx` exactly, so
  `GET /api/banners` becomes a drop-in replacement for that static array
  with zero changes to `Hero.jsx` or `useCarousel.js`.
- **`statistics`** — feeds `StatsCard`: `label`, `value` (a string, so it
  can hold "500+" or "92%", not just an integer), `icon` (a lucide-react
  icon name), `sort_order`.

## `settings`

Flexible key/value store for the things currently hard-coded as
placeholders in the frontend — footer address/phone/email, social links,
the admin notification email. `Setting::get($key, $default)` /
`Setting::set($key, $value)` (in `app/Models/Setting.php`) read/write
through a forever-cache that's invalidated automatically on save, so
Phase 9 admin edits take effect immediately without a deploy.

## Shared conventions

- **Slugs**: `Category`, `Course`, and `JobPosting` use a small local
  `HasSlug` trait (`app/Models/Concerns/HasSlug.php`) that auto-generates a
  unique `slug` from `title`/`name` on create if one isn't supplied — no
  extra composer package needed for something this small.
- **Soft placeholders, not fake functionality**: `DatabaseSeeder` seeds one
  admin user, one demo candidate, a handful of categories/courses/job
  postings/testimonials/banners/statistics, and starter `settings` rows
  matching the footer placeholders already in `Footer.jsx` — clearly
  commented as local dev/demo data, not production content. Run
  `php artisan migrate:fresh --seed` locally to get a working database.
- **MySQL first, SQLite-friendly**: every column type used here (`enum`,
  `decimal`, `date`, foreign keys) works the same way against SQLite for
  local development — no MySQL-only migration syntax was used.

## What's next (Phase 4)

No routes, controllers, or request validation are added yet — that's
Phase 4 ("Laravel REST API + authentication + authorization"). This phase
is deliberately just the data layer: migrations + models + relationships +
seed data, so the API can be built directly on top of it.

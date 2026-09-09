# Project handover — Talent Track Technologies

This document ties together everything built across all 15 phases of this
project and is the starting point for anyone picking this codebase up —
you, a developer you bring on, or future-you six months from now. Read
this first; it points to everything else.

## What this is

A Training / Placement / Recruitment / Career Consulting platform: a
public marketing site (course catalog, job board, lead-capture forms) with
an admin dashboard behind it for running the day-to-day business, plus a
lightweight account system for candidates to track their own enrollments
and applications.

**Stack:**

- `backend/` — Laravel 12 REST API, MySQL, Laravel Sanctum for
  cookie-based SPA authentication. PHP ^8.2.
- `frontend/` — React 19 + Vite + React Router. Talks to the backend over
  HTTP; not server-rendered.
- No queue worker, no scheduled cron jobs — deliberately, so it runs on
  ordinary shared hosting (see `docs/DEPLOYMENT.md`'s "Background jobs and
  scheduled tasks" section for why).

## Where everything is documented

Six documents cover different audiences — start with whichever matches
what you're trying to do:

| Document | For | Covers |
|---|---|---|
| **`README.md`** (root) | Anyone | Local dev quick-start |
| **`docs/ADMIN_GUIDE.md`** | Whoever runs the site day-to-day | Using every screen in the admin dashboard — no technical background needed |
| **`docs/DEPLOYMENT.md`** | Whoever deploys/maintains it | Step-by-step GoDaddy cPanel hosting setup, from an empty account to a live site |
| **`docs/API.md`** | Developers | Every backend endpoint, request/response shapes, auth flow |
| **`docs/ARCHITECTURE.md`** | Developers | System design, how the pieces fit together |
| **`docs/DATABASE_SCHEMA.md`** | Developers | Tables, columns, relationships |
| **`docs/DESIGN_SYSTEM.md`** | Developers/designers | Colors, typography, spacing, component conventions |
| **`docs/PHASE_PLAN.md`** | Developers | The full build history — every phase, what was built, why, what was verified, and every known open item (see below) |

`docs/PHASE_PLAN.md` is the most detailed of these — it's the working log
this project was built against, phase by phase, and it's the single source
of truth for "why does the code do it this way" questions.

## What's built

Everything through Phase 14 is feature-complete; Phase 15 (this one) was a
final QA pass plus this document and the Admin Guide — no new features. In
brief:

- Public site: homepage, course catalog + detail pages, job board
  (Placement + Recruitment) + detail pages, About/Contact/Consulting
  pages, candidate registration/login/dashboard.
- Lead capture: course enrollment form, job application form (with resume
  upload), and a general contact/enquiry form — all land in the admin
  dashboard's pipeline screens.
- Admin dashboard: full content management (courses, job postings,
  categories, banners, testimonials, statistics, site settings), a
  leads/enrollments/applications pipeline with status tracking, reporting
  with CSV export, and email notifications on new activity.
- Production-readiness: SEO (per-page metadata, structured data, sitemap),
  performance (code-splitting, image loading hints), accessibility
  (skip-links, focus management), security hardening (rate limiting,
  password rules, response headers, scoped validation), and a deployment
  guide + production config templates for GoDaddy cPanel hosting.

## Getting an admin account

There's no public admin sign-up and no in-dashboard way to create one —
see `docs/ADMIN_GUIDE.md`'s "What's not built yet" and `docs/API.md`'s
Authentication section. The first admin account comes from running the
database seeder (`docs/DEPLOYMENT.md` step 5); any additional admin
accounts need a direct database change (setting a user's `role` column to
`admin`) until/unless a user-management screen gets built.

**Before this site is genuinely public**, change the seeded demo admin
password — `admin@talenttracktech.local` / `password` is a known, publicly
documented credential (it was even shown directly on the login screen
during development; Phase 15 removed that from the built site, but the
account and its default password still exist in the database until you
change them).

## Known limitations — read before launch

These are tracked in full detail in `docs/PHASE_PLAN.md`'s "Open items
carried forward" section; here's the short version, roughly in order of
how likely each is to matter to you:

- **Privacy Policy and Terms of Use pages are still placeholders.** These
  need real legal copy from you or your counsel — not something that can
  responsibly be drafted without your input. Both pages are marked
  `noindex` in the meantime so they don't get indexed by search engines
  half-finished.
- **Footer contact details are still placeholders.** Editable from Settings
  in the admin dashboard (`docs/ADMIN_GUIDE.md` covers this) — just need
  your real address, phone, and social links entered. (The brand logo, by
  contrast, is done — your real logo is now live across the site; see
  `docs/DESIGN_SYSTEM.md`'s "Logo" section if it ever needs updating.)
- **No automated test suite.** You chose to prioritize security hardening
  and bug-fixing over writing tests in Phase 13. Every phase was still
  manually verified (linting, builds, and — this phase — an independent
  QA pass), but there's no regression suite a future change could be
  checked against automatically. Worth considering as its own follow-up
  project if this app keeps growing.
- **Public form submission rate limits are still just Laravel's default**
  (60/minute), not the tighter, purpose-built limits added to login/
  register in Phase 13. Not tightened yet since there's no evidence of
  abuse, and an overly strict limit risks blocking a real burst of
  interest (e.g., a social post driving several enquiries from the same
  office network at once). Worth revisiting if spam becomes a problem.
- **Deleting a job posting with applications leaves their uploaded resume
  files on disk**, orphaned but harmless (never served to anyone, just
  unused disk space over time). A proper fix means walking related records
  before delete rather than relying on the database's cascade delete.
- **Search engines that don't run JavaScript, and some social-media
  link-preview bots, see generic page titles/descriptions** rather than
  each page's specific SEO metadata (Google itself does render JavaScript
  and sees the real metadata). Fixing this fully needs server-side
  rendering, a bigger architectural change — worth it only if social
  share-card appearance or non-Google search traffic turns out to matter.
- **PHP 8.2** is used because that's what was available during
  development; it's past its official security-support window. Upgrading
  to PHP 8.3+ and Laravel 13 is a documented, low-effort bump whenever
  convenient (`docs/PHASE_PLAN.md` has the specifics) — not urgent, but
  worth scheduling.

None of these block a launch — they're documented so nothing here is a
surprise, not because any of them need fixing before you go live.

## This phase's QA pass

Before writing this document, Phase 15 included a final independent review
of the whole app looking for bugs beyond what was already tracked above.
Four real issues were found and fixed:

1. The admin login page displayed the seeded demo admin's real email and
   password in plain text on every visit — removed from the production
   build (see "Getting an admin account" above for why you should still
   change that password).
2. Clearing a category's "Slug" field while editing it silently saved an
   empty slug instead of regenerating one, which could break that
   category's filter/link on the public site — fixed to match how
   Courses/Job Postings already handle this.
3. The Leads CSV export was vulnerable to formula/CSV injection from
   public form submissions (a name like `=HYPERLINK(...)` could execute as
   a formula when opened in Excel/Sheets) — fixed with standard
   sanitization.
4. A job posting's "Closing Date" field was captured and shown but never
   actually enforced — a posting stayed live and kept accepting
   applications indefinitely past its closing date unless someone
   remembered to also switch it inactive by hand. Fixed so closing date is
   now enforced automatically, and the admin Job Postings list now shows a
   "Closed (past deadline)" status so this is visible at a glance.

Full detail on all four, plus the standard verification steps (`php -l`,
`npm run lint`, `npm run build`) run afterward, are in `docs/PHASE_PLAN.md`
's Phase 15 section.

## Post-handover: faster image loading + editable About/Contact pages

Since the initial handover above, two more things were built — full
details in `docs/PHASE_PLAN.md`'s "Post-handover updates" section:

- **Faster-loading images.** Course/banner/testimonial/page-content
  uploads are now automatically resized and recompressed on save, which
  is what was making the homepage hero slider slow to load. If this site
  already has real images uploaded from before this change, run
  `php artisan images:optimize` once (see `docs/DEPLOYMENT.md`'s
  maintenance section) to shrink those too — new uploads don't need this,
  only pre-existing ones.
- **About Content / Contact Content admin screens.** The About and
  Contact pages' text, icons and photos are now editable from the admin
  dashboard instead of being hardcoded — see `docs/ADMIN_GUIDE.md`'s
  "About Content and Contact Content" section. If this database predates
  this change, run `php artisan migrate` and
  `php artisan db:seed --class=PageSectionSeeder --force` once (see
  `docs/DEPLOYMENT.md`) to add the new table and starter content — until
  then, both pages keep showing their previous hardcoded copy
  automatically, so nothing breaks in the meantime.

## Next steps

1. Follow `docs/DEPLOYMENT.md` to get this live on your GoDaddy hosting
   account, if it isn't already.
2. Change the seeded admin password (see above).
3. Fill in real footer contact details, social links, and the admin
   notification email from the Settings screen (`docs/ADMIN_GUIDE.md`).
4. Get Privacy Policy / Terms of Use copy from your counsel and swap it
   in.
5. If this site was live before the post-handover update above, run the
   `php artisan migrate`, `db:seed --class=PageSectionSeeder --force`, and
   `images:optimize` commands mentioned there.
6. Read through `docs/ADMIN_GUIDE.md` once end-to-end so your team knows
   where everything lives before you start using it for real.

For anything beyond that — a bug you find, a new feature, a question about
how something works — `docs/PHASE_PLAN.md` and `docs/API.md` are the
places to start; between the phase-by-phase history and the endpoint
reference, most "why does this work this way" questions are already
answered there.

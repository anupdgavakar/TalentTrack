# Phase Plan & Status

Tracking the 15-phase build agreed with the client. Each phase is developed,
tested, summarized and explicitly approved before the next one starts.

| # | Phase | Status |
|---|-------|--------|
| 1 | Project setup + requirements + architecture | **Done — verified** |
| 2 | Brand design system + complete UI/UX foundation | **Done — verified** |
| 3 | Laravel setup + database + migrations + models | **Done — pending client-side verification** |
| 4 | Laravel REST API + authentication + authorization | **Done — pending client-side verification** |
| 5 | React public website | **Done — pending client-side verification** |
| 6 | Training module (admin course management) | **Done — pending client-side verification** |
| 7 | Placement + Job module (admin job posting management) | **Done — pending client-side verification** |
| 8 | Candidate application system (candidate accounts + "My Dashboard") | **Done — pending client-side verification** |
| 9 | Admin dashboard (site content management: Banners, Testimonials, Statistics, Settings) | **Done — pending client-side verification** |
| 10 | Lead management + reporting | **Done — pending client-side verification** |
| 11 | Email notifications | **Done — pending client-side verification** |
| 12 | SEO + performance + accessibility | **Done — pending client-side verification** |
| 13 | Security + testing + bug fixing | **Done — pending client-side verification** |
| 14 | Production deployment preparation | **Done — pending client-side verification** |
| 15 | Final QA + documentation + handover | **Done — pending client-side verification** |

## Phase 1 verification (backend, run locally by the client)

- `composer install` — succeeded (Laravel 12, PHP 8.2.12)
- `php artisan key:generate` — succeeded
- `php artisan migrate` — succeeded
- `php artisan serve` → `GET /` — returned `{"success":true,"message":"Talent Track Technologies API"}`

Backend and frontend are both confirmed working end-to-end on the client's
machine: `npm install` + `npm run dev` served the routing skeleton at
`http://localhost:5173` with no console errors, alongside the backend
running via `php artisan serve`.

## Phase 2 verification

- `npm run build` — clean
- `npm run lint` (oxlint) — clean
- Visually verified via headless Chromium screenshots at desktop (1440px),
  tablet (768px) and mobile (390px), including the mobile nav panel open —
  see `docs/DESIGN_SYSTEM.md` "Verification performed" for the two issues
  found and fixed this way.

See `docs/DESIGN_SYSTEM.md` for the full color/type/spacing token reference,
the component list, and what's real vs. still placeholder on the Home page.

## Phase 3 — database layer

12 new migrations (categories, courses, job_postings, course_enrollments,
job_applications, leads, testimonials, banners, statistics, settings,
Sanctum's personal_access_tokens, plus a users-table extension) and 10 new
Eloquent models with relationships, scopes, a shared slug-generation trait,
and a `DatabaseSeeder` with realistic placeholder demo data. Full schema
reference: `docs/DATABASE_SCHEMA.md`.

**Verified in the sandbox**: every new/modified PHP file passes `php -l`
(no syntax errors) — that's as far as this environment can check, since
`vendor/` isn't installed here (same packagist restriction as Phase 1).

**To verify locally** (same pattern as Phase 1):
```
cd backend
composer install        # only needed if package.json/composer.json changed — it hasn't this phase
php artisan migrate:fresh --seed
php artisan migrate:status
```
Expect all 15 migrations (3 default + 12 new) listed as `Ran`, and the
seeder to finish without errors. Optional spot-check: `php artisan tinker`
→ `\App\Models\Course::count()`, `\App\Models\Banner::active()->count()`,
etc. should return non-zero.

No API routes/controllers are added yet — that's Phase 4.

## Phase 4 — REST API + authentication + authorization

`routes/api.php` now exposes the full API on top of the Phase 3 database:
Sanctum SPA (cookie-based) auth for candidates, public read endpoints for
every content type (courses, job postings, categories, banners,
testimonials, statistics, public settings), public write endpoints for the
candidate application system and lead capture, and a complete admin CRUD
surface behind `auth:sanctum` + a new `admin` role-check middleware. Every
response uses one consistent `{ success, message, data }` envelope,
including Laravel's own framework-thrown errors (validation, 401, 404) —
see `app/Traits/ApiResponse.php` and the exception rendering added to
`bootstrap/app.php`. Full endpoint-by-endpoint reference:
`docs/API.md`.

**Verified in the sandbox**: all 51 new/modified PHP files pass `php -l`
clean, plus a focused static-consistency review (route-model-binding
parameter names against controller signatures, FormRequest validation keys
against model `$fillable`/migration columns, relationship/scope method
names against what the models actually define) — no issues found. As with
Phases 1 and 3, this environment can't install Composer packages
(packagist is blocked here) or boot the app, so this is the ceiling of
what can be checked before you run it.

**To verify locally**:
```
cd backend
php artisan storage:link      # one-time — needed for image/resume URLs to resolve
php artisan migrate:fresh --seed
php artisan serve
```
Then, from another terminal (or Postman):
```
curl -s http://localhost:8000/api/courses | python -m json.tool
curl -s http://localhost:8000/api/banners | python -m json.tool
curl -s -X POST http://localhost:8000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"type":"general","name":"Test Lead","email":"test@example.com","message":"hello"}'
```
Each should return `{"success":true, ...}` with real seeded data. Login
needs the CSRF-cookie step described in `docs/API.md`'s Authentication
section — easiest to test that part once the frontend's `AuthContext.jsx`
is wired up to it (Phase 5) rather than by hand with curl.

## Phase 5 — React public website

Every public page now talks to the real Phase 3/4 API instead of static
placeholder data, using two small shared hooks (`useFetch` for GET,
`useSubmitForm` for POST forms) plus a new `pages.css` for page-level layout
(header banners, filter bars, detail two-column layouts, lead-capture form
cards) on top of the Phase 2 design system.

**What changed:**
- **Auth plumbing fixed to match the real backend**: `services/api.js` and
  `context/AuthContext.jsx` were originally scaffolded for bearer-token auth;
  the actual Phase 4 backend is Sanctum SPA (cookie) auth, so both were
  rewritten — `ensureCsrfCookie()` hits `/sanctum/csrf-cookie` before every
  login/register POST, `withCredentials: true` is set, and `AuthContext`
  checks `/auth/me` on mount to restore an existing session.
- **Home** — hero banners, stats, featured testimonials and featured courses
  now come from `GET /api/banners`, `/statistics`, `/testimonials`,
  `/courses` respectively; sections that have no data yet simply don't
  render, rather than showing an empty block.
- **Training** — real course listing with search + category filter and
  pagination (`GET /api/courses`); **Course detail** — real course page with
  an inline enrollment form (`POST /api/course-enrollments`).
- **Placement** — job categories + featured openings (`GET
  /api/job-postings?listing_type=placement`); **Placement category** — same
  listing filtered to one category, with pagination; **Job detail** — full
  job posting with an inline application form including resume upload
  (`POST /api/job-applications`, multipart).
- **Recruitment** and **Consulting** — informational content plus a shared
  lead-capture form component (`components/forms/LeadForm.jsx`) posting to
  `POST /api/leads` with `type=recruitment` / `type=consulting`.
- **Contact** — the same lead form (`type=general`) plus live office details
  from `GET /api/settings/public`; also honors `?course=<slug>` on the URL
  (the "Enquire Now" link on a course card lands here) by prefilling the
  message with that course's title.
- **About** — real static content page, no API calls.
- **Footer** — office address/phone/email/social links now come from `GET
  /api/settings/public` instead of being hard-coded, with the old hard-coded
  values kept only as the fallback shown before that request resolves.
- **404 page** — small polish pass (icon, message, links back to Home/Contact).

**Scope note — candidate login/register deferred to Phase 8**: every public
form (course enrollment, job application, leads) is guest-friendly by
backend design, so no account is required to use the site. Building the
candidate-facing login/register *pages* was intentionally left for Phase 8
(candidate application system), where a logged-in candidate's own
application history and dashboard will make an account worth having.
`AuthContext.jsx` itself (login/register/logout/session-check) is already
built and ready for those pages to call.

**Bug fixed along the way**: the Phase 3 seeder set each demo banner's
`image` to a placeholder path with no file behind it — harmless while the
homepage hero used static frontend assets, but once Home was wired to
`GET /api/banners` this would have shown as a broken image instead of the
illustration it showed before. Fixed by bundling the same 4 placeholder SVGs
into `backend/database/seeders/assets/banners/` (git-committable, unlike
`storage/app/public/`) and having `DatabaseSeeder` copy them into storage at
seed time.

**Verified in the sandbox**: `npm run build` (clean) and `npm run lint` /
oxlint (clean — two pre-existing informational warnings unrelated to this
phase's files, noted below) in `frontend/`, plus a field-by-field check of
every new page's API calls against the actual Laravel resources/requests
(query params, response field names, validation field names) to catch
mismatches before you run it. The backend seeder change passes `php -l`.
As with earlier phases, this sandbox can't install Composer packages or run
`php artisan`/`npm run dev` together against a live database — that's the
local verification step below.

*Pre-existing lint warnings, not introduced this phase*: `useFetch.js`
(`react/set-state-in-effect` — standard data-fetching hook pattern) and
`AuthContext.jsx` (`react/only-export-components` — the file exports both
the `AuthProvider` component and the `useAuth` hook). Both are informational
only; oxlint reports zero errors.

**To verify locally**:
```
# Terminal 1
cd backend
php artisan migrate:fresh --seed
php artisan storage:link      # if you haven't already — needed for banner images to resolve
php artisan serve

# Terminal 2
cd frontend
npm run dev
```
Then open `http://localhost:5173` and check: the homepage hero shows real
banner images (not broken image icons); Training and Placement list real
seeded courses/jobs and their search/filter/pagination work; opening a
course or job and submitting the enrollment/application form shows a
success message and the row appears in the database (`course_enrollments` /
`job_applications` tables); the footer shows the seeded office
address/phone/email; Recruitment, Consulting and Contact forms each submit
successfully into the `leads` table with the right `type`.

## Phase 6 — Training module (admin course management)

You chose the "Admin course management" scope for this phase: since Phase 5
already covered the public-facing side of Training (course listing, detail
page, enrollment form), Phase 6 adds the admin screens to actually manage
that content, built ahead of the full Phase 9 admin dashboard shell.

**What's new:**
- **Real admin login** (`/admin/login`) — email/password against the same
  Sanctum auth from Phase 4/5. Logging in with a non-admin account (e.g. the
  seeded candidate) is rejected with a clear message rather than granting
  access. An already-logged-in admin visiting `/admin/login` is bounced
  straight to the dashboard.
- **Route protection** — the entire `/admin/*` section (except the login
  page itself) is now behind a guard (`routes/ProtectedRoute.jsx`) that
  checks for a valid session and an `admin` role, redirecting to the login
  page otherwise. Previously these routes had no protection at all.
- **Admin layout** — a real sidebar + topbar shell (`layouts/AdminLayout.jsx`)
  replacing the one-line placeholder from Phase 1, with navigation for
  Dashboard/Courses/Categories/Enrollments, a "View site" link, and logout.
  Phase 9 extends this same shell with more sections rather than replacing
  it.
- **Dashboard** — quick counts (courses, training categories, enrollments by
  status) and a table of the 5 most recent enrollments.
- **Courses** — paginated list with a status/featured badge per row, and a
  full create/edit form (category, title, slug, duration, level, mode, fee,
  image upload, short/full description, syllabus, featured/active toggles),
  plus delete with a confirmation dialog.
- **Training Categories** — list + a modal create/edit form (name, slug,
  description, active toggle) and delete. Scoped to `type=course` categories
  only this phase — job categories get the equivalent screen in Phase 7.
- **Course Enrollments** — list with status tabs (New/Contacted/Enrolled/
  Rejected) and an inline dropdown to update each enrollment's status
  on the spot, so you can work through incoming enrollments without leaving
  the list.

**No backend changes were needed this phase** — the admin API for courses,
categories and course-enrollments was already built in Phase 4
(`routes/api.php`'s `admin` group); this phase is the frontend that finally
uses it.

**Bug fixed after your first live test**: signing in threw "CSRF token
mismatch" on every attempt. Root cause: axios 1.x stopped automatically
attaching the `X-XSRF-TOKEN` header on cross-origin requests unless a
separate `withXSRFToken: true` option is set — `withCredentials: true`
alone used to be enough in older axios versions, but no longer is. Since
the frontend (`:5173`) and backend (`:8000`) are different origins even on
the same `localhost` host, every login/logout and every admin create/edit/
delete request was silently missing that header. This is exactly the kind
of bug that only shows up once a flow is actually exercised in a browser —
static review of the code can't catch an axios version's runtime default
behavior. Fixed in `frontend/src/services/api.js` by adding
`withXSRFToken: true` to the shared axios instance.

**Performance fix after your feedback that the Dashboard felt slow**: it
originally loaded its stat cards with 7 separate API requests (course
count, category count, and one request per enrollment status, plus recent
enrollments). Each of those is a full Laravel bootstrap + database round
trip, and `php artisan serve`'s built-in dev server is single-threaded, so
it queues requests rather than truly running them in parallel — 7 requests
firing "at once" from the browser actually ran one after another on the
server. Added a single aggregated endpoint (`GET /admin/dashboard/stats`,
using one grouped SQL query for the status counts instead of four separate
ones) and rewrote the Dashboard to use it — down to 1 request instead of 7.

**Instant admin navigation, after your follow-up that clicking between
Dashboard/Courses/Categories/Enrollments still felt slow**: a real
network request to a database can't be instant, but repeat visits within
the same browser session now can be. Added a small in-memory cache
(`utils/adminCache.js` + `hooks/useCachedFetch.js`, stale-while-revalidate)
that the Dashboard, Courses, Categories and Enrollments screens now use —
the first time you open one of them it loads normally, but every visit
after that in the same session renders instantly from cache while quietly
re-checking the server in the background. Every admin action that changes
that data (adding/editing/deleting a course, adding/editing/deleting a
category, updating an enrollment's status) explicitly clears the relevant
cache entries first, so you never see stale data after making a change —
just a normal (fast) reload of the screen you just acted on.

**A known limitation, by design**: the course/category forms only send a
field to the server when it has a value, so that an empty field is left out
of the request rather than risk sending an empty string somewhere the
backend's validation doesn't expect one (e.g. the `level`/`mode` `in:` rules).
The trade-off is that once a course's category, level or mode is set, this
first version of the form can't be used to clear it back to blank — only to
change it to a different value. Worth revisiting if that turns out to
matter in practice.

**Verified in the sandbox**: `npm run build` (clean) and `npm run lint` /
oxlint (clean — same two pre-existing informational warnings as Phase 5,
plus one of the same kind in the new `CourseFormPage.jsx`, all standard
data-loading-hook patterns, not errors) in `frontend/`. Also traced every
new admin screen's request against the actual Phase 4 admin
controllers/requests (field names, validation rules, the `_method=PUT`
override needed to send a file on an update) to catch mismatches up front.
This sandbox still can't run the app end-to-end (no Composer/`npm run dev`
here) — that's the verification step below.

**To verify locally** (same servers as Phase 5's verification):
```
# Terminal 1
cd backend
php artisan serve

# Terminal 2
cd frontend
npm run dev
```
Then open `http://localhost:5173/admin/login` and sign in with the seeded
demo admin account: `admin@talenttracktech.local` / `password`. From there:
add a course with an image, edit it, confirm it now shows correctly on the
public Training page; add and edit a training category; submit a course
enrollment from the public site (as in Phase 5's verification) and confirm
it appears on the Enrollments screen, then change its status and confirm it
sticks after a refresh; try deleting a course or category and confirm the
confirmation dialog appears before anything is removed.

## Phase 7 — Placement + Job module (admin job posting management)

Mirrors Phase 6's structure: the public-facing Placement/Recruitment pages
and application form were already built in Phase 5, so this phase adds the
admin screens to manage that content, reusing the same admin API (built in
Phase 4) and the same UI patterns (list/form pages, caching, cache
invalidation) established in Phase 6.

**What's new:**
- **Job Postings** — paginated list with category/listing-type/status
  columns and a featured badge, and a full create/edit form (category,
  title, slug, company name, location, job type, experience level, salary
  range, description, requirements, listing type, closing date, featured/
  active toggles), plus delete with a confirmation dialog. No image field on
  job postings, so unlike Courses this form posts plain JSON — no
  `_method=PUT` file-upload spoofing needed.
- **Job Categories** — the same list-plus-modal-form screen as Training
  Categories, scoped to `type=job`. Rather than duplicate the ~250 lines of
  category-management logic a second time, it was refactored out into one
  shared `components/admin/CategoryManager.jsx` that both
  `CategoriesListPage.jsx` (`type=course`) and the new
  `JobCategoriesListPage.jsx` (`type=job`) now render as thin wrappers
  around, with per-type heading/description/copy passed as props. Training
  Categories' behavior is unchanged — this was a pure refactor.
- **Job Applications** — list with status tabs (New/Shortlisted/Interview/
  Placed/Rejected), an inline dropdown to update status on the spot, and a
  "View" link to each applicant's uploaded resume (opens in a new tab).
  Mirrors Course Enrollments' pattern from Phase 6.
- **Dashboard, nav and routing extended, not replaced** — the admin sidebar
  (`AdminLayout.jsx`) now has Job Postings/Job Categories/Applications
  entries alongside the Phase 6 Training links; `AppRoutes.jsx` registers
  the four new routes (`/admin/jobs`, `/admin/jobs/new`,
  `/admin/jobs/:id/edit`, `/admin/job-categories`, `/admin/applications`)
  under the same protected admin branch. The Dashboard now shows two
  sections — "Training" (unchanged from Phase 6) and "Placement &
  Recruitment" (jobs count, job categories count, applications by status,
  and a "Recent job applications" table) — both backed by one extended
  `GET /admin/dashboard/stats` response rather than a second endpoint, for
  the same single-request-instead-of-many reason as Phase 6.

**No new backend routes were needed** — `/admin/job-postings` (full CRUD)
and `/admin/job-applications` (`index/show/update`) already existed from
Phase 4, and job categories reuse the same `/admin/categories` endpoint
Training Categories uses, filtered by `type`. The only backend change was
extending `DashboardController::stats()` (added in Phase 6) to also return
`jobs_count`, `job_categories_count`, `applications_by_status` and
`recent_applications` alongside the existing Training fields.

**Verified in the sandbox**: `npm run build` (clean) and `npm run lint` /
oxlint (clean — same pre-existing informational warnings as Phases 5/6,
plus one of the same kind in the new `JobPostingFormPage.jsx`, all standard
data-loading-hook patterns, not errors) in `frontend/`; `php -l` on the
extended `DashboardController.php` (clean); and a field-by-field check of
the new admin screens' requests against the actual Phase 4
`Admin\JobPostingRequest` validation rules and the `JobApplicationResource`/
`JobPostingResource` response shapes. As with every prior phase, this
sandbox can't run the app end-to-end (no Composer/`npm run dev` here) —
that's the local verification step below.

**To verify locally** (same two servers as Phases 5/6):
```
# Terminal 1
cd backend
php artisan serve

# Terminal 2
cd frontend
npm run dev
```
Sign in at `http://localhost:5173/admin/login` with the seeded admin
account, then: add a job posting, edit it, confirm it now shows correctly
on the public Placement/Recruitment pages; add and edit a job category and
confirm it filters job postings correctly; submit a job application from
the public site (resume upload included, as in Phase 5's verification) and
confirm it appears on the Applications screen with a working "View" resume
link, then change its status and confirm it sticks after a refresh; open
the Dashboard and confirm the new Placement & Recruitment stat cards and
"Recent job applications" table show correct numbers; try deleting a job
posting or job category and confirm the confirmation dialog appears first.

## Phase 8 — Candidate application system (candidate accounts + "My Dashboard")

Phase 5 deliberately left candidate login/register out (every public form
already worked without an account) with the note that it wasn't worth
building until there was a payoff for having one. This phase is that
payoff: a candidate can now create an account, sign in, and see their own
enrollment/application history in one place — and every enrollment or
application form on the site now recognizes a signed-in candidate.

**What's new:**
- **Candidate Login / Register** (`/login`, `/register`) — real forms
  against the Sanctum auth already built in Phase 4/5
  (`AuthContext.jsx`'s `login`/`register` were wired and ready, just had no
  page calling them). Unlike Admin Login, these live inside the normal
  `PublicLayout` (site header/footer stay visible) since signing up is
  still just part of browsing the site, not a separate portal. Any account
  can sign in at `/login`, including an admin one — it's routed to
  `/admin/dashboard` instead of the candidate dashboard automatically.
- **My Dashboard** (`/dashboard`) — a signed-in candidate's own course
  enrollments and job applications, each with a status badge (same
  New/Contacted/Enrolled/Rejected and New/Shortlisted/Interview/Placed/
  Rejected pipelines the admin screens use) and, for applications, a link
  back to the resume they uploaded. Protected by the same
  `routes/ProtectedRoute.jsx` guard the admin section uses — generalized
  this phase to take a `redirectTo` prop (`/login` here, `/admin/login` for
  admin) instead of being hard-coded to the admin login page.
- **Header** — now auth-aware: a "Log In" button for guests, or the
  candidate's first name (linking to their dashboard) plus a logout button
  once signed in — on both desktop and the mobile nav panel. Admin accounts
  see the same treatment, just pointed at `/admin/dashboard`.
- **Course enrollment and job application forms prefill for signed-in
  candidates** — name/email/phone are filled in from the account instead of
  retyped, and the "no account needed" hint switches to a note that the
  submission will show up on their dashboard. Guests see no change at all;
  submitting still works exactly as it did in Phase 5.

**Backend — one new endpoint, no new tables:** `course_enrollments` and
`job_applications` already had a `user_id` column and were already
attaching it automatically for a signed-in submitter (Phase 4). All this
phase added was `GET /me/dashboard`
(`Api\Candidate\DashboardController`, behind `auth:sanctum` only — no
`admin` role check, since this reads the current user's own records) that
returns their enrollments and applications as one response, reusing the
existing `CourseEnrollmentResource`/`JobApplicationResource`. Deliberately
unpaginated, unlike the admin list endpoints — a candidate's own history is
a handful of rows, not worth paginating.

**Verified in the sandbox**: `npm run build` (clean) and `npm run lint` /
oxlint (clean — same pre-existing informational warnings as every prior
phase, plus two of the same kind in the newly-added prefill effects in
`CourseDetailPage.jsx`/`JobDetailPage.jsx`, all the same standard
data-loading-hook pattern, not errors) in `frontend/`; `php -l` on the new
`Candidate\DashboardController.php` and the updated `routes/api.php`
(clean). As with every phase, this sandbox can't run the app end-to-end —
that's the local verification step below.

**To verify locally** (same two servers as every phase since 5):
```
# Terminal 1
cd backend
php artisan serve

# Terminal 2
cd frontend
npm run dev
```
Register a new account at `http://localhost:5173/register`, confirm you
land on `/dashboard` already signed in and it shows two empty states (no
enrollments/applications yet); enrol in a course and apply for a job while
signed in, then refresh `/dashboard` and confirm both now show up with a
"New" status badge; log out from the header and confirm the enrollment/
application forms go back to the guest "no account needed" copy; log back
in and confirm the same account's history is still there. Also confirm the
existing admin login (`admin@talenttracktech.local` / `password`) still
works unchanged at `/admin/login`, and that signing in with it via the new
`/login` form redirects to `/admin/dashboard` instead of the candidate one.

## Phase 9 — Admin dashboard (site content management)

The core admin shell — login, sidebar/nav, the live Dashboard stats page —
was already built across Phases 6/7 while doing Training and Placement, so
"Admin dashboard" for this phase meant something more specific: the four
public-site content types that already had a full admin API since Phase 4
(Banners, Testimonials, Statistics, Settings) but no admin screen to manage
them from, so an admin editing the homepage hero, testimonials, stat
counters, or the footer's contact/social details had no way to do it
short of editing the database directly. You confirmed this scope over
"Dashboard polish/analytics" and "Admin user management" when asked.

**What's new:**
- **Banners** (`/admin/banners`) — list + create/edit form for the
  homepage hero slides: eyebrow, title, description, image (required on
  create, same upload pattern as Courses), alt text, two optional CTA
  buttons (label + link each), display order, and active/inactive.
- **Testimonials** (`/admin/testimonials`) — list + create/edit form:
  name, role, company, quote, an optional photo, a 1–5 star rating,
  featured/active toggles, and display order.
- **Statistics** (`/admin/statistics`) — list + modal form (no separate
  route, same pattern as Categories) for the homepage stat counters:
  value, label, an icon picked from the fixed set `utils/iconMap.js`
  already supports (exposed as `ICON_NAMES` this phase, with a live icon
  preview in the form), display order, and active/inactive.
- **Settings** (`/admin/settings`) — one bulk form instead of a list,
  since settings are key/value pairs, not records: office address/phone/
  email and the four social links (the same keys `Footer.jsx` has read
  from `GET /settings/public` since Phase 5 — editing them here now
  actually changes the live footer), plus a notification-email field that
  isn't used by anything yet but is in place for Phase 11 (email
  notifications) to read from later.
- **Nav** — the admin sidebar gets four new entries (Banners,
  Testimonials, Statistics, Settings) alongside the existing Training/
  Placement sections.

**Backend bug fixed along the way**: `TestimonialResource` and
`StatisticResource` are shared between the public read endpoints and the
new admin endpoints (the same pattern `BannerResource` already used), but
they'd only ever been shaped for the public side — neither exposed
`is_active` or `sort_order`, so the new admin list/edit screens would have
had no way to show or prefill either field. Fixed by adding both fields to
each resource; harmless on the public payload since the public controllers
already filter to `is_active = true` and apply `sort_order` themselves, so
nothing public-facing changes.

**A known limitation, carried over from Phase 6's course form**: the
Banner/Testimonial forms only send a field to the server when it has a
value, so once a testimonial's rating (or a banner's optional CTA) is set,
this version of the form can't clear it back to blank — only change it to
a different value.

**Verified in the sandbox**: `npm run build` (clean) and `npm run lint` /
oxlint (clean — same pre-existing informational warnings as every prior
phase; one new one surfaced and was fixed rather than left in, see below)
in `frontend/`; `php -l` on both modified resource files (clean). As with
every phase, this sandbox can't run the app end-to-end — that's the local
verification step below.

*Lint fix, not a pre-existing warning*: the Statistics form initially
picked its icon preview component with `const PreviewIcon = getIcon(...)`
followed by `<PreviewIcon />`, which oxlint's `static-components` rule
flags as "defining a new component every render" (it can't tell `getIcon`
is just a lookup returning an existing lucide export). Rewritten to build
the icon via `createElement(getIcon(...), props)` instead, which sidesteps
the false positive without changing behavior.

**To verify locally** (same two servers as every phase since 5):
```
# Terminal 1
cd backend
php artisan serve

# Terminal 2
cd frontend
npm run dev
```
Sign in at `/admin/login`, then: add a banner with an image and both CTA
buttons, confirm it appears on the homepage hero in the right order; add a
testimonial with a photo and a rating, confirm it shows on the homepage
(and with "Featured" checked, that it's part of the featured set); add a
statistic and confirm its icon renders correctly on the homepage stats
strip; change the office phone/address and a social link in Settings, save,
and confirm the site footer updates immediately; try deleting a banner,
testimonial, or statistic and confirm the confirmation dialog appears
first.

## Phase 10 — Lead management + reporting

Leads submitted from the Recruitment, Consulting, Training (course
enquiry) and general Contact forms had a full admin API since Phase 4
(`/admin/leads` — index/show/update) but no admin screen, so they only
existed as database rows. This phase adds that screen, plus a Reports page
— scoped to summary counts and a CSV export rather than charts, per your
choice when asked ("Summary stats + CSV export" over "Visual charts" or
skipping reporting for now).

**What's new:**
- **Leads** (`/admin/leads`) — paginated list with status tabs (New/In
  Progress/Converted/Closed) and a type filter (Recruitment/Consulting/
  Training/Placement/General), an inline status dropdown per row, and a
  "View" action that opens the full enquiry — every field including the
  full message, which the table itself only shows truncated.
- **Reports** (`/admin/reports`) — an optional date-range filter (defaults
  to all-time) applied to three summary panels: Leads (total, broken down
  by type and by status), Course Enrollments (by status), and Job
  Applications (by status) — all from one aggregated backend endpoint,
  same reasoning as the Phase 6/7 dashboard-stats endpoint. Also an
  "Export CSV" button on the Leads panel that downloads every lead in the
  selected date range as a CSV file (id, type, name, email, phone,
  company, message, status, source, submitted-at).
- **Nav** — the admin sidebar gets "Leads" (grouped near Enrollments/
  Applications) and "Reports" (at the end) entries.
- **Cache correctness**: changing a lead's, enrollment's, or application's
  status from any admin screen now also invalidates the Reports cache, so
  the by-status breakdowns on `/admin/reports` never show a stale count
  after you've just changed one elsewhere.

**Backend — one new controller, no new tables**: `Api\Admin\ReportController`
adds `GET /admin/reports/summary` (grouped-count queries per model, same
pattern as the Phase 6/9 dashboard/stats endpoints) and
`GET /admin/reports/leads/export` (a streamed CSV response). The export
endpoint is fetched via the same authenticated axios instance as
everything else (`responseType: "blob"`, then a client-side download
trigger) rather than a plain link, since a plain `<a href>` to a
cross-origin API URL would need to separately carry the Sanctum session
cookie correctly — the existing axios setup already handles that.

**Verified in the sandbox**: `npm run build` (clean) and `npm run lint` /
oxlint (clean — same pre-existing informational warnings as every prior
phase, no new ones) in `frontend/`; `php -l` on `ReportController.php` and
the updated `routes/api.php` (clean). As with every phase, this sandbox
can't run the app end-to-end — that's the local verification step below.

**To verify locally** (same two servers as every phase since 5):
```
# Terminal 1
cd backend
php artisan serve

# Terminal 2
cd frontend
npm run dev
```
Submit a lead from the Recruitment, Consulting, and Contact pages (as in
Phase 5's verification), then sign in at `/admin/login` and confirm all
three appear on `/admin/leads` with the right type; change one's status
from the list and confirm the badge updates; click "View" on another and
confirm the full message shows in the modal; filter by type and by status
tab and confirm the list narrows correctly. Then open `/admin/reports`,
confirm the counts match what you just created, set a date range that
excludes today and confirm the counts drop to zero, then click "Export
CSV" and confirm a file downloads with the right rows.

## Phase 11 — Email notifications

New leads, course enrollments, and job applications were saved to the
database but nobody was told — an admin only found out by checking the
Leads/Enrollments/Applications screens. This phase closes that gap: the
admin (or whichever address is configured) now gets an email the moment
any of those three public forms is submitted. You confirmed "Admin alerts
only" as the scope for this phase over also emailing candidates a
confirmation, or emailing them again on every status change — both remain
open for a future phase if wanted.

**What's new:**
- **One shared mailable** (`app/Mail/AdminNotification.php`) behind all
  three alert types, rendered from a single Blade view
  (`resources/views/emails/admin-notification.blade.php`) — a navy header
  bar, heading, intro line, a table of label/value fields (blank fields are
  skipped), and an optional "View in Admin" button linking straight to the
  relevant admin screen. One template instead of three near-identical ones.
- **`App\Services\AdminNotifier::send()`** — the single entry point the
  three public controllers (`LeadController`, `CourseEnrollmentController`,
  `JobApplicationController`) call right after saving a record. It looks up
  who should receive the email (`admin_notification_email` in the
  `settings` table — editable from `/admin/settings` since Phase 9 — falling
  back to the `ADMIN_NOTIFICATION_EMAIL` `.env` value if nothing's been set
  there yet), and does nothing if neither is configured.
- **Multiple recipients, comma-separated** — `.env.example` already
  documented `ADMIN_NOTIFICATION_EMAIL` as accepting a comma-separated list;
  `AdminNotifier` splits, trims, and filters that into a real array of
  addresses before calling `Mail::to()`, so `"a@x.com, b@x.com"` correctly
  emails both instead of being treated as one malformed address.
- **Settings screen updated** (`/admin/settings`) — the "Notify this
  address" field (built but inert since Phase 9) is now live, switched to
  accept multiple comma-separated addresses (`<input type="email"
  multiple>` for native validation), with copy explaining what it's for.
- **A failed send never breaks the public form**: `AdminNotifier::send()`
  wraps the actual `Mail::to()->send()` call in a try/catch and logs any
  failure (`Log::error`, with recipients/heading/error message) rather than
  letting it bubble up — by the time this runs, the candidate's
  lead/enrollment/application is already saved, so a misconfigured or
  down mail server shouldn't turn their successful submission into a 500
  error.

**A deliberate design choice, worth knowing about**: these emails send
synchronously (the mailable does *not* implement `ShouldQueue`), not
queued. The project's default `QUEUE_CONNECTION` is `database`, which needs
a worker (`php artisan queue:work`) actually running to process anything —
and nothing else in this project's local-verification workflow (just
`php artisan serve` + `npm run dev`) runs one. A queued mail would silently
sit in the `jobs` table instead of reaching the log where you can see it,
breaking the "run the two dev servers and it just works" verification
pattern every phase so far has relied on. Worth revisiting in Phase 14
(production deployment), once a real mail provider and a queue worker are
both in the picture and a slightly slower form-submit response is an
acceptable trade for not blocking the request on an SMTP round trip.

**No real mail credentials needed for now**: `.env.example` has had
`MAIL_MAILER=log` since early phases specifically for this — with it set,
Laravel writes the full rendered email (subject, headers, HTML body) to
`storage/logs/laravel.log` instead of actually sending it, so there's
nothing to configure to verify this phase locally. Swapping in a real
transactional provider (Postmark, SES, etc.) is a `.env` change only,
whenever one's picked.

**Verified in the sandbox**: `npm run build` (clean) and `npm run lint` /
oxlint (clean — same pre-existing informational warnings as every prior
phase, no new ones; the `SettingsPage.jsx` change didn't introduce anything
new) in `frontend/`; `php -l` on every new/modified backend file (`Mail/
AdminNotification.php`, `Services/AdminNotifier.php`, the three controllers,
`config/app.php`, `config/mail.php`) — all clean. As with every phase, this
sandbox can't run the app end-to-end (no Composer here, no mail actually
sent) — that's the local verification step below.

**To verify locally** (same two servers as every phase since 5):
```
# Terminal 1
cd backend
php artisan serve

# Terminal 2
cd frontend
npm run dev
```
Sign in at `/admin/login`, go to Settings, and enter your own address (or
several, comma-separated) in "Notify this address," then save. Submit a
lead from Contact/Recruitment/Consulting, enroll in a course, and apply for
a job from the public site (as in earlier phases' verification), then open
`backend/storage/logs/laravel.log` after each and confirm a new email log
entry appears with the right subject ("New lead: …" / "New course
enrollment: …" / "New job application: …"), the right fields, and a working
"View in Admin" link. Then clear the Settings field, leave
`ADMIN_NOTIFICATION_EMAIL` unset in `.env` too, submit another lead, and
confirm nothing errors and no notification is logged (the graceful
no-recipients-configured path). Optionally, temporarily set
`MAIL_MAILER=smtp` with bad credentials, submit a lead, and confirm the
lead still saves and the public form still shows success — only
`storage/logs/laravel.log` shows the caught send failure.

## Phase 12 — SEO + performance + accessibility

This phase bundles three different concerns rather than one domain, so you
chose "Comprehensive pass on all three" over doing just one of them this
phase. The codebase already had a solid accessibility foundation from
earlier phases (labeled forms with `aria-describedby`, visible
`:focus-visible` rings, `prefers-reduced-motion` support, alt text) — the
real gaps were SEO (every page shared one static `<title>`/description) and
that nothing was code-split (a public visitor downloaded the entire admin
section's code on every visit).

**SEO — what's new:**
- **Per-page titles, meta descriptions, canonical links, Open Graph and
  Twitter Card tags** (`hooks/useSeo.js`) — every public page, the
  candidate login/register/dashboard pages, and the admin login page now
  call this with their own content instead of all sharing the one static
  title/description baked into `index.html`. Pages behind auth
  (`/admin/*` beyond login) are left alone — a crawler without a session
  can't reach their content anyway.
- **`noindex`** on pages with nothing useful for a search result to point
  at: the 404 page, admin/candidate login and register, the candidate
  dashboard, and — a real gap this phase surfaced — **Privacy Policy and
  Terms of Use, which are still the Phase 1 placeholder** ("Content for
  this page will be implemented in a later phase"). Indexing a thin,
  incomplete legal page would be actively bad for SEO and misleading to a
  visitor; carried forward below until real legal copy exists.
- **JSON-LD structured data** (`hooks/useJsonLd.js`): an `Organization`
  schema site-wide (name, logo, address/phone/email from the same
  `/settings/public` endpoint the footer already reads, social links as
  `sameAs`), a `Course` schema on each course detail page, and a
  `JobPosting` schema on each job detail page (title, description,
  `datePosted`, `employmentType` mapped from the `job_type` enum,
  `validThrough`, `baseSalary` when set). These back Google's rich-result
  types for courses and jobs.
- **`GET /sitemap.xml`** (`backend/app/Http/Controllers/SitemapController.php`,
  `routes/web.php` — plain XML outside the `api/*` JSON envelope, since
  that's what crawlers expect at this path) — lists every static page plus
  every *active* course, job posting and job category, so pages that
  aren't reachable from one crawlable path (mostly found via filtered,
  paginated list pages) still get discovered.
- **`robots.txt`** — allows everything except `/admin/`, `/dashboard`,
  `/login`, `/register` (thin/private, not worth indexing), and references
  the sitemap above. Frontend `public/` files are copied verbatim with no
  way to interpolate an env var into them, so the real version (pointing at
  the actual backend origin) is generated at build time by a small Vite
  plugin (`vite.config.js`'s `generateRobotsTxt`) that derives the backend
  origin from the same `VITE_API_BASE_URL` every API call already uses;
  `public/robots.txt` itself is only the `npm run dev` fallback.

**A known limitation, stated plainly rather than glossed over**: this is a
client-side-rendered SPA, so all of the above (titles, meta tags, JSON-LD)
is written by JavaScript after the page loads, not present in the initial
HTML response. Google's crawler renders JavaScript and picks these up
fine, but simpler crawlers and most social-media unfurl bots (Slack,
WhatsApp, older Facebook/Twitter scrapers) don't execute JS and will only
ever see the static defaults in `index.html`. Properly fixing that needs
server-side rendering or prerendering — a real architecture change, out of
scope for this phase's pass. Also: the `JobPosting` schema's `jobLocation`
is a best-effort mapping of one free-text `location` string into
`addressLocality` (not a fully structured address, since that's all the
database stores), and hardcodes `addressCountry: "IN"` — not guaranteed to
pass Google's Rich Results Test on every listing, but a reasonable
approximation for a India-based client.

**Performance — what's new:**
- **Route-based code-splitting** (`React.lazy`, `routes/lazyPages.js` +
  `routes/AppRoutes.jsx`) — every route except the homepage is now lazy,
  with one shared `<Suspense>` boundary wrapping `<Outlet />` in both
  `PublicLayout` and `AdminLayout` (plus a small dedicated one for
  `/admin/login`, which sits outside both layouts). `lazyPages.js` exists
  as its own file because oxlint's `react-refresh/only-export-components`
  rule flags a file that mixes component-like bindings with non-component
  exports (`AppRoutes.jsx` also exports the router config) — its own
  suggested fix is exactly this: move the components out.
- **Measured effect**: the main JS chunk dropped from 487.72 kB (141.93 kB
  gzip) — the entire app in one file — to 280.79 kB (91.16 kB gzip) plus a
  93.27 kB (30.94 kB gzip) shared chunk of common dependencies, with every
  other page (all 20+ admin screens, every public page) now its own small
  chunk (0.3–6.6 kB) fetched only when its route is visited. A first-time
  visitor browsing the public site no longer downloads any of the admin
  section's code at all.
- **Image loading hints**: `fetchPriority="high"` on the homepage hero
  image (the page's LCP candidate — the opposite of lazy-loading: this
  tells the browser to fetch it *before* lower-priority resources) and
  `loading="lazy" decoding="async"` on the footer logo and every admin
  table thumbnail (Courses/Banners/Testimonials list screens) — the app
  has very few images overall (course/job cards are icon-based, not
  photo-based), so this is a small but complete pass over every `<img>`
  that isn't already handled correctly.

**Accessibility — what's new:**
- **Skip-to-content link** on both `PublicLayout` and `AdminLayout` — the
  first Tab stop on any page, invisible until focused, then jumps a
  keyboard user straight to `<main>` (given `id="main-content"
  tabIndex={-1}` so the link has something focusable to target) instead of
  making them tab through the entire header/sidebar nav first.
- **Modal focus trap + focus return** (`components/ui/Modal.jsx`, shared by
  every admin modal — category add/edit, the Statistics form, the Leads
  detail view, and `ConfirmDialog`) — Tab/Shift+Tab now cycles within the
  open dialog instead of walking focus out into the page behind the
  overlay, focus moves into the dialog when it opens (so screen readers
  announce it), and closing it — via Escape, the × button, or an action
  button — returns focus to whatever triggered it. Previously the dialog
  itself only closed on Escape/overlay-click with no focus management at
  all.

**Verified in the sandbox**: `npm run build` (clean) and `npm run lint` /
oxlint (clean — same pre-existing informational warnings as every prior
phase, no new ones; the code-split refactor initially introduced 28 new
`only-export-components` warnings, fixed by extracting `lazyPages.js` as
described above, then re-verified clean) in `frontend/`; `php -l` on
`SitemapController.php`, `routes/web.php`, and
`resources/views/sitemap.blade.php` (clean) in `backend/`. Bundle-size numbers above are read
directly from `npm run build`'s own output, not estimated. As with every
phase, this sandbox can't run the app end-to-end (no Composer here, so
`sitemap.xml`'s actual XML output against real seeded data hasn't been
fetched and eyeballed) — that's part of the local verification below.

**To verify locally** (same two servers as every phase since 5):
```
# Terminal 1
cd backend
php artisan serve

# Terminal 2
cd frontend
npm run dev
```
Open a few different pages (Home, Training, a course detail page, Contact)
and check the browser tab title changes to match each page, and that
"View Page Source" → search "og:" shows the Open Graph tags (they won't
show in the *rendered* DOM inspector's Elements tab misleadingly early,
but will be there once the page has mounted — check `document.head` in the
console, or use a tool like Facebook's Sharing Debugger, if you want to
confirm what a non-JS crawler would NOT see vs. what a JS-rendering one
would). Visit `http://localhost:8000/sitemap.xml` directly and confirm it
lists your seeded courses/jobs with real slugs. Open the Network tab,
reload the homepage, and confirm you do NOT see any `admin`-prefixed JS
chunk load — then click through to `/admin/login` and confirm its chunk
loads only then. On any admin screen with a modal (e.g. Categories → Add
Category, or Leads → View), open it and press Tab repeatedly — focus
should stay inside the dialog and never reach the page behind it — then
close it and confirm focus lands back on the button you clicked to open
it. Load any page and immediately press Tab once — a "Skip to main
content" link should appear at the top-left; pressing Enter should jump
focus past the header.

## Phase 13 — Security + testing + bug fixing

Like Phase 12, this bundles three different things under one phase name.
You chose "Security + bug-fixing pass, skip automated tests" over adding a
test suite this phase — automated tests remain a real option for a future
phase, discussed below.

**Security — what's new:**
- **Login rate limiting** (`app/Providers/AppServiceProvider.php`,
  `routes/api.php`) — every route already gets Laravel's default
  `throttle:api` (60 requests/min per user or IP, applied automatically),
  which is fine for ordinary use but far too loose for a login form: 60
  password guesses per minute against one account is a real brute-force
  window. `POST /auth/login` now additionally gets a named `login` limiter
  (5/min, keyed by **email + IP together** — not just IP, which would let
  one attacker spray guesses across many accounts at a normal-user rate; not
  just email, which a distributed attacker could route around). `POST
  /auth/register` gets a looser `register` limiter (10/min per IP) against
  automated fake-account creation.
- **Stronger password rule** (`app/Http/Requests/Auth/RegisterRequest.php`)
  — was a bare `min:8`, which `"12345678"` or `"aaaaaaaa"` satisfied.
  Switched to Laravel's `Password` rule object requiring letters *and*
  numbers on top of the same 8-character minimum. Deliberately not adding
  symbols or `->uncompromised()` (a Have I Been Pwned lookup on every
  signup) — enough to meaningfully raise the bar without turning
  registration into a frustrating form or adding an external API dependency
  to the signup path nobody asked for.
- **Security response headers** (`app/Http/Middleware/SecurityHeaders.php`,
  applied globally in `bootstrap/app.php`) — `X-Content-Type-Options:
  nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy:
  strict-origin-when-cross-origin`, and a `Permissions-Policy` opting out of
  camera/microphone/geolocation. None of these existed before; Laravel
  doesn't set any of them by default. No Content-Security-Policy — this API
  serves JSON (plus the one small XML sitemap route), so a CSP belongs in
  the *frontend's* HTML hosting config instead, a Phase 14 decision once
  hosting is chosen.
- **`npm audit`**: 0 vulnerabilities in the frontend's actual installed
  dependencies, run for real in this sandbox (unlike `composer audit`,
  which needs Composer/packagist access this sandbox doesn't have — that
  check is part of the local verification steps below instead).
- **A production security checklist**, since several of these settings are
  correct for local dev and *must* change before going live — see
  `.env.example`'s own comments (added this phase) plus the summary here:
  - `APP_DEBUG` must be `false` in production — `true` shows full stack
    traces, file paths, and query bindings in error responses.
  - `SESSION_SECURE_COOKIE` must be `true` once served over HTTPS (`false`
    is correct for local `http://localhost` — a browser won't even store a
    Secure-flagged cookie over plain http, which would break login).
  - `CORS`/`SANCTUM_STATEFUL_DOMAINS`/`FRONTEND_URL` need the real
    production frontend domain (already flagged in "Open items" below,
    since Phase 10).
  - Already correct and worth knowing about rather than re-deciding:
    `SESSION_HTTP_ONLY=true` (default), `SESSION_SAME_SITE=lax` (default),
    CORS `allowed_origins` already scoped to `FRONTEND_URL` rather than `*`.

**Bug fixing — four real bugs found and fixed**, via an independent review
pass (a subagent given the codebase fresh, specifically told to skip
anything already in this file's "Open items" and to only report findings
it could back with a concrete reachable scenario, not theoretical
concerns):
1. **Deleting a course silently deletes its enrollments too** (a database
   foreign-key cascade, `course_enrollments.course_id`), but the admin
   Courses screen's delete handler only invalidated the Courses and
   Dashboard caches — if the Enrollments or Reports screen had been viewed
   earlier in the session, it kept showing rows/counts for enrollments that
   no longer existed, and clicking a now-phantom enrollment's status
   dropdown would 404. Fixed by also invalidating `/admin/course-enrollments`
   and `/admin/reports`, and by updating the delete confirmation's message
   to actually say enrollments will be deleted too — an admin should know
   that before confirming, not discover it after.
2. **The same bug, for deleting a job posting → its applications**
   (`job_applications.job_posting_id` cascades the same way) — same fix
   (`/admin/job-applications` + `/admin/reports` invalidation, updated
   confirmation message) in `JobPostingsListPage.jsx`.
3. **A draft (inactive) course or job posting could still be enrolled
   in/applied to** (`app/Http/Requests/CourseEnrollmentRequest.php`,
   `JobApplicationRequest.php`) — the validation only checked the row
   *exists*, not that it's active, so a course an admin hasn't published
   yet still had a guessable sequential ID that `POST /course-enrollments`
   would happily accept. Fixed by scoping the `exists` validation rule to
   `is_active = true`, so a draft behaves like it doesn't exist yet — which
   is what "draft" should mean.
4. **Category name uniqueness wasn't scoped by type**
   (`app/Http/Requests/Admin/CategoryRequest.php`) — naming a course
   category "IT" blocked naming an unrelated job category "IT" too, even
   though the database itself only enforces uniqueness on `slug`, not
   `name`. Fixed by scoping the uniqueness check to the category's own
   `type`.

**A known limitation surfaced but not fixed this phase**: the cascade
deletes above also silently orphan uploaded job-application resume files
in storage (the database foreign key cascade happens at the SQL level, so
no Eloquent model event runs to clean up the file). Fixing that properly
means overriding the delete flow to walk related records and remove their
files first — a real change, not a one-line fix, so it's carried forward
below rather than rushed.

**On automated tests** (the pillar this phase's scope skipped): the
backend already has the standard Laravel/PHPUnit scaffold
(`backend/tests/`, `phpunit.xml`) with just the two default example tests,
untouched since Phase 1. This sandbox cannot run PHPUnit — the same
Composer/packagist restriction that's applied to every backend phase — so
any tests written here could only be checked with `php -l` (syntax), not
actually executed to confirm they pass, unlike the frontend, where `npm`
works and a real test runner (Vitest) could be installed and its tests
genuinely run and verified in this sandbox. That asymmetry, and the extra
maintenance surface a test suite adds, is why this was offered as a
separate scope option rather than bundled in by default — happy to build
either (or both) as their own phase/follow-up if wanted.

**Verified in the sandbox**: `npm run build` (clean) and `npm run lint` /
oxlint (clean — same pre-existing informational warnings as every prior
phase, no new ones) in `frontend/`; `php -l` on every new/modified backend
file (`AppServiceProvider.php`, `SecurityHeaders.php`, `bootstrap/app.php`,
`routes/api.php`, `RegisterRequest.php`, `CourseEnrollmentRequest.php`,
`JobApplicationRequest.php`, `Admin/CategoryRequest.php`) — all clean;
`npm audit` — 0 vulnerabilities, run for real. As with every phase, this
sandbox can't run the app end-to-end (no Composer here, so the rate
limiter and validation changes haven't been exercised against a live
request) — that's the local verification step below.

**To verify locally** (same two servers as every phase since 5):
```
# Terminal 1
cd backend
php artisan serve

# Terminal 2
cd frontend
npm run dev
```
Try logging in with a wrong password 6 times in a row within a minute —
the 6th attempt should return a 429 ("Too Many Attempts") instead of the
usual "Invalid email or password," and it should clear again after a
minute. Try registering with password `"testtest"` (letters only, no
numbers) and confirm it's rejected, then `"test1234"` and confirm it's
accepted. Open any page's Network tab and check the response headers for
`X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff`. Create a
course, set it to inactive (uncheck "Active" in the edit form) without
adding it to any public listing, then try `POST /api/course-enrollments`
directly (Postman/curl) with that course's `id` — confirm it's now
rejected with a validation error instead of succeeding. Create a course
category and a job category with the same name and confirm both save
successfully. Enroll a candidate in a course, open the Enrollments screen
so it's cached, then delete that course from the Courses screen and
confirm the confirmation dialog now mentions enrollments, and that the
Enrollments screen no longer shows the now-deleted enrollment after the
delete (rather than a stale cached row).

## Phase 14 — Production deployment preparation

Hosting target confirmed by the client: **GoDaddy Web Hosting (cPanel)** —
Linux/Apache shared hosting. Rather than write deployment guidance from
assumptions about a commercial hosting product, every specific claim below
about GoDaddy's actual capabilities/limits was verified via web search
against GoDaddy's own current documentation (and, for the Composer-memory
issue, a corroborating community report) before being written into any
file — consistent with this project's policy of not guessing about
present-day facts that could have changed.

**What was built:**

- **`frontend/public/.htaccess`** — Apache rewrite rules so a direct visit
  or refresh on any React Router route other than `/` (e.g. `/training`,
  `/admin/dashboard`) doesn't 404 at the server. GoDaddy's Web Hosting
  (cPanel) is Apache-based (confirmed by the pre-existing
  `backend/public/.htaccess`'s own `mod_rewrite` syntax, which is standard
  cPanel/Apache, not Nginx), so an Apache-syntax rewrite file is the right
  fix, not an Nginx `try_files` equivalent. Also sets a one-year cache
  header on hashed build assets (`dist/assets/*` — safe, since Vite gives
  every build new filenames) and an explicit no-cache header on
  `index.html` (so a redeploy is picked up immediately rather than serving
  a stale shell that references a previous build's now-gone asset files).
  Verified with an actual `npm run build` that Vite 8 correctly copies this
  dotfile from `public/` into `dist/.htaccess` — not assumed, since older
  Vite versions have had inconsistent dotfile-copying behavior.
- **`frontend/.env.production.example`** — the two build-time values
  (`VITE_API_BASE_URL`, `VITE_SITE_URL`) a real deploy needs, with
  comments explaining these get baked into the built JS (no server to read
  them at runtime, unlike the backend), so changing either means a rebuild
  and re-upload.
- **`frontend/.gitignore` fix** — it previously had no pattern excluding
  `.env`/`.env.production` at all; only `*.local`, which only matches
  filenames literally ending in `.local` (`.env.local`), not a plain
  `.env` or `.env.production`. A real production env file could have been
  committed by accident. Added `.env` / `.env.*` with explicit
  `!.env.example` / `!.env.production.example` exceptions, matching the
  pattern `backend/.gitignore` already had correctly.
- **`backend/.env.production.example`** — a full production-ready copy of
  `.env.example` (deliberately not a diff, so there's one file to fill in,
  not two to reconcile), with GoDaddy-specific comments throughout:
  - The cPanel MySQL naming convention (both database name and username
    get prefixed with the cPanel account username + underscore).
  - `MAIL_HOST` left as an explicit `REPLACE_WITH_YOUR_SMTP_HOST`
    placeholder rather than a guessed hostname — researched hostnames
    turned out to be specific to GoDaddy's separately-branded
    Workspace/Professional Email product, not confirmed identical to the
    SMTP relay for the free mailboxes that ship with Web Hosting/cPanel
    plans (the product actually being targeted), so the file points to
    cPanel's Email Accounts → "Connect Devices" page instead, which is
    always account-specific and authoritative.
  - `MAIL_PORT=587` with `MAIL_SCHEME=null` as the default (STARTTLS,
    auto-negotiated), with a comment on switching to `MAIL_PORT=465` +
    `MAIL_SCHEME=smtps` if the mailbox's own settings page specifies port
    465 instead — these two ports use genuinely different TLS handshakes
    (implicit vs. STARTTLS-upgraded), so the scheme has to match the port,
    not be left to guesswork.
  - A note on GoDaddy's documented outbound relay limit (500/day per
    mailbox, 500/hour account-wide, applies to PHP-generated mail) versus
    a different, lower figure that applies only to the unrelated
    Workspace Email product — deliberately not conflated.
  - `FRONTEND_URL` documented as needing to stay a **single** URL (unlike
    `SANCTUM_STATEFUL_DOMAINS`, which genuinely is comma-separated) — it's
    read as-is by `config('app.frontend_url')` and used directly in
    `SitemapController` and the admin-notification `ctaUrl` links, so a
    comma-separated value there would corrupt those links rather than
    just widen CORS. The guide recommends picking one canonical www/
    non-www form and redirecting the other to it, which sidesteps needing
    multiple CORS origins at all.
  - `QUEUE_CONNECTION=database` kept as-is with a note explaining why:
    nothing in this app actually queues a job (Phase 11's admin
    notification email is deliberately synchronous), which is good, since
    GoDaddy shared hosting doesn't support long-running background
    processes (a `queue:work` daemon) at all.
- **`docs/DEPLOYMENT.md`** (new) — the full step-by-step GoDaddy cPanel
  deployment guide: prerequisites (PHP 8.2+ selection, SSH availability
  check), why the backend's `vendor/` folder must be built locally and
  uploaded rather than running `composer install` on the server itself
  (GoDaddy's shared-hosting plans are resource-capped tightly enough —
  512MB–2GB RAM depending on plan, per GoDaddy's own published limits —
  that Composer is a known-flaky, sometimes-killed process there),
  database/subdomain/upload steps, migrating with both an SSH and a
  no-SSH path, building and uploading the frontend, SSL, a table of every
  domain-related env value that needs a real value before going live, a
  post-deploy checklist (including a note that `config:cache` freezes
  `env()` values and needs re-running after any later `.env` edit), an
  email/SMTP section, an explanation of why no queue worker or cron job is
  needed for this app specifically, and a troubleshooting section covering
  the most likely failure modes (wrong document root, unwritable
  `storage/`, missing `.htaccess`, CORS/Sanctum domain mismatches).

**Verification performed:**

- `php -l` across every file in `backend/app`, `backend/config`,
  `backend/routes` — clean (no new PHP was written this phase; this
  re-confirms nothing regressed).
- `npm run lint` in `frontend/` — same pre-existing `set-state-in-effect`/
  `only-export-components` informational warnings as every prior phase,
  no new ones.
- `npm run build` in `frontend/` — clean, and used to concretely verify
  (via `ls -la dist/.htaccess`) that the new `.htaccess` is actually
  copied into the build output rather than assuming Vite's `public/`
  handling covers dotfiles.
- Everything specific to GoDaddy's product (Apache vs. Nginx, resource
  limits, Composer behavior, email relay limits, SSH availability, PHP
  version selection) was checked against current sources via web search
  before being written into `docs/DEPLOYMENT.md` or the `.env.production.
  example` files, rather than answered from training-data priors — GoDaddy's
  hosting products and their limits are the kind of fact that changes over
  time.

**What still needs the client, and can't be verified from this sandbox:**
an actual GoDaddy cPanel account to follow `docs/DEPLOYMENT.md` against —
this sandbox has no access to GoDaddy hosting and can't dry-run the upload/
subdomain/SSL steps, so, as with every phase's backend work, this is
"done — pending client-side verification," specifically by actually
deploying and working through the guide's post-deploy checklist.

## Phase 15 — Final QA + documentation + handover

Scope confirmed by the client: a full independent QA pass, a new
non-technical Admin Guide, and a closing handover document (over two
lighter options that would have skipped one or the other).

**QA pass:** used a subagent for a fresh, independent review across the
whole app (both `backend/` and `frontend/`, all 14 prior phases) rather
than relying solely on my own read of code written across the whole
project — the same approach Phase 13's bug-fixing pass used. It was
explicitly told what NOT to re-report (everything already listed in "Open
items carried forward" below, plus generic non-actionable suggestions like
"add tests"), to keep findings concrete and high-confidence. It returned 4
findings; all 4 were independently verified (reading the actual files/line
numbers, and in three cases tracing the data flow between frontend and
backend before concluding it was real) and all 4 were genuine bugs, now
fixed:

1. **Admin login page leaked the seeded demo admin's real credentials.**
   `frontend/src/pages/admin/LoginPage.jsx` unconditionally rendered
   `admin@talenttracktech.local` / `password` — the exact account
   `DatabaseSeeder` creates, and the only account `docs/DEPLOYMENT.md` told
   a client to use. Any anonymous visitor to `/admin/login` could read
   working admin credentials off the page and log in with full admin
   access. Fixed by gating the block behind `import.meta.env.DEV` (Vite's
   standard "only in the dev server" flag) — verified with an actual
   `npm run build` that the string no longer appears anywhere in `dist/`.
   **The seeded password itself is unchanged and still needs to be changed
   by the client before real launch** — see `HANDOVER.md`.
2. **Clearing a category's Slug field on edit silently saved an empty
   slug**, unlike the Course/Job Posting forms, which already omit empty
   fields from their update request specifically to avoid this. An empty
   slug made that category's public filter option collide with "All
   categories" (Training page) or produce a broken `/placement/` link with
   no slug (Placement page). Fixed `CategoryManager.jsx`'s submit handler
   to use the same "omit empty fields" pattern the other admin forms
   already use, rather than changing backend slug-regeneration behavior
   (which would have been a broader change affecting Course/JobPosting/
   Category alike, for a bug that's specific to how one form built its
   request).
3. **Leads CSV export (`/admin/reports/leads/export`) was vulnerable to
   CSV/formula injection.** `name`, `email`, `phone`, `company`,
   `message`, and `source` on a lead are all free text submitted
   anonymously via the public `POST /leads` endpoint, with nothing
   stopping a value like `=HYPERLINK("http://evil.example","Click")` —
   which Excel/Sheets/LibreOffice evaluate as a formula on open, not
   display as text. Fixed with the standard mitigation (OWASP's CSV
   Injection guidance): any of those fields starting with `=`, `+`, `-`,
   `@`, tab, or CR now gets a leading `'` prepended before being written to
   the CSV, forcing it to be read back as plain text.
4. **A job posting's Closing Date was captured and shown (including in SEO
   `validThrough` metadata) but never actually enforced.** Past its
   closing date, a posting stayed fully live — visible on `/placement`/
   `/recruitment`, its detail page reachable, and `POST
   /job-applications` still succeeding against it — until an admin
   remembered to also switch "Active" off by hand. Fixed by adding
   `JobPosting::scopeOpen()` (active AND not past its closing date, if one
   is set) and using it in place of the old active-only check in the
   public `index()`/`show()` endpoints and in `JobApplicationRequest`'s
   `job_posting_id` validation. Also updated the admin Job Postings list
   to show a "Closed (past deadline)" status distinct from "Active" once
   this applies, and added a hint to the Closing Date field explaining the
   now-automatic behavior — both so the admin dashboard doesn't end up
   contradicting what the public site is actually doing.

The subagent found no further issues beyond these four that it could back
with a concrete, reachable scenario distinct from what's already tracked
below — it specifically confirmed the Sanctum auth flow and CSRF handling,
route/middleware protection (`EnsureUserIsAdmin`, `ProtectedRoute`), every
`FormRequest`'s validation against what the frontend actually sends,
candidate-dashboard scoping (no IDOR), loading/error/empty-state handling
across `useFetch`/`useCachedFetch`, and XSS exposure (no
`dangerouslySetInnerHTML` anywhere) as solid.

**Documentation:**

- **`docs/ADMIN_GUIDE.md`** (new) — a non-technical, screen-by-screen guide
  to the admin dashboard for whoever runs the site day-to-day: every nav
  item (Dashboard, Courses, Categories, Enrollments, Job Postings, Job
  Categories, Applications, Leads, Banners, Testimonials, Statistics,
  Settings, Reports), how the enrollment/application/lead pipelines work,
  how admin notification email is configured, and an honest "what's not
  built yet" section (no teammate-invite screen, no status-change emails,
  no image cropping tool, Privacy/Terms still placeholders).
- **`docs/API.md`** — corrected a stale line claiming an admin could create
  another admin account via the API; confirmed during this phase's QA pass
  that no such endpoint exists, and updated the doc to say so plainly
  rather than leave a claim that doesn't match the actual code.
- **`HANDOVER.md`** (new, project root) — the closing project-overview
  document: what was built, a table pointing to every other doc and who
  it's for, how to get an admin account (and the standing to-do to change
  the seeded password before real launch), a condensed version of the
  open items below ranked by how likely each is to matter, a summary of
  this phase's QA findings, and a numbered next-steps list.
- **`README.md`** (root) — added pointers to `HANDOVER.md`,
  `docs/ADMIN_GUIDE.md`, and `docs/DEPLOYMENT.md` alongside the existing
  links, so a first-time reader lands on the right document faster.

**Verification performed:** `php -l` across every file in `backend/app`,
`backend/config`, `backend/routes` (clean, both before and after this
phase's fixes); `npm run lint` in `frontend/` (same pre-existing
`set-state-in-effect`/`only-export-components` informational warnings as
every prior phase, no new ones); `npm run build` in `frontend/` (clean,
plus a direct `grep` of the built `dist/` output confirming the demo
admin-credentials string is completely absent from the production build,
not just hidden by CSS).

**Local verification for the client:** log in as admin, change the seeded
password (Settings doesn't currently expose a self-service password
change, so this needs a direct database update or a `php artisan tinker`
session — worth adding a proper "change my password" screen as a small
follow-up if that's preferred over server access every time). Edit a
category and clear its Slug field, save, and confirm the slug regenerates
from the name instead of saving blank. Export leads to CSV and open it in
Excel/Sheets — confirm ordinary text still looks like text. Set a job
posting's closing date to yesterday and confirm it no longer appears on
`/placement`/`/recruitment`, its detail page 404s, and the admin Job
Postings list shows "Closed (past deadline)."

## Open items carried forward

- ~~**Brand logo**: still not supplied~~ — **resolved post-Phase-15.** The
  client supplied the real logo; it replaced the Phase 2 placeholder mark
  in all four places it's used (header, footer, admin login, admin sidebar
  mark/favicon) plus the sitewide `Organization` JSON-LD's `logo` field.
  See `docs/DESIGN_SYSTEM.md`'s "Logo" section for the specifics, including
  why the footer gets a small white backing card behind the logo (the
  supplied artwork's wordmark text isn't legible on the footer's dark
  background as-is) and why the sidebar/favicon use a separate icon-only
  crop of the same artwork rather than the full lockup.
- **Footer contact details**: as of Phase 5 these come from the `settings`
  table (`GET /api/settings/public`) rather than being hard-coded in
  `Footer.jsx`, and as of Phase 9 they're editable from the admin Settings
  screen (`/admin/settings`) — but the seeded values are still placeholders
  pending the client's real office address, phone number, and social links.
- **Laravel version**: initially set to Laravel 13 (needs PHP 8.3+); switched
  to **Laravel 12** since the client's local PHP is 8.2.12. Bump
  `laravel/framework` to `^13.0` and `"php": "^8.3"` in `backend/composer.json`
  once PHP 8.3+ is available — nothing else in the skeleton needs to change
  for that upgrade. PHP 8.2 is also past its official security-support
  window, worth upgrading when convenient.
- **MySQL vs SQLite**: whichever the client used for the Phase 1 migrate
  smoke test, `backend/.env` locally may differ from the MySQL-defaulted
  `.env.example` committed to the repo — that's expected and fine; `.env`
  is git-ignored.
- ~~**CORS/Sanctum origins are localhost-only right now**~~ — **resolved in
  Phase 14.** `backend/.env.production.example` documents exactly which
  real domains go into `FRONTEND_URL`/`SANCTUM_STATEFUL_DOMAINS`/`APP_URL`
  (and `docs/DEPLOYMENT.md` step 8 walks through filling them in); `.env.
  example` itself stays localhost-defaulted for local dev, which is
  correct and doesn't need to change.
- **Public write endpoints still only have Laravel's default**
  `throttle:api` (60/min) — `/course-enrollments`, `/job-applications`, and
  `/leads` (unlike `/auth/login`/`/auth/register`, which got their own
  tighter named limiters in Phase 13) — worth tightening if spam submissions
  through these forms become a real concern; not done yet since there's no
  evidence yet that it's needed, and a too-tight limit here would risk
  blocking a legitimate burst of interest (e.g. a shared social post driving
  several real enquiries from the same office/campus network in a short
  window).
- **Privacy Policy and Terms of Use are still the Phase 1 placeholder**
  (`components/common/PagePlaceholder.jsx`, "Content for this page will be
  implemented in a later phase") — surfaced again while doing Phase 12's
  SEO pass, where both pages were marked `noindex` specifically because of
  this. A real business needs real legal copy here (and it should come
  from the client/their counsel, not be drafted by an AI); once it exists,
  swap `PrivacyPolicyPage.jsx`/`TermsPage.jsx` for real content and remove
  their `noindex`.
- **SPA meta tags/JSON-LD aren't visible to non-JS crawlers** (Phase 12) —
  Google renders JavaScript and sees the per-page titles/OG tags/structured
  data added this phase, but simpler crawlers and most social-media unfurl
  bots (Slack, WhatsApp, older Facebook/Twitter scrapers) only see the
  static `index.html` defaults. Fixing that properly needs server-side
  rendering or prerendering — worth considering for Phase 14 if social
  link-preview cards or non-Google search visibility turn out to matter.
- **`sitemap.xml`/`robots.txt` cross-domain in production** (Phase 12) — both
  are served by the backend (`GET /sitemap.xml`, and `robots.txt`'s
  `Sitemap:` line points at it), while the actual pages are served by the
  frontend. Locally these are different ports on `localhost`, so it doesn't
  matter; in production, if the frontend and backend end up on genuinely
  different domains, submit the sitemap URL directly via Google Search
  Console for the frontend's own property rather than relying solely on
  crawlers following the cross-domain `robots.txt` reference.
- **Deleting a course/job posting orphans files in storage** (Phase 13) —
  fixed the *data* side of this (cache invalidation, a clearer confirmation
  message — see Phase 13's section above), but a job posting's cascade
  delete of its applications happens at the database foreign-key level, so
  no Eloquent model event runs to also delete each application's uploaded
  resume file from `storage/app/public/resumes/`. Those files are harmless
  but orphaned (never served, never cleaned up). Properly fixing it means
  overriding the delete flow to walk related records and remove their files
  first — a real change, not a one-line fix, so it's deferred rather than
  rushed.
- **No automated test suite** (Phase 13) — you chose to skip this pillar of
  Phase 13 in favor of security hardening and bug fixing. The backend still
  only has the default Laravel/PHPUnit scaffold (`backend/tests/`, two
  example tests, untouched since Phase 1); the frontend has no test runner
  configured at all. Worth its own phase/follow-up if wanted — note that
  this sandbox can run and verify a frontend test suite for real (npm
  works here), but can only syntax-check backend PHPUnit tests via `php -l`
  (Composer/packagist access isn't available here), same ceiling as every
  other backend change in this project.

## Post-handover updates

Small follow-up requests made after Phase 15/`HANDOVER.md`, logged here
rather than as a new numbered phase since each is a self-contained change,
not a planned milestone.

- **Real logo swapped in** (see the "Brand logo" entry above, now
  resolved, and `docs/DESIGN_SYSTEM.md`'s "Logo" section for the specifics).
- **About page redesigned to be more visual** — the client's feedback was
  that `/about` "look[ed] only text based" and needed "images or graphical
  involvement." The original page (Phase 5) was four dense prose paragraphs
  plus an untitled icon-card grid at the very bottom, easy to miss without
  scrolling. Rebuilt using the same component toolkit already established
  on the homepage (`SectionTitle`, `ServiceCard`, `StatsCard`,
  `CTASection`, the `split-section` two-column pattern from Consulting/
  Recruitment/Contact) rather than introducing a new one-off style —
  deliberately not stock photography or fabricated team photos, since none
  exist and the rest of the site doesn't use photography either (banner
  images are the one exception, and those are real admin-uploaded content,
  not decoration). Structure is now: one short intro paragraph, a live
  stats band (reuses the same `/statistics` data as the homepage — renders
  automatically once real stats are entered in the admin Settings, gracefully
  absent until then, same conditional pattern as `HomePage.jsx`), an icon
  card grid for the four services (now with a proper heading, previously
  had none), four icon cards unpacking "Our approach" (previously one dense
  paragraph), a two-column icon-checklist splitting "Who we work with" into
  Job Seekers vs. Employers (previously one paragraph), and a closing CTA
  band (previously the page just ended). No copy claims changed — every
  section reorganizes and visually presents content that was already on
  the page, nothing new was asserted about the business.
  Verified with `npm run lint` / `npm run build` (clean) and a Playwright
  screenshot of the rendered page in this sandbox (statistics band was
  correctly absent, since this sandbox has no backend/database to serve
  real stats from — everything else rendered as designed).
- **Homepage hero slider load-time fix + About/Contact made admin-editable
  ("fully editable content blocks").** Two related client requests, built
  together: "slider takes 10 second to load," and About/Contact should be
  "more graphical... include images... make dynamic to change from admin
  dashboard."

  *Slider speed.* Traced the real cause rather than guessing: banner
  images were stored at whatever resolution they were uploaded at —
  `BannerRequest` only capped file *size* (2MB), not pixel dimensions, so
  an unedited phone photo (often 3000px+ wide) was served as-is and
  scaled down by the browser, wasting most of the download on pixels that
  were never displayed. Fixed with a new `App\Support\ImageOptimizer`
  (plain PHP GD — `imagecreatefromstring` /  `imagecopyresampled` /
  format-preserving re-encode; deliberately not a Composer package like
  Intervention Image, matching this project's established preference for
  small local implementations over new dependencies that can't even be
  installed in this sandbox) that resizes-and-recompresses on upload,
  never upscales, and preserves transparency for PNGs. Wired into
  `BannerController` (max 1920×1080), and proactively extended to
  `CourseController` (max 1200×900) and `TestimonialController` (max
  400×400 avatars) — the same latent problem existed there even though
  only the banner slider was reported, so it was fixed everywhere the
  same code path exists rather than only where a complaint came in.
  Verified standalone against a simulated 4032×3024 JPEG: 2.32MB → 238.5KB
  (89.9% smaller) at 1440×1080.

  This only fixes *new* uploads. For a site that already has real,
  already-slow images live, a new idempotent, dry-run-capable Artisan
  command — `php artisan images:optimize` / `--dry-run` — re-optimizes
  every existing Banner/Course/Testimonial image in place (see
  `docs/DEPLOYMENT.md`'s maintenance section).

  *About/Contact content blocks.* Scoped via `AskUserQuestion` before
  building anything, since "make dynamic" was ambiguous enough to be
  worth confirming rather than assuming: the client chose "fully editable
  content blocks" (every section editable — add/remove/reorder,
  rewrite any heading or paragraph, swap any image) over the lighter
  alternatives offered ("just the key pieces" / "just images, keep text
  as code"), and "admin-uploaded, empty until you add real photos" for
  images over generic stock photography or staying icon-only — so image
  slots exist and render conditionally, but nothing fabricated or
  stock-photo-shaped was added.

  Built as one generic, reusable schema — a new `page_sections` table
  (`page`, `section_key`, `icon`, `title`, `subtitle`, `body`, `image`,
  `primary_label`, `primary_url`, `secondary_label`, `secondary_url`,
  `sort_order`, `is_active`) rather than bespoke tables per page, since
  both pages need the same underlying shapes: singleton text blocks (a
  hero heading, an intro paragraph), repeatable card/checklist items (an
  approach card, a checklist line), and an optional image or CTA links on
  either. The allowed `(page, section_key)` combinations are a curated,
  server-validated list (`App\Support\PageSectionKeys`, mirrored — with
  richer label/hint/fields metadata the backend doesn't need — by
  `frontend/src/utils/pageSectionKeys.js`), the same "curated closed set"
  pattern already established for `statistics.icon`/`ICON_NAMES`, except
  `section_key` **is** strictly validated server-side
  (`PageSectionRequest::withValidator`) since an unrecognized key here
  would be genuinely unrenderable, unlike an unrecognized icon name.
  `iconMap.js`'s shared icon set gained `ClipboardCheck`/`Search` so the
  new admin icon picker can offer every icon the About page's approach
  cards actually use.

  New admin screens — **About Content** and **Contact Content** in the
  sidebar — built around one shared, page-agnostic component
  (`PageSectionManager.jsx`, in the same "shared component parameterized
  by prop" spirit as `CategoryManager.jsx`) rather than near-duplicate
  screens: each `section_key` renders as its own panel (singleton keys
  show an Edit button in place; repeatable keys get their own Add/Edit/
  Delete list with a Display Order field), with the field set per panel
  (title/subtitle/body/icon/image/CTA links) driven entirely by
  `pageSectionKeys.js`'s config rather than one-size-fits-all form.
  `AboutPage.jsx`/`ContactPage.jsx` now fetch `GET /page-sections?page=`
  and render from the API (`.find()` for singleton keys, `.filter()` +
  sort for repeatable ones), falling back to the same hardcoded copy the
  pages shipped with if a row doesn't exist yet — so a database that
  hasn't run the new seeder/migration yet keeps showing exactly what it
  showed before, nothing regresses mid-rollout.

  **Deliberately not covered:** the About page's four core service
  pillars (Training/Placement/Recruitment/Consulting) stay hardcoded —
  they link to fixed site routes, and letting an admin freely retitle or
  remove one risks silently breaking primary navigation, which outweighs
  the editability benefit for content that essentially never changes.
  The Contact page's address/phone/email were confirmed to already be
  dynamic via the existing `Settings`/`GET /settings/public` mechanism
  (Phase 9) — not duplicated here; `page_sections` only covers the
  Contact page's still-hardcoded heading/intro text around them.

  A `keys()` admin endpoint (returning `PageSectionKeys::KEYS` as JSON)
  was drafted and then deliberately removed: the frontend needs richer
  per-key metadata (labels, hints, which fields apply, singleton vs.
  repeatable) than a bare key list provides, so the endpoint wouldn't
  have actually removed the need to separately maintain
  `pageSectionKeys.js` — it would only have added an API surface without
  solving the duplication problem it was meant to solve.

  New/changed migration and seed data: `create_page_sections_table`
  migration, and a new `PageSectionSeeder` — split out from the main
  `DatabaseSeeder` (which is explicitly local-dev/demo-only) because this
  one is meant to also run standalone against an already-live production
  database (`php artisan db:seed --class=PageSectionSeeder --force`),
  seeding real, production-appropriate starter copy (the same text both
  pages already shipped with) rather than placeholder/lorem-ipsum text,
  idempotent via `firstOrCreate` so re-running it is harmless.

  Verified via `php -l` on every changed/new backend file, `npm run
  lint` / `npm run build` (both clean), and Playwright screenshots of the
  rendered About and Contact pages in this sandbox (no backend/database
  here, so both correctly rendered their fallback copy — matching the
  pre-existing design pixel-for-pixel, confirming the fallback path
  doesn't regress anything for a site that hasn't migrated yet).
- **About page Introduction expanded to two paragraphs.** Small content
  addition — a second paragraph was added to the About page's
  `intro` content block, and `AboutPage.jsx` now splits an admin-edited
  `body` field on a blank line into separate `<p>` tags (previously
  rendered as one block, since the field only ever held a single
  paragraph before this). Updated in both the React fallback copy and
  `PageSectionSeeder`'s default so a fresh install/seed gets the same
  text; a site that already had an `intro` row needs the new paragraph
  pasted into its Body field by hand (the seeder's `firstOrCreate` won't
  touch an existing row), noted directly to the client.
- **`images:optimize` silently did nothing when GD wasn't enabled — found
  from a live report, not proactively.** After the slider-speed fix above,
  the client reported the hero was still slow. First hypothesis (checked
  and ruled out): local PHP was missing the GD extension, since
  `ImageOptimizer` is deliberately built to "fail open" — return the
  original, untouched file rather than break an upload — when GD is
  unavailable (see its docblock). `php -m` showed GD *was* enabled, so
  that wasn't it; but the gap it exposed was real regardless: running
  `images:optimize` without GD prints "Processed N image(s): X → X (0.0%
  smaller)" with no explanation, which is very easy to misread as
  success. Fixed by having the command check `function_exists
  ('imagecreatefromstring')` upfront and refuse loudly with exact
  remediation steps instead of pretending it worked; a live upload
  without GD now also logs a warning (`Log::warning`) so it leaves a
  trace instead of only ever showing up as an unexplained slow page.
- **The real cause: a PNG upload doesn't shrink from resizing alone if
  it's already within the dimension cap — diagnosed from an actual
  Network-tab screenshot, not assumed.** With GD confirmed present, the
  client re-ran `images:optimize` and it still reported "6.37 MB → 6.37
  MB (0.0% smaller)" — a second, different silent no-op, so a screenshot
  of Chrome's Network tab was requested rather than guessing again. It
  showed the real cause precisely: four banner images at 1.5-1.8 MB each,
  virtually the entire page weight. Pulled one of the actual files via
  the device bridge and tested it directly: 1536×1024, no transparency,
  already comfortably within the 1920×1080 cap — so `ImageOptimizer` was
  correctly skipping the resize step, then re-compressing an
  already-well-compressed lossless PNG, which barely changes its size at
  all (PNG's compression is bound by image content/noise, not a quality
  knob the way JPEG's is; measured 1.69 MB → 1.69 MB, confirming the
  live behavior exactly). Re-encoding that same real file as JPEG instead
  measured 1.69 MB → 175 KB, a 90% reduction — entirely from the format
  change, nothing to do with resolution. This was a real gap in the
  original design, not a misconfiguration on the client's end: a
  photographic image saved as PNG (very common — an image editor or a
  "save as" dialog often defaults to PNG even for a photo) was never
  going to be fixed by a dimension cap alone.

  Fixed by teaching `ImageOptimizer::optimize()` to check whether an
  image has *real* transparency — sampled actual GD alpha values on a
  grid, not assumed from the file format — and convert to JPEG whenever
  it doesn't, regardless of original format (PNG/GIF/WEBP alike). An
  image that genuinely needs transparency (a logo, an icon on a
  transparent background) still keeps it. Since the output extension can
  now differ from the upload's, `optimize()`'s return type changed from a
  plain `string` to a new `App\Support\OptimizedImage` value object
  (`data` + `extension`); every caller — `BannerController`,
  `CourseController`, `TestimonialController`, `PageSectionController`,
  and `images:optimize` itself — was updated to build its storage path
  from `$result->extension` rather than the uploaded file's. The CLI
  command additionally handles the case where re-optimizing an existing
  record changes its extension: the new file is written under the new
  path, the model's column is updated to match, and the old file is
  deleted so it doesn't linger as an orphan.

  While building this, a real bug surfaced in testing (not from the
  client): the "already within bounds, no resize needed" branch reuses
  the freshly-decoded source image directly as the encode target, which
  does *not* have `imagesavealpha` enabled by default — so a transparent
  PNG that didn't need resizing would have its alpha silently dropped on
  re-encode even though the new transparency-detection logic correctly
  identified it as needing PNG output. Caught by a same-turn test
  (encode a synthetic transparent PNG, decode the result, check the
  actual alpha value) before shipping — fixed by calling
  `imagesavealpha($target, true)` unconditionally right before encoding
  an alpha-capable format, rather than relying on whichever code path
  built `$target`.

  Verified end-to-end against real data, not just synthetic cases: since
  this sandbox has no Composer dependencies installed (`vendor/` doesn't
  exist here — see the project's standing sandbox constraints), the
  shipped `ImageOptimizer`/`OptimizedImage` classes were exercised
  directly with minimal local stubs for the two Laravel classes they
  touch (`Log`, `UploadedFile`) rather than skipped — pulling one of the
  client's actual 1.7 MB banner PNGs via the device bridge and running it
  through the real code (1.73 MB → 171 KB, 90.1% smaller, confirming the
  live number), plus a transparent PNG (stays PNG, alpha round-trips
  correctly, confirming the fix above), an oversized JPEG (still resizes,
  stays JPEG), a GIF with palette transparency (stays GIF), a WEBP with
  real transparency (stays WEBP), and a second pass over the first
  result (stable size, confirming it's still idempotent). `php -l` run on
  every changed file afterward.

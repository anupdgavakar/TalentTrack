# API Reference (Phase 4)

Base URL: `http://localhost:8000/api` in local dev. Every response — success
or failure — uses the same envelope:

```json
{ "success": true, "message": "OK", "data": { ... } }
```

Validation errors additionally carry an `errors` object (Laravel's
standard `{ "field": ["message"] }` shape) alongside `success: false`.

## Authentication — Sanctum SPA (cookie-based), not bearer tokens

The frontend is treated as a first-party single-page app, not a third-party
API client, so auth uses Laravel Sanctum's **stateful** mode: a normal
session cookie, CSRF-protected, not a token you store and attach by hand.

1. `GET /sanctum/csrf-cookie` — call this once before the first
   login/register (Sanctum middleware, not a route we defined). Sets the
   `XSRF-TOKEN` cookie.
2. axios must be configured with `withCredentials: true` and
   `xsrfCookieName`/`xsrfHeaderName` (axios' defaults already match
   Laravel's cookie/header names).
3. After that, `POST /api/auth/login` sets the session cookie and every
   subsequent request is authenticated automatically — no `Authorization`
   header to manage.

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/auth/register` | Public | `name, email, phone?, password, password_confirmation` |
| POST | `/auth/login` | Public | `email, password` |
| POST | `/auth/logout` | Required | — |
| GET | `/auth/me` | Required | — |

Every `/auth/register` account is created with `role: candidate` — there's
no public admin sign-up, and no `/admin/*` endpoint for creating or
promoting a user to admin either (confirmed during Phase 15's QA pass —
there's no user-management screen in the admin dashboard at all). The only
way to get an admin account today is `DatabaseSeeder`'s seeded account, or
setting `role` to `admin` directly on a `users` row — see
`docs/ADMIN_GUIDE.md`'s "What's not built yet" section.

**Rate limits (Phase 13)**: both endpoints above still get the default
`throttle:api` (60/min) like every other route, plus their own tighter
named limiter on top — `/auth/login` is 5/min keyed by `email+ip` (a 429
"Too Many Attempts" response once exceeded), `/auth/register` is 10/min
keyed by `ip`. See `app/Providers/AppServiceProvider.php`.

**Password rule (Phase 13)**: `password` on `/auth/register` requires at
least 8 characters containing both letters and numbers (Laravel's
`Password::min(8)->letters()->numbers()`), not just any 8 characters.

## Public reads

All return active/published records only.

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/courses` | `?category=<slug>&featured=1&search=&per_page=` |
| GET | `/courses/{slug}` | |
| GET | `/job-postings` | `?category=<slug>&listing_type=placement\|recruitment&job_type=&featured=1&search=&per_page=` |
| GET | `/job-postings/{slug}` | |
| GET | `/categories` | `?type=course\|job` |
| GET | `/banners` | Ordered by `sort_order`; shape matches `HERO_SLIDES` in `HomePage.jsx` exactly |
| GET | `/testimonials` | `?featured=1` |
| GET | `/statistics` | |
| GET | `/settings/public` | Whitelisted key/value map (see `Setting::PUBLIC_KEYS`) — footer address/phone/email, social links |
| GET | `/page-sections` | `?page=about\|contact` (required) — active content blocks for that page, ordered by `section_key` then `sort_order`. Backs the admin-editable About/Contact pages (see "Page content" below). |

List endpoints (`courses`, `job-postings`) return `{ items: [...], meta: { current_page, last_page, per_page, total } }` in `data`.

## Public writes — candidate application system + lead capture

No account required for any of these; if the caller is logged in, `user_id`
is attached automatically.

| Method | Endpoint | Body |
|---|---|---|
| POST | `/course-enrollments` | `course_id, full_name, email, phone?, message?` |
| POST | `/job-applications` | `job_posting_id, full_name, email, phone?, resume?(file), cover_note?` |
| POST | `/leads` | `type(recruitment\|consulting\|training\|placement\|general), name, email, phone?, company?, message?, source?` |

`leads` backs the general Contact form as well as the Recruitment and
Consulting page's enquiry forms — the frontend just sets `type` per page.

**`course_id`/`job_posting_id` must reference an *active* record (Phase
13 bug fix)** — previously any existing id passed validation regardless of
`is_active`, so a draft course/job posting (not yet linked from any public
page, but with a guessable sequential id) could still be enrolled in or
applied to directly against the API. A draft's id is now rejected the same
way a nonexistent id always was.

## Candidate — requires login (any role)

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/me/dashboard` | `{ enrollments: [...], applications: [...] }` — the logged-in user's own course enrollments and job applications, most recent first. Unpaginated. Backs the candidate "My Dashboard" page (Phase 8). |

## Admin — requires login + `role: admin`

Every route below is behind `auth:sanctum` + the `admin` middleware
(`App\Http\Middleware\EnsureUserIsAdmin`); a non-admin gets `403`, a
logged-out request gets `401`.

Full CRUD (`index, store, show, update, destroy`) via `Route::apiResource`:

- `/admin/categories` — `name` must be unique **within its own `type`**
  (`course`/`job`), not globally (Phase 13 bug fix — a course category and
  a job category used to collide on the same name, even though the
  database itself only enforces uniqueness on `slug`).
- `/admin/courses` (multipart `image` on store/update)
- `/admin/job-postings`
- `/admin/banners` (multipart `image`, required on create)
- `/admin/testimonials` (multipart `avatar`, optional)
- `/admin/statistics`
- `/admin/page-sections` (multipart `image`, optional) — `?page=about\|contact` filters `index`. See "Page content" below.

`/admin/banners`, `/admin/testimonials` and `/admin/statistics` reuse the
same resource classes as their public counterparts above rather than
having separate admin-only shapes — `TestimonialResource`/
`StatisticResource` were extended in Phase 9 to also include `is_active`
and `sort_order` (previously public-only fields) so the admin screens can
show and edit them; harmless on the public payload since those endpoints
already filter to active records and apply `sort_order` server-side.

Settings (bulk key/value):

| Method | Endpoint | Body |
|---|---|---|
| GET | `/admin/settings` | — full key/value map, including non-public keys |
| PUT | `/admin/settings` | `{ "settings": { "footer_phone": "...", ... } }` |

Dashboard:

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/admin/dashboard/stats` | `{ courses_count, training_categories_count, enrollments_by_status: {new,contacted,enrolled,rejected}, recent_enrollments: [...], jobs_count, job_categories_count, applications_by_status: {new,shortlisted,interview,placed,rejected}, recent_applications: [...] }` — one aggregated request instead of fetching each count separately (added Phase 6 for Training; extended Phase 7 to cover Placement/Recruitment in the same response rather than a second endpoint) |

Pipeline management (`index, show, update` only — records are created by
the public endpoints above, never by an admin):

| Method | Endpoint | Notes |
|---|---|---|
| GET/PUT | `/admin/course-enrollments[/{id}]` | `?status=` filter; update body `{ "status": "new\|contacted\|enrolled\|rejected" }` |
| GET/PUT | `/admin/job-applications[/{id}]` | `?status=` filter; update body `{ "status": "new\|shortlisted\|interview\|placed\|rejected" }` |
| GET/PUT | `/admin/leads[/{id}]` | `?type=&status=` filters; update body `{ "status": "new\|in_progress\|converted\|closed" }` |

Reports (Phase 10):

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/admin/reports/summary` | `?from=&to=` (both optional, `YYYY-MM-DD`, inclusive) — `{ range, leads: { total, by_type, by_status }, enrollments: { total, by_status }, applications: { total, by_status } }`. One aggregated request per section, same pattern as `/admin/dashboard/stats`. |
| GET | `/admin/reports/leads/export` | `?from=&to=&type=&status=` (all optional) — streams a `leads-<timestamp>.csv` file (`Content-Type: text/csv`) instead of the usual JSON envelope. |

## Page content — About/Contact "content blocks" (post-handover addition)

`page_sections` is a small, generic content-block table serving both the
About and Contact pages' admin-editable text/images — one row per
`(page, section_key)` block, or per repeatable item when `section_key` is
a repeatable kind (see `backend/app/Support/PageSectionKeys.php` for the
authoritative list of keys per page, and
`frontend/src/utils/pageSectionKeys.js` for the frontend's richer mirror
of the same list — labels, hints, which fields apply, singleton vs.
repeatable).

Columns: `page`, `section_key`, `icon`, `title`, `subtitle`, `body`,
`image`, `primary_label`, `primary_url`, `secondary_label`,
`secondary_url`, `sort_order`, `is_active`. Every field is nullable —
which ones a given `section_key` actually uses is a frontend-only
convention (`PageSectionKeys`'s `fields` list), not a database
constraint, the same way `statistics.icon` is validated. `section_key`
itself **is** validated server-side against the submitted `page`'s
allowed key list (`PageSectionRequest::withValidator`), so a typo or a
stale frontend build can't create an orphaned/unrenderable row.

A **singleton** key (e.g. `hero`, `intro`, `cta`) is meant to have exactly
one row and is edited in place by the admin UI; a **repeatable** key
(e.g. `approach_card`, `job_seeker_item`) can have any number of rows,
ordered by `sort_order`, with its own add/edit/delete. This is enforced
only by the admin UI (`PageSectionManager.jsx`), not the database — the
API itself doesn't reject a second row for a singleton key.

Deliberately **not** covered by `page_sections`: the About page's four
core service pillars (Training/Placement/Recruitment/Consulting stay
hardcoded in `AboutPage.jsx`, since they link to fixed site routes and an
arbitrary admin edit there could break primary navigation) and the
Contact page's address/phone/email (already dynamic via
`Settings`/`GET /settings/public` — `page_sections` only covers the
still-hardcoded heading/intro text around it).

`php artisan migrate` (for the `page_sections` table) and
`php artisan db:seed --class=PageSectionSeeder --force` (starter content
for every key, safe to run standalone against an already-live database —
see the seeder's own docblock) both need to run once against a database
created before this feature — see `docs/DEPLOYMENT.md`.

## File uploads

`courses.image`, `banners.image`, `testimonials.avatar`,
`page_sections.image`, and `job_applications.resume` are stored on the
`public` disk (`storage/app/public/...`) and returned as full URLs
(`*_url` / `image_url` / `resume_url` / `image` keys, depending on the
resource) via `Storage::disk('public')->url()`. **Requires `php artisan
storage:link` once** (creates `public/storage` → `storage/app/public`) —
without it the files save fine but the returned URLs 404.

Every image upload (`courses`, `banners`, `testimonials`, `page_sections`)
is resized and recompressed server-side on save (`App\Support\
ImageOptimizer`, plain GD — no new Composer dependency) so a full-
resolution phone photo doesn't ship to visitors at its original size; see
`docs/DEPLOYMENT.md`'s maintenance section for the one-off
`php artisan images:optimize` command that applies the same optimization
to images uploaded *before* this existed.

This can also **change the stored file's extension**: an upload with no
real transparency (checked by actual pixel alpha, not assumed from the
file format) is converted to JPEG regardless of what format it was
uploaded as — a photographic image saved as PNG is routinely 5-10x
larger than the same image as JPEG, independent of resolution, so this is
often a bigger win than the resize alone. An image that genuinely needs
transparency (a logo, an icon on a transparent background) keeps its
original format. `ImageOptimizer::optimize()` returns an
`App\Support\OptimizedImage` (`data` + `extension`); every upload
endpoint builds its stored path from that returned extension, not the
uploaded file's — the `image`/`avatar` field in an API response always
reflects whatever the file actually ended up as.

## Non-API routes (outside the /api prefix and envelope)

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/sitemap.xml` | Plain XML (`Content-Type: application/xml`), not the `{success,message,data}` envelope — search engines expect it at this exact path. Lists every static public page plus every *active* course, job posting, and job category, with absolute URLs pointing at `config('app.frontend_url')` (the React app, not this API). Added Phase 12 — see `docs/PHASE_PLAN.md`'s Phase 12 section for the full design notes and a production caveat about cross-domain sitemaps. |
| GET | `/` | Unchanged health check (Phase 1) — `{"success":true,"message":"Talent Track Technologies API"}`. |

`robots.txt` is served by the **frontend**, not this API — see
`frontend/vite.config.js` and `frontend/public/robots.txt`.

## What's not built yet

Rate limiting beyond Laravel's default `throttle:api` (fine to add now if
abuse becomes a concern, but not requested yet). Email notifications on new
leads/enrollments/applications (Phase 11) and the admin dashboard UI
(Phase 9) that consumes the `/admin/*` routes above are both now built —
see `docs/PHASE_PLAN.md`.

Admin alerts (new lead / new course enrollment / new job application) are
sent via `App\Services\AdminNotifier::send()`, a synchronous (non-queued)
call from each public `store()` controller — no new routes were added for
this, since it's a side effect of the existing `POST /leads` /
`POST /course-enrollments` / `POST /job-applications` endpoints, not a new
one. Recipients come from the `admin_notification_email` setting (editable
via `PUT /admin/settings`, comma-separated for multiple addresses) or the
`ADMIN_NOTIFICATION_EMAIL` `.env` fallback; if neither is set, nothing is
sent and nothing errors. See `docs/PHASE_PLAN.md`'s Phase 11 section for
the full design notes (including why it's not queued) and local
verification steps.

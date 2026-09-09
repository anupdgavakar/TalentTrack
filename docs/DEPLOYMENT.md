# Deployment guide — GoDaddy Web Hosting (cPanel), Linux (Phase 14)

This is the step-by-step guide for putting Talent Track Technologies on
GoDaddy's **Web Hosting (cPanel)** product — Linux/Apache shared hosting.
It pairs with three files this phase added:

- `backend/.env.production.example` — copy to `.env` on the server.
- `frontend/.env.production.example` — copy to `.env.production` locally,
  used when you build the frontend.
- `frontend/public/.htaccess` — already gets copied into every
  `npm run build` output automatically; handles React Router's
  client-side routes on Apache. No action needed beyond building normally.

Everything below was checked against GoDaddy's own current documentation
and community reports at the time this was written (September 2026), not
assumed — see the callouts for what's confirmed vs. what you need to
verify on your own account, since exact specifics (SSH availability, PHP
versions offered, SMTP host) vary by plan and aren't published in a way
that's safe to hard-code here.

## Two moving pieces, two subdomains

This app is a Laravel API (`backend/`) and a separate React SPA
(`frontend/`) that talks to it over HTTP — they don't have to live on the
same domain, and keeping them on two subdomains is the simplest cPanel
setup:

- `www.yourdomain.com` (or the bare domain) → the built frontend
  (`frontend/dist/*`), document root `public_html`.
- `api.yourdomain.com` → the Laravel backend, document root pointed at
  `backend/public` specifically (never the `backend/` folder itself —
  that would expose `.env`, `app/`, everything).

## Prerequisites

- A GoDaddy Web Hosting (cPanel) account with your domain attached.
- cPanel login (Settings → PHP Version, MySQL Databases, Subdomains, Email
  Accounts, File Manager, SSL/AutoSSL are all used below).
- **PHP 8.2 or newer selectable.** Laravel 12 requires it
  (`backend/composer.json`: `"php": "^8.2"`). Check cPanel's "MultiPHP
  Manager" or "Select PHP Version" tool and switch the `api.yourdomain.com`
  subdomain to 8.2+ before uploading anything — GoDaddy doesn't publish a
  fixed list of which plans get which PHP versions, so this is a
  check-it-yourself step, not an assumption made here.
- **SSH access, if you have it, makes steps 4–5 much easier** (you can run
  `php artisan` commands directly instead of the File Manager / cron
  workarounds noted below). It's off by default and toggled per-account
  under cPanel → Settings → SSH Access — GoDaddy's docs don't state which
  tiers include it, so check there. Everything below has a no-SSH fallback
  in case yours doesn't.
- A local machine with PHP 8.2+, Composer, and Node.js installed — you'll
  build both the backend's vendor folder and the frontend's static assets
  **locally**, then upload the results (see "Why build locally" below).

### Why build locally, not on the server

GoDaddy's shared-hosting plans are resource-capped tightly enough
(Economy/Deluxe: 1 CPU core, 512MB–1GB RAM; Ultimate: 2 cores/1.5GB;
Maximum: 2 cores/2GB, per GoDaddy's own published resource-limits page) that
running `composer install` directly on the server is a known problem —
community reports describe Composer getting killed mid-install on shared
hosting because of exactly these memory ceilings. The reliable path is to
run `composer install --no-dev --optimize-autoloader` on your own machine
(or a CI runner) and upload the resulting `vendor/` folder alongside the
rest of `backend/`, rather than asking the shared server to do that work.
The frontend build (`npm run build`) is lighter, but there's no reason to
run it on the server either — build locally and upload `dist/`'s contents.

## Step 1 — Prepare the backend locally

```bash
cd backend
composer install --no-dev --optimize-autoloader
```

This creates/refreshes `vendor/`. You'll upload this folder in step 4. Do
**not** run `npm install`/`npm run build` inside `backend/` — that's the
frontend's build, covered in step 6.

## Step 2 — Create the MySQL database (cPanel → MySQL Databases)

1. Under "Create New Database," enter a name (e.g. `talenttrack`). cPanel
   will actually create it as `youraccountuser_talenttrack` — it always
   prefixes both database and username with your cPanel account username
   plus an underscore. Note the **full prefixed name** it shows you.
2. Under "MySQL Users," create a user with a strong password, again noting
   the full prefixed username it ends up with.
3. Under "Add User to Database," grant that user **All Privileges** on the
   database you just created.

You'll use the full prefixed `youraccountuser_talenttrack` values for both
`DB_DATABASE` and `DB_USERNAME` in step 4 — not the plain name you typed
into the form.

## Step 3 — Create the API subdomain (cPanel → Subdomains)

1. Create `api` as a subdomain of your domain (giving you
   `api.yourdomain.com`).
2. Set its **document root** to `backend/public` — cPanel will usually
   default it to something like `public_html/api`; change it to point
   inside wherever you're about to upload the Laravel app's `public/`
   folder specifically, e.g. `talenttrack-backend/public` if you upload
   the app to a `talenttrack-backend` folder outside `public_html`.
   Getting this one setting wrong (pointing it at the app root instead of
   `public/`) is the single most common Laravel-on-shared-hosting mistake
   — it either 500s on every request or, worse, serves your `.env` file
   directly.

## Step 4 — Upload the backend

Upload everything in `backend/` **except** `.git`, `node_modules` (backend
doesn't have one, but just in case), and your local `.env`/`.env.local` —
via cPanel's File Manager (zip locally, upload the zip, extract in place)
or SFTP if your plan includes it. Include the `vendor/` folder you built
in step 1 — the server will not build it for you (see above).

Destination: anywhere outside `public_html` is fine and slightly safer
(e.g. a sibling folder like `talenttrack-backend`), as long as step 3's
document root points at `<that folder>/public`. Keeping the whole Laravel
app out of `public_html` means nothing except `public/`'s contents is ever
web-reachable, which is good practice — `public_html` should really only
end up holding the frontend (step 6).

Once uploaded:

1. In File Manager (or SSH), copy `backend/.env.production.example` to
   `.env` in the uploaded app's root and fill in every placeholder —
   database credentials from step 2, `APP_URL` (your `api.` subdomain),
   `FRONTEND_URL`/`SANCTUM_STATEFUL_DOMAINS` (your main domain — see the
   comments in that file about picking one canonical www/non-www form),
   mail settings (see step 3 of "Email" below), `ADMIN_NOTIFICATION_EMAIL`.
2. Generate the app key:
   - **With SSH**: `cd` into the app root, run `php artisan key:generate`.
   - **Without SSH**: run `php artisan key:generate --show` on your local
     machine (same Laravel app, any environment) to get a key string, then
     paste it as `APP_KEY=base64:...` directly into the uploaded `.env`
     via File Manager's editor. The key itself isn't environment-specific
     — it just needs to be a real generated value, unique to this
     deployment, never reused from another app.

## Step 5 — Migrate, seed, link storage

**With SSH**, from the app root:

```bash
php artisan migrate --force
php artisan db:seed --force   # only if you want the demo/admin seed data
php artisan db:seed --class=PageSectionSeeder --force   # starter About/Contact page content — see below
php artisan storage:link
```

The `PageSectionSeeder` line is different from the demo-data one above it:
it's safe (and worth running) even on a site that already has real
courses/jobs/leads, since it only creates starter text for the About and
Contact pages' admin-editable content blocks (see `docs/API.md`'s "Page
content" section) — without it those two admin screens start out empty
and the public pages fall back to older hardcoded copy baked into the
frontend build. It's idempotent, so re-running it later (e.g. after a
`php artisan migrate:fresh`, or if you're not sure it already ran) is
harmless — it fills in only what's missing.

(`--force` is required because `APP_ENV=production` — Laravel refuses
destructive commands in production without it, a safety check worth
keeping rather than working around.)

**Without SSH**, cPanel's "Cron Jobs" tool can run a one-off command even
if you don't want a recurring schedule: create a cron job with a far-future
or already-passed schedule that won't actually fire, then use its "Run
Now" option if cPanel offers one — or, more reliably, temporarily add a
protected one-time route/command trigger and remove it after running once.
The cleanest no-SSH option is usually to ask GoDaddy support to enable SSH
for a few minutes, run these three commands, and turn it back off if you'd
rather not leave it on — this is a one-time setup cost, not a recurring
need (this app has no scheduled tasks; `routes/console.php` only has
Laravel's default example command, so no cron job needs to keep running
afterward).

`storage:link` matters specifically: without it, course images, banner
images, testimonial avatars, and uploaded resumes will save correctly but
their URLs will 404, because `public/storage` (the symlink Laravel expects)
won't exist yet.

## Step 6 — Build and upload the frontend

Locally, in `frontend/`:

```bash
cp .env.production.example .env.production
# edit .env.production: set VITE_API_BASE_URL to your api. subdomain + /api,
# and VITE_SITE_URL to your main domain
npm run build
```

`npm run build` runs in Vite's "production" mode by default, which
automatically loads `.env.production` on top of `.env` — no extra flags
needed. This also copies `public/.htaccess` into `dist/.htaccess`
(verified during this phase with an actual build — Vite does correctly
copy dotfiles from `public/`), which is what makes client-side routes like
`/training` or `/admin/dashboard` work on a direct visit or page refresh
instead of 404ing at the Apache level.

Upload the **contents of `dist/`** (not the `dist` folder itself) into
`public_html` — `index.html`, `.htaccess`, and the `assets/` folder should
end up directly inside `public_html`.

## Step 7 — SSL (cPanel → SSL/TLS Status, or AutoSSL)

GoDaddy issues free SSL certificates by default on Web Hosting (cPanel)
plans via AutoSSL. Confirm both `yourdomain.com`/`www.yourdomain.com` and
`api.yourdomain.com` show as secured under SSL/TLS Status — a new
subdomain sometimes needs AutoSSL run once manually (a "Run AutoSSL"
button) before its certificate issues, rather than waiting for the next
automatic pass.

## Step 8 — Fill in every remaining production domain value

This is what actually resolves the long-standing "CORS/Sanctum origins are
localhost-only" item carried in `docs/PHASE_PLAN.md` since Phase 7 — once
these are set to real domains instead of `localhost`, that item is closed:

| Variable | File | Value |
|---|---|---|
| `FRONTEND_URL` | backend `.env` | Your canonical frontend URL, e.g. `https://www.yourdomain.com` (single URL — see the comment in the file for why) |
| `SANCTUM_STATEFUL_DOMAINS` | backend `.env` | Same domain, bare host, e.g. `www.yourdomain.com` |
| `APP_URL` | backend `.env` | `https://api.yourdomain.com` |
| `VITE_API_BASE_URL` | frontend `.env.production` (build-time) | `https://api.yourdomain.com/api` |
| `VITE_SITE_URL` | frontend `.env.production` (build-time) | `https://www.yourdomain.com` |
| `ADMIN_NOTIFICATION_EMAIL` | backend `.env` (fallback only) | A real inbox, or leave GoDaddy's default and set it from `/admin/settings` instead |

If you change `www.yourdomain.com` vs `yourdomain.com` as your canonical
domain after already deploying, set up a redirect from the other form to
it (cPanel → Domains, or a `.htaccess` redirect rule) rather than trying to
allow both as CORS origins — see the comment in
`backend/.env.production.example` for why `FRONTEND_URL` specifically
needs to stay a single URL.

## Step 9 — Post-deploy checklist

- `APP_DEBUG=false` in the backend `.env` (already the default in
  `.env.production.example` — verify it wasn't accidentally flipped back
  to `true` while filling in the rest).
- `SESSION_SECURE_COOKIE=true` (also already the default) — only correct
  once the site is actually served over https, which step 7 handles.
- Visit `https://www.yourdomain.com` and confirm the homepage loads, then
  refresh on a non-root route (e.g. `/training`) to confirm the `.htaccess`
  fallback is working (this is the case that 404s if step 6's upload
  missed the `.htaccess` file, or if it uploaded into a subfolder instead
  of directly into `public_html`).
- Register a test account and log in — confirms the API subdomain, CORS,
  and Sanctum's stateful-domain config are all correctly wired together.
- Submit one of the public forms (a course enrollment, job application, or
  the contact/lead form) end-to-end and confirm an admin notification
  email arrives — this exercises the database connection, file upload
  storage (for job applications), and mail sending together in one check.
- Visit `https://api.yourdomain.com/sitemap.xml` and
  `https://www.yourdomain.com/robots.txt` and confirm both load and that
  the sitemap's URLs point at your real frontend domain, not
  `localhost:5173`.
- **Performance (optional but recommended once everything above works):**
  `php artisan config:cache` and `php artisan route:cache` on the server
  meaningfully speed up every request by skipping Laravel's normal
  file-discovery work. The one thing to know before using them: `config:
  cache` freezes every `env()` value at the moment you run it — if you
  edit `.env` afterward (a new SMTP password, a domain change), the app
  will keep using the *old* cached values until you run
  `php artisan config:cache` again (or `config:clear` to drop the cache
  entirely). Forgetting this is a common source of "I changed my .env but
  nothing happened" confusion, so re-run `config:cache` after every future
  `.env` edit if you're using it.

## Email

GoDaddy's own documentation states Web Hosting (cPanel) plans cap outbound
mail relay at **500 emails per day per mailbox, and 500 per hour across
the whole account** — this applies to PHP-generated mail (like this app's
admin notifications) the same as human-sent mail, not just the latter. At
roughly one email per new lead/enrollment/application, this app is very
unlikely to approach that limit, but it's worth knowing if traffic grows.
(A separate, lower ~250/day figure sometimes quoted elsewhere describes
GoDaddy's different, separately-branded Workspace/Professional Email
product — not the free mailbox that ships with Web Hosting/cPanel plans
this guide targets. Don't mix the two up if you're comparing numbers.)

To get real SMTP credentials:

1. cPanel → Email Accounts → create a mailbox, e.g.
   `notifications@yourdomain.com`.
2. Open that mailbox's **"Connect Devices"** page — it shows the exact
   SMTP host, port, and security setting for your specific account. This
   genuinely varies enough by account that `backend/.env.production.example`
   deliberately leaves `MAIL_HOST` as a placeholder
   (`REPLACE_WITH_YOUR_SMTP_HOST`) rather than guessing — copy the exact
   host from that page rather than assuming a `secureserver.net`-style
   name.
3. If "Connect Devices" gives you **port 587**, leave `MAIL_SCHEME=null`
   as-is (Laravel/Symfony Mailer auto-negotiates STARTTLS on 587, which is
   `.env.production.example`'s default). If it gives you **port 465**
   instead, change `MAIL_PORT=465` and set `MAIL_SCHEME=smtps` — 465 is an
   "implicit TLS from the first byte" handshake, a different protocol than
   587's STARTTLS upgrade, and needs the scheme set explicitly to match.

An alternative worth considering, especially if you care about mail
actually landing in Gmail/Outlook inboxes rather than spam: a third-party
transactional mail provider (Mailgun, SendGrid, Postmark, SES) instead of
GoDaddy's own mailbox relay. Shared-hosting IP ranges generally carry
weaker sender reputation than a dedicated transactional provider's, since
many unrelated accounts' mail shares the same outbound IPs. Either way,
only `MAIL_*` values in `.env` change — no code changes needed, since the
app already just uses Laravel's standard SMTP mailer.

## Background jobs and scheduled tasks — not needed here

Two things a typical production Laravel deploy has to account for don't
apply to this app, which simplifies this deployment:

- **No queue worker.** `QUEUE_CONNECTION=database` is set, but nothing in
  the app actually dispatches a queued job — Phase 11's admin notification
  email (`App\Mail\AdminNotification`) is sent synchronously, on purpose,
  specifically because a `php artisan queue:work` daemon is a long-running
  background process, and GoDaddy shared hosting doesn't support those at
  all. There's nothing to configure here.
- **No cron job needed.** `routes/console.php` only contains Laravel's
  default scaffolded `inspire` example — nothing in this app is scheduled
  via `php artisan schedule:run`, so no cPanel Cron Jobs entry needs to be
  created for that purpose. (You may still want to use cPanel's Cron Jobs
  tool for the one-time step-5 workaround if you don't have SSH — that's
  unrelated and doesn't need to keep running afterward.)

## Maintenance — optimizing already-uploaded images

New course/banner/testimonial/page-content image uploads are resized and
recompressed automatically on save (`App\Support\ImageOptimizer`) — a
full-resolution phone photo no longer ships to visitors at its original
size, which is what made the homepage hero slider slow to load before
this was added. That fix only applies going forward, though; it doesn't
touch images uploaded before it existed.

To shrink any already-uploaded images that are still at their original
size, run this once after deploying (SSH, from the app root):

```bash
php artisan images:optimize --dry-run   # reports potential savings, changes nothing
php artisan images:optimize             # actually resizes/recompresses in place
```

It's safe to run more than once — an image already at or below the target
size is left alone, so re-running it later (e.g. after uploading a batch
of old images some other way) only touches what's still oversized.

## Troubleshooting

**Composer runs out of memory / gets killed on the server.** Expected —
see "Why build locally" above. Build `vendor/` on your own machine and
upload it; don't run `composer install` on the shared server at all.

**500 error immediately after upload, before you've even filled in `.env`.**
Almost always either (a) the API subdomain's document root points at the
app root instead of `backend/public` (step 3), or (b) `storage/` and
`bootstrap/cache/` aren't writable by the web server. Laravel needs those
two directories (and everything under them) to be writable; if your upload
method reset permissions, set both to `755` (or `775` if `755` still
errors) recursively via File Manager's permissions tool or
`chmod -R 755 storage bootstrap/cache` over SSH.

**Direct visits to routes like `/training` or a refresh on `/admin/...`
404.** The frontend's `.htaccess` either didn't get uploaded (re-check
that `dist/.htaccess` exists locally after `npm run build`, and that your
upload included dotfiles — some FTP clients hide them by default and skip
them unless you enable "show hidden files") or ended up in the wrong
folder (it needs to sit directly in `public_html`, next to `index.html`,
not in a subfolder).

**Login/register works locally but fails or silently doesn't set a
session in production.** Check, in order: `FRONTEND_URL` and
`SANCTUM_STATEFUL_DOMAINS` in the backend `.env` match your actual
frontend domain exactly (bare host for the latter, full URL for the
former); `SESSION_SECURE_COOKIE=true` and the site is actually being
visited over `https://`, not `http://` (a secure cookie is silently
dropped by the browser over plain http); and that the frontend was built
with the correct `VITE_API_BASE_URL` (this is baked in at build time — a
wrong value here means a rebuild, not just an `.env` edit).

**`.env` edits on the server don't seem to take effect.** If you've run
`php artisan config:cache` (step 9), Laravel is reading the cached
snapshot, not the live file — re-run `config:cache` (or `config:clear` to
stop caching) after every `.env` change.

**Uploaded images/resumes save but their URLs 404.** `php artisan
storage:link` (step 5) wasn't run, or didn't run inside the right
directory. The symlink it creates (`public/storage` →
`storage/app/public`) has to exist inside the exact app folder your `api.`
subdomain's document root points at.

# Talent Track Technologies — Architecture

## What this is

A Training + Placement + Recruitment + Career Consulting platform, built as
a decoupled monorepo: a React SPA (public website + admin dashboard) talking
to a Laravel REST API over JSON, authenticated with Laravel Sanctum.

## Repository layout

```
talenttrack/
  frontend/          React 19 + Vite + React Router SPA
    src/
      components/     Reusable UI building blocks (Button, Card, Header, ...)
      pages/
        public/        The 10+ public-facing pages (Home, About, Training, ...)
        admin/          Admin dashboard pages (Login, Dashboard, Leads, ...)
      layouts/         PublicLayout, AdminLayout (page shells)
      routes/          AppRoutes.jsx — the central route table
      services/        api.js — the shared Axios client
      hooks/           Custom React hooks
      context/         React context providers (AuthContext, ...)
      utils/           Formatting/validation helpers
      assets/          Images, the brand logo, icons
  backend/            Laravel 12 REST API (PHP ^8.2; bump to 13 once PHP 8.3+ is available)
    app/
      Http/Controllers/    Thin controllers — validate via Form Requests,
                            delegate to Services, return API Resources
      Http/Requests/        Form Request validation classes (added per module)
      Http/Resources/       API Resource transformers (added per module)
      Models/                Eloquent models
      Services/              Business logic (keeps controllers thin)
      Policies/               Authorization rules per role
      Notifications/          Email (and later SMS/WhatsApp) notifications
    routes/
      api.php               All REST endpoints (public + /admin/* protected)
      web.php               Just a JSON health check — no Blade UI
    database/
      migrations/            Schema, one table per migration
      seeders/                Realistic Talent Track demo/dev data
      factories/              Model factories for tests/seeding
  docs/               Architecture notes, phase plan, API reference (grows
                       as phases complete)
```

## Why this split

- **Decoupled frontend/backend**: the React SPA and the Laravel API can be
  deployed, scaled and cached independently, and the same API can later
  serve a mobile app if needed.
- **REST + Sanctum**: Sanctum gives simple token auth for the admin
  dashboard (SPA cookie-based auth, or bearer tokens) without the overhead
  of a full OAuth server — appropriate for a single first-party frontend.
- **Service classes**: controllers stay thin (validate → delegate → respond);
  anything with real business logic (lead assignment, application status
  transitions, notification fan-out) lives in `app/Services`.
- **Consistent API envelope**: every response follows
  `{ "success": bool, "message": string, "data": {...} }`, so the frontend's
  Axios layer can handle success/error paths uniformly.

## Core data flow (placement example)

```
Placement page → Placement Categories → Category Jobs → Job Details
  → Apply Now → candidate_applications row (+ resume file) → Admin Dashboard
```

Every meaningful public enquiry (training, placement, recruitment,
consulting, general contact) is captured as a `leads` row with a
`lead_sources` reference, so the admin team never loses an enquiry and can
report on conversion by service/source.

## Roles

`Super Admin`, `Admin`, `Counsellor`, `Placement Executive`, `Recruitment
Executive` — enforced with Laravel policies/middleware on the `/api/admin/*`
route group (built out in Phase 4/9).

## Environment note (read before Phase 3)

The cloud sandbox used to build this project cannot reach `packagist.org`
(Composer's registry) due to network policy, so `composer install` must be
run on your own machine — see `backend/README.md`. `npm`/`registry.npmjs.org`
is reachable from the sandbox, so the frontend was scaffolded and
`npm install`/`npm run build` already verified there.

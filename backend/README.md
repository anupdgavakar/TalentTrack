# Talent Track Technologies — Backend (API)

Laravel REST API for the Talent Track Technologies platform (Training,
Placement, Recruitment, Career Consulting). Laravel Sanctum handles admin
authentication; MySQL is the target database.

Running on **Laravel 12** (PHP ^8.2) to match the PHP version available in
local development. Bump `laravel/framework` to `^13.0` and `"php": "^8.3"`
in `composer.json` once PHP 8.3+ is available — everything else in this
skeleton is unaffected by that upgrade.

Business logic (migrations, models, controllers, API routes, auth) is built
up phase by phase — see `../docs/ARCHITECTURE.md` and `../docs/PHASE_PLAN.md`.

## First-time local setup

Requires PHP >= 8.2, Composer, and MySQL (or SQLite for a quick smoke test).

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure `DB_*` in `.env` for your local MySQL instance (create the
`talenttrack` database first), then:

```bash
php artisan migrate
php artisan serve
```

The API will be available at `http://localhost:8000`. `GET /` returns a
JSON health check; real endpoints under `/api/*` are added starting Phase 3/4.

### Quick SQLite alternative (no MySQL needed for a smoke test)

```bash
# in .env: DB_CONNECTION=sqlite, comment out the other DB_* lines
touch database/database.sqlite
php artisan migrate
php artisan serve
```

## Why isn't `vendor/` here?

This project is being built from a cloud sandbox whose network policy blocks
`packagist.org` (Composer's package registry), so `composer install` has to
be run on your own machine — it cannot run from the sandbox. Everything
Composer needs (`composer.json`) is already in place; running `composer
install` locally will fetch Laravel, Sanctum and the dev tooling normally.

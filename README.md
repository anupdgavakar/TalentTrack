# Talent Track Technologies

Training + Placement + Recruitment + Career Consulting platform.

- `frontend/` — React 19 + Vite + React Router SPA (public website + admin dashboard)
- `backend/` — Laravel 12 REST API (Sanctum auth, MySQL; PHP ^8.2)
- `docs/` — Architecture notes and phase-by-phase build plan

Start with **`HANDOVER.md`** for a full project overview and a guide to
every other document. See `docs/ARCHITECTURE.md` for the full architecture,
`docs/PHASE_PLAN.md` for build status, `docs/ADMIN_GUIDE.md` for using the
admin dashboard, and `docs/DEPLOYMENT.md` for deploying to production. Each
side also has its own `README.md` with setup steps.

## Quick start

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend (separate terminal)
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve    # http://localhost:8000
```

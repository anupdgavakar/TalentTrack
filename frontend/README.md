# Talent Track Technologies — Frontend

React 19 + Vite + React Router SPA: the public website and the admin
dashboard, talking to the Laravel API in `../backend` via the Axios client
in `src/services/api.js`.

See `../docs/ARCHITECTURE.md` for the full folder-by-folder breakdown.

## Local development

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if the API runs elsewhere
npm run dev             # http://localhost:5173
```

## Scripts

- `npm run dev` — Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — Oxlint

## Status

Phase 1 only: project scaffold, folder architecture, routing skeleton and
the shared API client. Real UI/branding lands in Phase 2, and each page's
actual content lands in Phase 5 onward — see `../docs/PHASE_PLAN.md`.

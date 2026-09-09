/**
 * Site-wide constants used by SEO/meta plumbing (Phase 12) — the frontend's
 * own public URL (for canonical links, Open Graph `og:url`, and JSON-LD
 * `sameAs`/`url` fields) and its display name (used to build every page's
 * `<title>`, e.g. "Training Programs | Talent Track Technologies").
 *
 * `VITE_SITE_URL` has been sitting in `.env.example` since Phase 1
 * ("Public site URL (used for canonical/OG tags)") unused until now — this
 * is where it's finally read. Falls back to `window.location.origin` so
 * nothing breaks if it's ever left unset.
 */
export const SITE_NAME = "Talent Track Technologies";

export const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, "");

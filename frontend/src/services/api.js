import axios from "axios";

// Central Axios instance for all API calls.
// Base URL comes from the environment so dev/staging/production can point
// at different Laravel backends without code changes.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Sanctum's CSRF-cookie route lives at the app root (/sanctum/csrf-cookie),
// not under /api — derive it from the same base instead of hard-coding a
// second env var.
const APP_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true, // required for Laravel Sanctum SPA auth (cookie-based)
  // Axios 1.x stopped auto-attaching the X-XSRF-TOKEN header on cross-origin
  // requests unless this is explicitly enabled (a security-motivated change
  // independent of `withCredentials`). The frontend (:5173) and backend
  // (:8000) are different origins even on the same "localhost" host, so
  // without this every POST/PUT/DELETE fails Laravel's CSRF check with
  // "CSRF token mismatch" — the cookie is set fine, it just never gets sent
  // back as a header.
  withXSRFToken: true,
});

let csrfCookiePromise = null;

/**
 * Sanctum's SPA ("stateful") auth needs a CSRF cookie set before the first
 * state-changing request — call this once before register/login/logout.
 * Safe to call more than once per page load: the underlying request only
 * actually fires the first time.
 */
export function ensureCsrfCookie() {
  if (!csrfCookiePromise) {
    csrfCookiePromise = axios.get(`${APP_BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  }
  return csrfCookiePromise;
}

export default api;

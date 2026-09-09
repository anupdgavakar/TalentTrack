/**
 * Tiny in-memory cache for the admin section's list/dashboard requests,
 * keyed by request path. Lives at module scope so it survives navigating
 * between admin pages (each is a full route/component remount) — it does
 * NOT survive a hard page reload, which is the right trade-off: a reload
 * always gets fresh data, a click between Dashboard/Courses/Categories/
 * Enrollments does not.
 *
 * Paired with hooks/useCachedFetch.js (renders the cached value instantly,
 * then silently revalidates in the background) and invalidated by the
 * admin CRUD pages after a create/update/delete so a mutated list doesn't
 * keep showing stale cached data.
 */
const cache = new Map();

export function getCached(key) {
  return cache.has(key) ? cache.get(key) : undefined;
}

export function setCached(key, value) {
  cache.set(key, value);
}

/** Drops every cached entry whose key starts with `prefix` — covers every
 * paginated/filtered variant of a given endpoint (e.g. invalidating
 * "/admin/courses" also clears "/admin/courses?page=2"). */
export function invalidate(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

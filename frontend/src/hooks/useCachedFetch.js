import { useState, useEffect, useRef, useCallback } from "react";
import api from "../services/api";
import { getCached, setCached } from "../utils/adminCache";

/**
 * Stale-while-revalidate version of useFetch, for the admin nav pages
 * (Dashboard/Courses/Categories/Enrollments). The first time a path is
 * requested there's no way around the real network round trip, so it
 * behaves exactly like useFetch: loading, then data. On every visit after
 * that — e.g. clicking back to Courses after checking Categories — the
 * previously-cached data renders immediately with no loading state at all,
 * while a background request quietly re-fetches and updates it if
 * anything changed. If that background refresh fails, the cached data
 * stays on screen rather than being replaced by an error.
 *
 * Cache entries are cleared explicitly (see utils/adminCache.js's
 * `invalidate`) by the admin pages that create/update/delete something, so
 * a mutated list always shows fresh data on the next visit instead of a
 * stale cached one.
 */
export default function useCachedFetch(path) {
  const [data, setData] = useState(() => (path ? getCached(path) : undefined) ?? null);
  const [loading, setLoading] = useState(() => Boolean(path) && getCached(path) === undefined);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    const hadCached = getCached(path) !== undefined;
    const id = ++requestId.current;

    if (hadCached) {
      setData(getCached(path));
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
      setError(null);
    }

    api
      .get(path)
      .then((res) => {
        if (id !== requestId.current) return;
        setCached(path, res.data.data);
        setData(res.data.data);
        setError(null);
      })
      .catch((err) => {
        if (id !== requestId.current) return;
        // A cached screen stays up even if the quiet background refresh
        // fails — only show the error state when there was nothing to
        // fall back on.
        if (!hadCached) {
          setError(err.response?.data?.message || "Something went wrong. Please try again.");
        }
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [path, reloadTick]);

  const refetch = useCallback(() => setReloadTick((t) => t + 1), []);

  return { data, loading, error, refetch };
}

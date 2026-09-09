import { useState, useEffect, useRef, useCallback } from "react";
import api from "../services/api";

/**
 * Minimal GET-request hook used by every public page that reads from the
 * API. Re-fetches whenever `path` changes (e.g. a filter or page number
 * baked into the query string) and ignores a stale response if a newer
 * request has since started, so fast filter clicks can't flash
 * out-of-order data.
 *
 * Pass `path: null` to skip fetching (e.g. a detail page waiting on a
 * param that isn't ready yet).
 *
 * Also returns `refetch()` — re-runs the same request without needing to
 * change `path`. Used by the admin list pages (Phase 6+) to reload a list
 * after a create/update/delete instead of relying on a path change.
 */
export default function useFetch(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    api
      .get(path)
      .then((res) => {
        if (id === requestId.current) setData(res.data.data);
      })
      .catch((err) => {
        if (id === requestId.current) {
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

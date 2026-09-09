import { createContext, useContext, useState, useCallback, useEffect } from "react";
import api, { ensureCsrfCookie } from "../services/api";

/**
 * Candidate (and admin) authentication, backed by Laravel Sanctum's SPA
 * ("stateful") flow — a session cookie, not a bearer token. There's no
 * token to store: `login`/`register` just need the CSRF cookie set first,
 * then every request (including the initial session check below) is
 * authenticated automatically by the browser's cookie jar.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while the initial session check runs
  const [actionLoading, setActionLoading] = useState(false);

  // On first load, see if a session from an earlier visit is still valid —
  // this is what keeps a candidate (or admin) logged in across a refresh.
  useEffect(() => {
    let cancelled = false;

    api
      .get("/auth/me")
      .then(({ data }) => {
        if (!cancelled) setUser(data.data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(async (payload) => {
    setActionLoading(true);
    try {
      await ensureCsrfCookie();
      const { data } = await api.post("/auth/register", payload);
      setUser(data.data);
      return data.data;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setActionLoading(true);
    try {
      await ensureCsrfCookie();
      const { data } = await api.post("/auth/login", credentials);
      setUser(data.data);
      return data.data;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setActionLoading(true);
    try {
      await api.post("/auth/logout").catch(() => {});
    } finally {
      setUser(null);
      setActionLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    actionLoading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

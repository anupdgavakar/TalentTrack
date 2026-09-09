import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";

/**
 * Route guard shared by the /admin branch and the candidate /dashboard
 * branch (Phase 8). While AuthContext's mount-time session check
 * (`GET /auth/me`) is still in flight we show a loader rather than
 * bouncing straight to the login page — otherwise every hard refresh of a
 * protected page would flash the login screen even for an already-logged-in
 * user.
 *
 * `requireAdmin` distinguishes "must be logged in" from "must be logged in
 * as an admin"; `redirectTo` is where an unauthenticated visitor is sent —
 * the admin section and the candidate section each have their own login
 * page, so this can't be hard-coded.
 */
export default function ProtectedRoute({ requireAdmin = false, redirectTo = "/admin/login" }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader label="Checking session…" />
      </div>
    );
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

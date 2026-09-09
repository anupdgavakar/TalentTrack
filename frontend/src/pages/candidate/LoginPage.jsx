import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FormInput from "../../components/ui/FormInput";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Loader from "../../components/ui/Loader";
import useSeo from "../../hooks/useSeo";

/**
 * Candidate-facing login (Phase 8) — distinct from Admin Login
 * (pages/admin/LoginPage.jsx): this one lives inside PublicLayout (site
 * header/footer stay visible) since a candidate is still just a visitor
 * browsing the site, not entering a separate admin portal. Any account can
 * sign in here, including an admin one — it just lands them on the admin
 * dashboard instead of the candidate one (see the redirect logic below).
 */
export default function CandidateLoginPage() {
  useSeo({ title: "Log In", noindex: true });

  const { login, loading, isAuthenticated, isAdmin, actionLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const destinationFor = (admin) => location.state?.from?.pathname || (admin ? "/admin/dashboard" : "/dashboard");

  // Already signed in (e.g. followed a link to /login by mistake) — skip
  // straight past the form instead of showing it again.
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(destinationFor(isAdmin), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated, isAdmin, navigate]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const loggedInUser = await login(form);
      navigate(destinationFor(loggedInUser.role === "admin"), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    }
  };

  if (loading) {
    return (
      <div className="container section">
        <Loader center label="Checking session…" />
      </div>
    );
  }

  return (
    <>
      <header className="page-header">
        <div className="container">
          <h1>Log In</h1>
          <p>Sign in to track your course enrollments and job applications.</p>
        </div>
      </header>

      <section className="section">
        <div className="container auth-layout">
          <div className="form-card">
            {error && (
              <div style={{ marginBottom: "var(--space-5)" }}>
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <FormInput
                id="login-email"
                type="email"
                label="Email"
                required
                autoComplete="username"
                value={form.email}
                onChange={update("email")}
              />
              <FormInput
                id="login-password"
                type="password"
                label="Password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={update("password")}
              />
              <Button type="submit" variant="accent" block disabled={actionLoading}>
                {actionLoading ? "Signing in…" : "Log In"}
              </Button>
            </form>

            <p className="auth-layout__switch">
              New here? <Link to="/register">Create an account</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

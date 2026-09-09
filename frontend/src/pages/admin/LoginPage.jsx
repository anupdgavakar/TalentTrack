import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FormInput from "../../components/ui/FormInput";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Loader from "../../components/ui/Loader";
import useSeo from "../../hooks/useSeo";
import logo from "../../assets/logo.png";

export default function AdminLoginPage() {
  useSeo({ title: "Admin Login", noindex: true });

  const { login, logout, loading, isAuthenticated, isAdmin, actionLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  // If a session from an earlier visit is already an admin session, skip
  // straight to the dashboard instead of showing the login form again.
  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const loggedInUser = await login(form);
      if (loggedInUser.role !== "admin") {
        // A real candidate account, just not an admin one — don't leave
        // them signed in on the admin login screen.
        await logout();
        setError("This account doesn't have administrator access.");
        return;
      }
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    }
  };

  if (loading) {
    return (
      <div className="admin-auth-screen">
        <Loader center label="Checking session…" />
      </div>
    );
  }

  return (
    <div className="admin-auth-screen">
      <div className="admin-auth-card">
        <Link to="/" className="admin-auth-card__logo" aria-label="Talent Track Technologies — home">
          <img src={logo} alt="Talent Track Technologies" />
        </Link>
        <h1>Admin Login</h1>
        <p className="admin-auth-card__hint">Sign in to manage courses, categories and enrollments.</p>

        {error && (
          <div style={{ marginBottom: "var(--space-5)" }}>
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormInput
            id="admin-email"
            type="email"
            label="Email"
            required
            autoComplete="username"
            value={form.email}
            onChange={update("email")}
          />
          <FormInput
            id="admin-password"
            type="password"
            label="Password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={update("password")}
          />
          <Button type="submit" variant="primary" block disabled={actionLoading}>
            {actionLoading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        {import.meta.env.DEV && (
          <p className="admin-auth-card__demo">
            Demo admin account: <code>admin@talenttracktech.local</code> / <code>password</code>
          </p>
        )}

        <Link to="/" className="admin-auth-card__back">
          ← Back to the site
        </Link>
      </div>
    </div>
  );
}

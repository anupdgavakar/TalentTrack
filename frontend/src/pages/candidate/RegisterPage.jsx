import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FormInput from "../../components/ui/FormInput";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Loader from "../../components/ui/Loader";
import useSeo from "../../hooks/useSeo";

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", password_confirmation: "" };

export default function CandidateRegisterPage() {
  useSeo({ title: "Register", noindex: true });

  const { register, loading, isAuthenticated, actionLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const fieldError = (name) => fieldErrors[name]?.[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const response = err.response;
      setError(response?.data?.message || "Something went wrong — please try again.");
      setFieldErrors(response?.data?.errors || {});
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
          <h1>Create an Account</h1>
          <p>Sign up to keep track of the courses and jobs you apply to.</p>
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
                id="register-name"
                label="Full name"
                required
                value={form.name}
                onChange={update("name")}
                error={fieldError("name")}
              />
              <FormInput
                id="register-email"
                type="email"
                label="Email"
                required
                autoComplete="username"
                value={form.email}
                onChange={update("email")}
                error={fieldError("email")}
              />
              <FormInput
                id="register-phone"
                type="tel"
                label="Phone"
                value={form.phone}
                onChange={update("phone")}
                error={fieldError("phone")}
              />
              <FormInput
                id="register-password"
                type="password"
                label="Password"
                required
                hint="At least 8 characters, with letters and numbers"
                autoComplete="new-password"
                value={form.password}
                onChange={update("password")}
                error={fieldError("password")}
              />
              <FormInput
                id="register-password-confirmation"
                type="password"
                label="Confirm password"
                required
                autoComplete="new-password"
                value={form.password_confirmation}
                onChange={update("password_confirmation")}
              />
              <Button type="submit" variant="accent" block disabled={actionLoading}>
                {actionLoading ? "Creating account…" : "Create Account"}
              </Button>
            </form>

            <p className="auth-layout__switch">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

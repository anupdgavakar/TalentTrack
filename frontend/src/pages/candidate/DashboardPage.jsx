import { GraduationCap, Briefcase, FileText, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import useFetch from "../../hooks/useFetch";
import useSeo from "../../hooks/useSeo";
import { useAuth } from "../../context/AuthContext";

// A candidate's own enrollment/application history — the payoff for having
// an account at all (see docs/PHASE_PLAN.md's Phase 5 note on why
// login/register were deferred until this page existed to make them
// worthwhile). Reuses the admin panel/table/status-badge styles
// (styles/admin.css) rather than inventing a second table look, since
// those classes aren't actually scoped to the admin shell.
export default function CandidateDashboardPage() {
  useSeo({ title: "My Dashboard", noindex: true });

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch("/me/dashboard");

  const enrollments = data?.enrollments || [];
  const applications = data?.applications || [];

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <header className="page-header">
        <div className="container admin-page__header">
          <div>
            <h1>My Dashboard</h1>
            <p>Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.</p>
          </div>
          <Button variant="outline" size="sm" icon={LogOut} iconPosition="left" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      <section className="section">
        <div className="container">
          {error && <Alert variant="error">{error}</Alert>}
          {loading && <Loader center label="Loading your dashboard…" />}

          {!loading && !error && (
            <>
              <div className="admin-panel" style={{ marginBottom: "var(--space-8)" }}>
                <div className="admin-panel__header">
                  <h2>My Course Enrollments</h2>
                  <Button to="/training" variant="ghost" size="sm">
                    Browse courses
                  </Button>
                </div>

                {enrollments.length === 0 && (
                  <EmptyState
                    icon={GraduationCap}
                    title="No enrollments yet"
                    description="Enrol in a course and it'll show up here."
                    action={
                      <Button to="/training" variant="primary">
                        Browse Training
                      </Button>
                    }
                  />
                )}

                {enrollments.length > 0 && (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Status</th>
                          <th>Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((enrollment) => (
                          <tr key={enrollment.id}>
                            <td className="admin-table__title">{enrollment.course?.title || "—"}</td>
                            <td>
                              <span className={`status-badge status-badge--${enrollment.status}`}>
                                {enrollment.status}
                              </span>
                            </td>
                            <td className="admin-table__muted">
                              {new Date(enrollment.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="admin-panel">
                <div className="admin-panel__header">
                  <h2>My Job Applications</h2>
                  <Button to="/placement" variant="ghost" size="sm">
                    Browse jobs
                  </Button>
                </div>

                {applications.length === 0 && (
                  <EmptyState
                    icon={Briefcase}
                    title="No applications yet"
                    description="Apply for a role and it'll show up here."
                    action={
                      <Button to="/placement" variant="primary">
                        Browse Placement
                      </Button>
                    }
                  />
                )}

                {applications.length > 0 && (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Job</th>
                          <th>Status</th>
                          <th>Resume</th>
                          <th>Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((application) => (
                          <tr key={application.id}>
                            <td className="admin-table__title">{application.job_posting?.title || "—"}</td>
                            <td>
                              <span className={`status-badge status-badge--${application.status}`}>
                                {application.status}
                              </span>
                            </td>
                            <td>
                              {application.resume_url ? (
                                <a
                                  href={application.resume_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="admin-table__resume-link"
                                >
                                  <FileText size={14} aria-hidden="true" />
                                  View
                                </a>
                              ) : (
                                <span className="admin-table__muted">—</span>
                              )}
                            </td>
                            <td className="admin-table__muted">
                              {new Date(application.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

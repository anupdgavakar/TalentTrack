import {
  GraduationCap,
  Tags,
  Briefcase,
  FolderKanban,
  Clock,
  PhoneCall,
  CheckCircle2,
  XCircle,
  Star,
  Video,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Alert from "../../components/ui/Alert";
import useCachedFetch from "../../hooks/useCachedFetch";
import { useAuth } from "../../context/AuthContext";

const ENROLLMENT_STATUS_META = [
  { key: "new", label: "New", icon: Clock },
  { key: "contacted", label: "Contacted", icon: PhoneCall },
  { key: "enrolled", label: "Enrolled", icon: CheckCircle2 },
  { key: "rejected", label: "Rejected", icon: XCircle },
];

const APPLICATION_STATUS_META = [
  { key: "new", label: "New", icon: Clock },
  { key: "shortlisted", label: "Shortlisted", icon: Star },
  { key: "interview", label: "Interview", icon: Video },
  { key: "placed", label: "Placed", icon: CheckCircle2 },
  { key: "rejected", label: "Rejected", icon: XCircle },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();

  // A single endpoint (Api\Admin\DashboardController::stats) instead of a
  // dozen-plus separate requests — see that controller's docblock for why.
  const { data, loading, error } = useCachedFetch("/admin/dashboard/stats");
  const recentEnrollments = data?.recent_enrollments || [];
  const recentApplications = data?.recent_applications || [];
  const enrollmentsByStatus = data?.enrollments_by_status || {};
  const applicationsByStatus = data?.applications_by_status || {};

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1>Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h1>
          <p>Here's what's happening across Training and Placement right now.</p>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading && <Loader center label="Loading dashboard…" />}

      {!loading && !error && data && (
        <>
          <h2 style={{ marginBottom: "var(--space-4)" }}>Training</h2>
          <div className="admin-stat-grid" style={{ marginBottom: "var(--space-8)" }}>
            <div className="admin-stat-card">
              <div className="admin-stat-card__icon">
                <GraduationCap size={22} aria-hidden="true" />
              </div>
              <div>
                <div className="admin-stat-card__value">{data.courses_count}</div>
                <div className="admin-stat-card__label">Courses</div>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card__icon">
                <Tags size={22} aria-hidden="true" />
              </div>
              <div>
                <div className="admin-stat-card__value">{data.training_categories_count}</div>
                <div className="admin-stat-card__label">Training Categories</div>
              </div>
            </div>

            {ENROLLMENT_STATUS_META.map(({ key, label, icon: Icon }) => (
              <div className="admin-stat-card" key={key}>
                <div className="admin-stat-card__icon">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <div className="admin-stat-card__value">{enrollmentsByStatus[key] ?? 0}</div>
                  <div className="admin-stat-card__label">{label} Enrollments</div>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ marginBottom: "var(--space-4)" }}>Placement &amp; Recruitment</h2>
          <div className="admin-stat-grid" style={{ marginBottom: "var(--space-8)" }}>
            <div className="admin-stat-card">
              <div className="admin-stat-card__icon">
                <Briefcase size={22} aria-hidden="true" />
              </div>
              <div>
                <div className="admin-stat-card__value">{data.jobs_count}</div>
                <div className="admin-stat-card__label">Job Postings</div>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card__icon">
                <FolderKanban size={22} aria-hidden="true" />
              </div>
              <div>
                <div className="admin-stat-card__value">{data.job_categories_count}</div>
                <div className="admin-stat-card__label">Job Categories</div>
              </div>
            </div>

            {APPLICATION_STATUS_META.map(({ key, label, icon: Icon }) => (
              <div className="admin-stat-card" key={key}>
                <div className="admin-stat-card__icon">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <div className="admin-stat-card__value">{applicationsByStatus[key] ?? 0}</div>
                  <div className="admin-stat-card__label">{label} Applications</div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-panel" style={{ marginBottom: "var(--space-8)" }}>
            <div className="admin-panel__header">
              <h2>Recent enrollments</h2>
              <Button to="/admin/enrollments" variant="ghost" size="sm">
                View all
              </Button>
            </div>

            {recentEnrollments.length === 0 && <p style={{ color: "var(--text-muted)" }}>No enrollments yet.</p>}

            {recentEnrollments.length > 0 && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnrollments.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td>{enrollment.full_name}</td>
                        <td>{enrollment.course?.title || "—"}</td>
                        <td>
                          <span className={`status-badge status-badge--${enrollment.status}`}>{enrollment.status}</span>
                        </td>
                        <td className="admin-table__muted">{new Date(enrollment.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-panel">
            <div className="admin-panel__header">
              <h2>Recent job applications</h2>
              <Button to="/admin/applications" variant="ghost" size="sm">
                View all
              </Button>
            </div>

            {recentApplications.length === 0 && <p style={{ color: "var(--text-muted)" }}>No applications yet.</p>}

            {recentApplications.length > 0 && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Job</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((application) => (
                      <tr key={application.id}>
                        <td>{application.full_name}</td>
                        <td>{application.job_posting?.title || "—"}</td>
                        <td>
                          <span className={`status-badge status-badge--${application.status}`}>{application.status}</span>
                        </td>
                        <td className="admin-table__muted">{new Date(application.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

import { useState } from "react";
import { FileText, ClipboardList } from "lucide-react";
import Loader from "../../../components/ui/Loader";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import Pagination from "../../../components/ui/Pagination";
import useCachedFetch from "../../../hooks/useCachedFetch";
import api from "../../../services/api";
import { invalidate } from "../../../utils/adminCache";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "placed", label: "Placed" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_OPTIONS = ["new", "shortlisted", "interview", "placed", "rejected"];

export default function JobApplicationsListPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const path = `/admin/job-applications?page=${page}${status ? `&status=${status}` : ""}`;
  const { data, loading, error, refetch } = useCachedFetch(path);
  const applications = data?.items || [];
  const meta = data?.meta;

  // Tracks which row has a status update in flight, so only that row's
  // dropdown disables rather than the whole table.
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const handleStatusChange = async (application, newStatus) => {
    setUpdatingId(application.id);
    setUpdateError(null);
    try {
      await api.put(`/admin/job-applications/${application.id}`, { status: newStatus });
      invalidate("/admin/job-applications");
      invalidate("/admin/dashboard");
      invalidate("/admin/reports");
      refetch();
    } catch (err) {
      setUpdateError(err.response?.data?.message || "Couldn't update the status — please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const changeTab = (value) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1>Job Applications</h1>
          <p>Applications submitted from a job's "Apply for this role" form on the public site.</p>
        </div>
      </div>

      <div className="admin-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`admin-tabs__tab${status === tab.value ? " is-active" : ""}`}
            onClick={() => changeTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {updateError && (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <Alert variant="error">{updateError}</Alert>
        </div>
      )}

      {loading && <Loader center label="Loading applications…" />}

      {!loading && !error && applications.length === 0 && (
        <EmptyState icon={ClipboardList} title="No applications here" description="Nothing matches this filter yet." />
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Job</th>
                  <th>Contact</th>
                  <th>Resume</th>
                  <th>Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>{application.full_name}</td>
                    <td>{application.job_posting?.title || "—"}</td>
                    <td>
                      <div>{application.email}</div>
                      {application.phone && <div className="admin-table__muted">{application.phone}</div>}
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
                    <td className="admin-table__muted">{new Date(application.created_at).toLocaleDateString()}</td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={application.status}
                        disabled={updatingId === application.id}
                        onChange={(e) => handleStatusChange(application, e.target.value)}
                        aria-label={`Status for ${application.full_name}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div style={{ marginTop: "var(--space-8)" }}>
              <Pagination currentPage={meta.current_page} totalPages={meta.last_page} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </>
  );
}

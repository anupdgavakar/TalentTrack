import { useState } from "react";
import { ClipboardList } from "lucide-react";
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
  { value: "contacted", label: "Contacted" },
  { value: "enrolled", label: "Enrolled" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_OPTIONS = ["new", "contacted", "enrolled", "rejected"];

export default function EnrollmentsListPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const path = `/admin/course-enrollments?page=${page}${status ? `&status=${status}` : ""}`;
  const { data, loading, error, refetch } = useCachedFetch(path);
  const enrollments = data?.items || [];
  const meta = data?.meta;

  // Tracks which row has a status update in flight, so only that row's
  // dropdown disables rather than the whole table.
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const handleStatusChange = async (enrollment, newStatus) => {
    setUpdatingId(enrollment.id);
    setUpdateError(null);
    try {
      await api.put(`/admin/course-enrollments/${enrollment.id}`, { status: newStatus });
      invalidate("/admin/course-enrollments");
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
          <h1>Course Enrollments</h1>
          <p>Enquiries submitted from a course's "Enrol Now" form on the public site.</p>
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

      {loading && <Loader center label="Loading enrollments…" />}

      {!loading && !error && enrollments.length === 0 && (
        <EmptyState icon={ClipboardList} title="No enrollments here" description="Nothing matches this filter yet." />
      )}

      {!loading && !error && enrollments.length > 0 && (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Course</th>
                  <th>Contact</th>
                  <th>Message</th>
                  <th>Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>{enrollment.full_name}</td>
                    <td>{enrollment.course?.title || "—"}</td>
                    <td>
                      <div>{enrollment.email}</div>
                      {enrollment.phone && <div className="admin-table__muted">{enrollment.phone}</div>}
                    </td>
                    <td className="admin-table__message-cell">{enrollment.message || "—"}</td>
                    <td className="admin-table__muted">{new Date(enrollment.created_at).toLocaleDateString()}</td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={enrollment.status}
                        disabled={updatingId === enrollment.id}
                        onChange={(e) => handleStatusChange(enrollment, e.target.value)}
                        aria-label={`Status for ${enrollment.full_name}`}
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

import { useState } from "react";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import Button from "../../../components/ui/Button";
import Loader from "../../../components/ui/Loader";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import Pagination from "../../../components/ui/Pagination";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import useCachedFetch from "../../../hooks/useCachedFetch";
import api from "../../../services/api";
import { invalidate } from "../../../utils/adminCache";

const LISTING_TYPE_LABEL = { placement: "Placement", recruitment: "Recruitment" };

// Phase 15 QA fix: the backend now stops treating a posting as open once
// its closing_date has passed, even if "Active" is still checked (see
// JobPosting::scopeOpen()) — so the admin list needs its own status badge
// to reflect that, or "Active" here would silently lie about whether the
// posting is actually still visible/appliable-to on the public site.
function jobStatus(job) {
  if (!job.is_active) return { label: "Inactive", variant: "inactive" };
  if (job.closing_date && job.closing_date < new Date().toISOString().slice(0, 10)) {
    return { label: "Closed (past deadline)", variant: "inactive" };
  }
  return { label: "Active", variant: "active" };
}

export default function JobPostingsListPage() {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useCachedFetch(`/admin/job-postings?page=${page}`);
  const jobs = data?.items || [];
  const meta = data?.meta;

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/admin/job-postings/${deleteTarget.id}`);
      setDeleteTarget(null);
      invalidate("/admin/job-postings");
      invalidate("/admin/dashboard");
      // Deleting a job posting cascades (DB foreign key) to delete every
      // one of its applications too (Phase 13 bug fix) — see the matching
      // comment in CoursesListPage.jsx's handleDelete for why these two
      // invalidations are needed.
      invalidate("/admin/job-applications");
      invalidate("/admin/reports");
      refetch();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Couldn't delete this job posting — please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1>Job Postings</h1>
          <p>Every opening shown on the public Placement and Recruitment pages.</p>
        </div>
        <Button to="/admin/jobs/new" variant="primary" icon={Plus} iconPosition="left">
          Add Job Posting
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading && <Loader center label="Loading job postings…" />}

      {!loading && !error && jobs.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No job postings yet"
          description="Add your first opening to see it here and on the public site."
          action={
            <Button to="/admin/jobs/new" variant="primary">
              Add Job Posting
            </Button>
          }
        />
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Category</th>
                  <th>Listing</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div className="admin-table__title">{job.title}</div>
                      <div className="admin-table__muted">{job.company_name || "—"}</div>
                      {job.is_featured && <span className="status-badge status-badge--featured">Featured</span>}
                    </td>
                    <td>{job.category?.name || "—"}</td>
                    <td>{LISTING_TYPE_LABEL[job.listing_type] || job.listing_type}</td>
                    <td>{job.location || "—"}</td>
                    <td>
                      <span className={`status-badge status-badge--${jobStatus(job).variant}`}>
                        {jobStatus(job).label}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <Button to={`/admin/jobs/${job.id}/edit`} variant="ghost" size="sm" icon={Pencil} iconPosition="left">
                          Edit
                        </Button>
                        <button
                          type="button"
                          className="admin-table__icon-btn admin-table__icon-btn--danger"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(job);
                          }}
                          aria-label={`Delete ${job.title}`}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
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

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this job posting?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed, including its listing on the public site and every application submitted for it. This can't be undone.`
            : ""
        }
      />
      {deleteError && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <Alert variant="error">{deleteError}</Alert>
        </div>
      )}
    </>
  );
}

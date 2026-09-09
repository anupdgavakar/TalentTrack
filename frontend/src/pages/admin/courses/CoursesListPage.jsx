import { useState } from "react";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import Button from "../../../components/ui/Button";
import Loader from "../../../components/ui/Loader";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import Pagination from "../../../components/ui/Pagination";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import useCachedFetch from "../../../hooks/useCachedFetch";
import api from "../../../services/api";
import { invalidate } from "../../../utils/adminCache";

export default function CoursesListPage() {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useCachedFetch(`/admin/courses?page=${page}`);
  const courses = data?.items || [];
  const meta = data?.meta;

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/admin/courses/${deleteTarget.id}`);
      setDeleteTarget(null);
      invalidate("/admin/courses");
      invalidate("/admin/dashboard");
      // Deleting a course cascades (DB foreign key) to delete every one of
      // its enrollments too (Phase 13 bug fix) — without these, the
      // Enrollments and Reports screens kept showing rows/counts for
      // enrollments that no longer exist if they'd been cached earlier in
      // the session, and clicking a now-phantom enrollment's status
      // dropdown would 404.
      invalidate("/admin/course-enrollments");
      invalidate("/admin/reports");
      refetch();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Couldn't delete this course — please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1>Courses</h1>
          <p>Every course shown on the public Training page.</p>
        </div>
        <Button to="/admin/courses/new" variant="primary" icon={Plus} iconPosition="left">
          Add Course
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading && <Loader center label="Loading courses…" />}

      {!loading && !error && courses.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="No courses yet"
          description="Add your first course to see it here and on the public Training page."
          action={
            <Button to="/admin/courses/new" variant="primary">
              Add Course
            </Button>
          }
        />
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Mode</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className="admin-table__title-cell">
                        {course.image_url ? (
                          <img
                            src={course.image_url}
                            alt=""
                            className="admin-table__thumb"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span className="admin-table__thumb admin-table__thumb--placeholder">
                            <GraduationCap size={18} aria-hidden="true" />
                          </span>
                        )}
                        <div>
                          <div className="admin-table__title">{course.title}</div>
                          {course.is_featured && <span className="status-badge status-badge--featured">Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td>{course.category?.name || "—"}</td>
                    <td>{course.mode || "—"}</td>
                    <td>{course.fee ? `₹${Number(course.fee).toLocaleString("en-IN")}` : "—"}</td>
                    <td>
                      <span className={`status-badge status-badge--${course.is_active ? "active" : "inactive"}`}>
                        {course.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <Button to={`/admin/courses/${course.id}/edit`} variant="ghost" size="sm" icon={Pencil} iconPosition="left">
                          Edit
                        </Button>
                        <button
                          type="button"
                          className="admin-table__icon-btn admin-table__icon-btn--danger"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(course);
                          }}
                          aria-label={`Delete ${course.title}`}
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
        title="Delete this course?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed, including its listing on the public site and every enrollment submitted for it. This can't be undone.`
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

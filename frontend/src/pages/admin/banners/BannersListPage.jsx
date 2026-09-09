import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Loader from "../../../components/ui/Loader";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import useCachedFetch from "../../../hooks/useCachedFetch";
import api from "../../../services/api";
import { invalidate } from "../../../utils/adminCache";

// Unlike Courses/Job Postings, `/admin/banners` returns a plain array (no
// items/meta pagination wrapper) — homepage hero slides are a handful at
// most, not worth paginating. Same for Testimonials/Statistics below.
export default function BannersListPage() {
  const { data, loading, error, refetch } = useCachedFetch("/admin/banners");
  const banners = data || [];

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/admin/banners/${deleteTarget.id}`);
      setDeleteTarget(null);
      invalidate("/admin/banners");
      refetch();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Couldn't delete this banner — please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1>Homepage Banners</h1>
          <p>The hero slides shown at the top of the homepage, in order.</p>
        </div>
        <Button to="/admin/banners/new" variant="primary" icon={Plus} iconPosition="left">
          Add Banner
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading && <Loader center label="Loading banners…" />}

      {!loading && !error && banners.length === 0 && (
        <EmptyState
          icon={ImageIcon}
          title="No banners yet"
          description="Add your first hero slide to see it here and on the homepage."
          action={
            <Button to="/admin/banners/new" variant="primary">
              Add Banner
            </Button>
          }
        />
      )}

      {!loading && !error && banners.length > 0 && (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Banner</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id}>
                    <td>
                      <div className="admin-table__title-cell">
                        {banner.image ? (
                          <img
                            src={banner.image}
                            alt=""
                            className="admin-table__thumb"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span className="admin-table__thumb admin-table__thumb--placeholder">
                            <ImageIcon size={18} aria-hidden="true" />
                          </span>
                        )}
                        <div>
                          {banner.eyebrow && <div className="admin-table__muted">{banner.eyebrow}</div>}
                          <div className="admin-table__title">{banner.title}</div>
                        </div>
                      </div>
                    </td>
                    <td>{banner.sort_order}</td>
                    <td>
                      <span className={`status-badge status-badge--${banner.is_active ? "active" : "inactive"}`}>
                        {banner.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <Button to={`/admin/banners/${banner.id}/edit`} variant="ghost" size="sm" icon={Pencil} iconPosition="left">
                          Edit
                        </Button>
                        <button
                          type="button"
                          className="admin-table__icon-btn admin-table__icon-btn--danger"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(banner);
                          }}
                          aria-label={`Delete ${banner.title}`}
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
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this banner?"
        message={deleteTarget ? `"${deleteTarget.title}" will be permanently removed from the homepage. This can't be undone.` : ""}
      />
      {deleteError && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <Alert variant="error">{deleteError}</Alert>
        </div>
      )}
    </>
  );
}

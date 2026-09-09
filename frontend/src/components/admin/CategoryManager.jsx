import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import Button from "../ui/Button";
import Loader from "../ui/Loader";
import Alert from "../ui/Alert";
import EmptyState from "../ui/EmptyState";
import Modal from "../ui/Modal";
import FormInput from "../ui/FormInput";
import Textarea from "../ui/Textarea";
import ConfirmDialog from "./ConfirmDialog";
import useCachedFetch from "../../hooks/useCachedFetch";
import api from "../../services/api";
import { invalidate } from "../../utils/adminCache";

const EMPTY_FORM = { name: "", slug: "", description: "", is_active: true };

/**
 * Shared list + modal-form CRUD screen behind both category admin pages —
 * Training Categories (type=course, Phase 6) and Job Categories (type=job,
 * Phase 7). Same backend endpoint (`/admin/categories`), same shape, only
 * the `type` and the surrounding copy differ, so this is one component
 * parameterized by `type` rather than two near-duplicate files.
 */
export default function CategoryManager({ type, heading, description, listingLabel, listingCachePrefix }) {
  const { data, loading, error, refetch } = useCachedFetch("/admin/categories");
  const categories = useMemo(() => (data || []).filter((c) => c.type === type), [data, type]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug || "",
      description: category.description || "",
      is_active: Boolean(category.is_active),
    });
    setFormError(null);
    setFieldErrors({});
    setModalOpen(true);
  };

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const fieldError = (name) => fieldErrors[name]?.[0];

  const invalidateRelated = () => {
    invalidate("/admin/categories");
    invalidate(listingCachePrefix); // rows on that list embed the category name
    invalidate("/admin/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    // Matches the convention used by the Course/JobPosting admin forms:
    // an emptied optional field (here, slug — its hint says "leave blank
    // to auto-generate") is left out of the request entirely rather than
    // sent as "". Sending it as "" would overwrite the existing slug with
    // an empty string on save, since the backend only auto-generates a
    // slug on *create* (see backend/app/Models/Concerns/HasSlug.php), not
    // on update.
    const payload = { type };
    for (const [key, value] of Object.entries(form)) {
      if (value !== "" && value !== null && value !== undefined) {
        payload[key] = value;
      }
    }

    try {
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, payload);
      } else {
        await api.post("/admin/categories", payload);
      }
      setModalOpen(false);
      invalidateRelated();
      refetch();
    } catch (err) {
      const response = err.response;
      setFormError(response?.data?.message || "Something went wrong — please try again.");
      setFieldErrors(response?.data?.errors || {});
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/admin/categories/${deleteTarget.id}`);
      setDeleteTarget(null);
      invalidateRelated();
      refetch();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Couldn't delete this category — please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1>{heading}</h1>
          <p>{description}</p>
        </div>
        <Button variant="primary" icon={Plus} iconPosition="left" onClick={openCreate}>
          Add Category
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {deleteError && (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <Alert variant="error">{deleteError}</Alert>
        </div>
      )}

      {loading && <Loader center label="Loading categories…" />}

      {!loading && !error && categories.length === 0 && (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description={`Add a category so you can group ${listingLabel} on the public site.`}
          action={
            <Button variant="primary" onClick={openCreate}>
              Add Category
            </Button>
          }
        />
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>
                      <span className={`status-badge status-badge--${category.is_active ? "active" : "inactive"}`}>
                        {category.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <Button variant="ghost" size="sm" icon={Pencil} iconPosition="left" onClick={() => openEdit(category)}>
                          Edit
                        </Button>
                        <button
                          type="button"
                          className="admin-table__icon-btn admin-table__icon-btn--danger"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(category);
                          }}
                          aria-label={`Delete ${category.name}`}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={{ marginBottom: "var(--space-5)" }}>
              <Alert variant="error">{formError}</Alert>
            </div>
          )}

          <FormInput
            id="category-name"
            label="Name"
            required
            value={form.name}
            onChange={update("name")}
            error={fieldError("name")}
          />
          <FormInput
            id="category-slug"
            label="Slug"
            hint="Leave blank to auto-generate from the name"
            value={form.slug}
            onChange={update("slug")}
            error={fieldError("slug")}
          />
          <Textarea
            id="category-description"
            label="Description"
            rows={3}
            value={form.description}
            onChange={update("description")}
            error={fieldError("description")}
          />
          <label className="admin-checkbox" style={{ marginBottom: "var(--space-6)" }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Active (visible on the public site)
          </label>

          <div className="admin-form-actions">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving…" : editing ? "Save Changes" : "Add Category"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this category?"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed. Any ${listingLabel} already assigned to it will keep showing, but without a category.`
            : ""
        }
      />
    </>
  );
}

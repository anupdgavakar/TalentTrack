import { useState, createElement } from "react";
import { Plus, Pencil, Trash2, BarChart3 } from "lucide-react";
import Button from "../../../components/ui/Button";
import Loader from "../../../components/ui/Loader";
import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import Modal from "../../../components/ui/Modal";
import FormInput from "../../../components/ui/FormInput";
import Select from "../../../components/ui/Select";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import useCachedFetch from "../../../hooks/useCachedFetch";
import api from "../../../services/api";
import { invalidate } from "../../../utils/adminCache";
import getIcon, { ICON_NAMES } from "../../../utils/iconMap";

const ICON_OPTIONS = ICON_NAMES.map((name) => ({ value: name, label: name }));

const EMPTY_FORM = { label: "", value: "", icon: "", sort_order: "", is_active: true };

// A small, curated list (the homepage stats strip) — full list + modal
// form, same shape as CategoryManager, but not worth generalizing into a
// shared component since it's the only screen with this field set.
export default function StatisticsListPage() {
  const { data, loading, error, refetch } = useCachedFetch("/admin/statistics");
  const statistics = data || [];

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

  const openEdit = (statistic) => {
    setEditing(statistic);
    setForm({
      label: statistic.label || "",
      value: statistic.value || "",
      icon: statistic.icon || "",
      sort_order: statistic.sort_order ?? "",
      is_active: Boolean(statistic.is_active),
    });
    setFormError(null);
    setFieldErrors({});
    setModalOpen(true);
  };

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const fieldError = (name) => fieldErrors[name]?.[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const payload = { ...form, sort_order: form.sort_order === "" ? null : form.sort_order };

    try {
      if (editing) {
        await api.put(`/admin/statistics/${editing.id}`, payload);
      } else {
        await api.post("/admin/statistics", payload);
      }
      setModalOpen(false);
      invalidate("/admin/statistics");
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
      await api.delete(`/admin/statistics/${deleteTarget.id}`);
      setDeleteTarget(null);
      invalidate("/admin/statistics");
      refetch();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Couldn't delete this statistic — please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Rendered via createElement rather than `const PreviewIcon = getIcon(...)`
  // + `<PreviewIcon />` — that pattern reads to the linter as defining a new
  // component on every render (it can't tell `getIcon` just looks up an
  // existing lucide export), even though it's the same "component picked by
  // a string name" idea the table rows below and Home's StatsCard both use.
  const previewIcon = form.icon ? createElement(getIcon(form.icon), { size: 20, "aria-hidden": true }) : null;

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1>Homepage Statistics</h1>
          <p>The stat counters shown on the homepage (e.g. "25+ Training Programs").</p>
        </div>
        <Button variant="primary" icon={Plus} iconPosition="left" onClick={openCreate}>
          Add Statistic
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {deleteError && (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <Alert variant="error">{deleteError}</Alert>
        </div>
      )}

      {loading && <Loader center label="Loading statistics…" />}

      {!loading && !error && statistics.length === 0 && (
        <EmptyState
          icon={BarChart3}
          title="No statistics yet"
          description="Add your first stat to see it here and on the homepage."
          action={
            <Button variant="primary" onClick={openCreate}>
              Add Statistic
            </Button>
          }
        />
      )}

      {!loading && !error && statistics.length > 0 && (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Value</th>
                  <th>Label</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {statistics.map((statistic) => {
                  const RowIcon = getIcon(statistic.icon);
                  return (
                    <tr key={statistic.id}>
                      <td>
                        <span className="admin-table__thumb admin-table__thumb--placeholder">
                          <RowIcon size={18} aria-hidden="true" />
                        </span>
                      </td>
                      <td className="admin-table__title">{statistic.value}</td>
                      <td>{statistic.label}</td>
                      <td>{statistic.sort_order}</td>
                      <td>
                        <span className={`status-badge status-badge--${statistic.is_active ? "active" : "inactive"}`}>
                          {statistic.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table__actions">
                          <Button variant="ghost" size="sm" icon={Pencil} iconPosition="left" onClick={() => openEdit(statistic)}>
                            Edit
                          </Button>
                          <button
                            type="button"
                            className="admin-table__icon-btn admin-table__icon-btn--danger"
                            onClick={() => {
                              setDeleteError(null);
                              setDeleteTarget(statistic);
                            }}
                            aria-label={`Delete ${statistic.label}`}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Statistic" : "Add Statistic"}>
        <form onSubmit={handleSubmit}>
          {formError && (
            <div style={{ marginBottom: "var(--space-5)" }}>
              <Alert variant="error">{formError}</Alert>
            </div>
          )}

          <FormInput
            id="statistic-value"
            label="Value"
            required
            hint='e.g. "25+", "92%"'
            value={form.value}
            onChange={update("value")}
            error={fieldError("value")}
          />
          <FormInput
            id="statistic-label"
            label="Label"
            required
            hint='e.g. "Training Programs"'
            value={form.label}
            onChange={update("label")}
            error={fieldError("label")}
          />
          <Select
            id="statistic-icon"
            label="Icon"
            placeholder="— No icon —"
            value={form.icon}
            onChange={update("icon")}
            options={ICON_OPTIONS}
            error={fieldError("icon")}
          />
          {previewIcon && (
            <p className="admin-icon-preview">
              {previewIcon} Preview
            </p>
          )}
          <FormInput
            id="statistic-sort-order"
            type="number"
            min="0"
            label="Display order"
            hint="Lower numbers show first"
            value={form.sort_order}
            onChange={update("sort_order")}
            error={fieldError("sort_order")}
          />
          <label className="admin-checkbox" style={{ marginBottom: "var(--space-6)" }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Active (visible on the homepage)
          </label>

          <div className="admin-form-actions">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving…" : editing ? "Save Changes" : "Add Statistic"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this statistic?"
        message={deleteTarget ? `"${deleteTarget.label}" will be permanently removed from the homepage. This can't be undone.` : ""}
      />
    </>
  );
}

import { useState, useMemo, createElement } from "react";
import { Plus, Pencil, Trash2, FileText, GripVertical } from "lucide-react";
import Button from "../ui/Button";
import Loader from "../ui/Loader";
import Alert from "../ui/Alert";
import Modal from "../ui/Modal";
import FormInput from "../ui/FormInput";
import Textarea from "../ui/Textarea";
import RichTextEditor from "./RichTextEditor";
import Select from "../ui/Select";
import ConfirmDialog from "./ConfirmDialog";
import useCachedFetch from "../../hooks/useCachedFetch";
import api from "../../services/api";
import { invalidate } from "../../utils/adminCache";
import { PAGE_SECTION_KEYS } from "../../utils/pageSectionKeys";
import getIcon, { ICON_NAMES } from "../../utils/iconMap";

const ICON_OPTIONS = ICON_NAMES.map((name) => ({ value: name, label: name }));

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  body: "",
  icon: "",
  primary_label: "",
  primary_url: "",
  secondary_label: "",
  secondary_url: "",
  sort_order: "",
  is_active: true,
};

/**
 * The "fully editable content blocks" admin screen behind both About
 * Content and Contact Content (see AboutContentPage/ContactContentPage) —
 * one `page_sections` row per block, grouped here by `section_key` per
 * utils/pageSectionKeys.js. Mirrors CategoryManager's shared-component-
 * parameterized-by-prop pattern, but the grouped-panels layout is closer
 * to SettingsPage: each key gets its own `.admin-panel` with a label and
 * hint, rather than one flat table, since a "hero heading" and a
 * repeatable "approach card" need very different controls.
 *
 * A singleton key (fields.singleton === true) is edited in place — the
 * seeder (PageSectionSeeder) always creates one row for every key up
 * front, so in practice there's always something to edit here, but the
 * "not set yet" / Add fallback is kept in case a key is ever added to
 * PAGE_SECTION_KEYS without a matching seed row. A repeatable key renders
 * its rows as an ordered list with its own Add/Edit/Delete.
 */
export default function PageSectionManager({ page, heading, description }) {
  const path = `/admin/page-sections?page=${page}`;
  const { data, loading, error, refetch } = useCachedFetch(path);
  const rows = useMemo(() => data || [], [data]);
  const groups = PAGE_SECTION_KEYS[page] || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // the row being edited, or null when adding
  const [activeGroup, setActiveGroup] = useState(null); // the group config the modal is for
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const rowsForKey = (key) => rows.filter((r) => r.section_key === key).sort((a, b) => a.sort_order - b.sort_order);

  const openCreate = (group) => {
    setActiveGroup(group);
    setEditing(null);
    setForm({ ...EMPTY_FORM, sort_order: String(rowsForKey(group.key).length) });
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEdit = (group, row) => {
    setActiveGroup(group);
    setEditing(row);
    setForm({
      title: row.title || "",
      subtitle: row.subtitle || "",
      body: row.body || "",
      icon: row.icon || "",
      primary_label: row.primary_label || "",
      primary_url: row.primary_url || "",
      secondary_label: row.secondary_label || "",
      secondary_url: row.secondary_url || "",
      sort_order: row.sort_order ?? "",
      is_active: Boolean(row.is_active),
    });
    setImageFile(null);
    setImagePreview(row.image || null);
    setFormError(null);
    setFieldErrors({});
    setModalOpen(true);
  };

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const fieldError = (name) => fieldErrors[name]?.[0];

  const pickImage = (file) => {
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(editing?.image || null);
    }
  };

  const invalidateRelated = () => invalidate("/admin/page-sections");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeGroup) return;
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const payload = new FormData();
    payload.append("page", page);
    payload.append("section_key", activeGroup.key);
    payload.append("is_active", form.is_active ? "1" : "0");

    for (const field of activeGroup.fields) {
      if (field === "image") continue;
      const value = form[field];
      if (value !== "" && value !== null && value !== undefined) {
        payload.append(field, value);
      }
    }
    if (form.sort_order !== "" && form.sort_order !== null && form.sort_order !== undefined) {
      payload.append("sort_order", form.sort_order);
    }
    if (imageFile) payload.append("image", imageFile);
    if (editing) payload.append("_method", "PUT");

    try {
      if (editing) {
        await api.post(`/admin/page-sections/${editing.id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/admin/page-sections", payload, { headers: { "Content-Type": "multipart/form-data" } });
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
      await api.delete(`/admin/page-sections/${deleteTarget.id}`);
      setDeleteTarget(null);
      invalidateRelated();
      refetch();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Couldn't delete this content block — please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const previewIcon = form.icon ? createElement(getIcon(form.icon), { size: 20, "aria-hidden": true }) : null;

  // row.body may now be rich HTML (RichTextEditor) rather than plain text —
  // strip tags for this one-line list preview so the row shows readable
  // text instead of literal markup.
  const stripHtml = (html) => (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const previewText = (row) => row.title || row.subtitle || stripHtml(row.body) || "(no text set)";

  return (
    <>
      <div className="admin-page__header">
        <div>
          <h1>{heading}</h1>
          <p>{description}</p>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {deleteError && (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <Alert variant="error">{deleteError}</Alert>
        </div>
      )}

      {loading && <Loader center label="Loading content…" />}

      {!loading && !error && (
        <>
          {groups.map((group) => {
            const groupRows = rowsForKey(group.key);
            return (
              <div className="admin-panel" style={{ marginBottom: "var(--space-6)" }} key={group.key}>
                <div className="admin-panel__header">
                  <h2>{group.label}</h2>
                  {group.singleton ? (
                    groupRows.length > 0 && (
                      <Button variant="ghost" size="sm" icon={Pencil} iconPosition="left" onClick={() => openEdit(group, groupRows[0])}>
                        Edit
                      </Button>
                    )
                  ) : (
                    <Button variant="outline" size="sm" icon={Plus} iconPosition="left" onClick={() => openCreate(group)}>
                      Add item
                    </Button>
                  )}
                </div>
                <p className="admin-panel__hint">{group.hint}</p>

                {groupRows.length === 0 && (
                  <div className="page-section-row page-section-row--empty">
                    <FileText size={18} aria-hidden="true" />
                    <span>Not set yet.</span>
                    <Button variant="ghost" size="sm" icon={Plus} iconPosition="left" onClick={() => openCreate(group)}>
                      Add
                    </Button>
                  </div>
                )}

                {groupRows.map((row) => (
                  <div className="page-section-row" key={row.id}>
                    {!group.singleton && <GripVertical size={16} className="page-section-row__handle" aria-hidden="true" />}
                    {row.image && <img src={row.image} alt="" className="page-section-row__thumb" loading="lazy" />}
                    <div className="page-section-row__body">
                      <div className="page-section-row__title">{previewText(row)}</div>
                      {!row.is_active && <span className="status-badge status-badge--inactive">Hidden</span>}
                    </div>
                    {!group.singleton && (
                      <div className="admin-table__actions">
                        <Button variant="ghost" size="sm" icon={Pencil} iconPosition="left" onClick={() => openEdit(group, row)}>
                          Edit
                        </Button>
                        <button
                          type="button"
                          className="admin-table__icon-btn admin-table__icon-btn--danger"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(row);
                          }}
                          aria-label="Delete this item"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={activeGroup ? `${editing ? "Edit" : "Add"} — ${activeGroup.label}` : ""}
      >
        {activeGroup && (
          <form onSubmit={handleSubmit}>
            {formError && (
              <div style={{ marginBottom: "var(--space-5)" }}>
                <Alert variant="error">{formError}</Alert>
              </div>
            )}

            {activeGroup.fields.includes("icon") && (
              <>
                <Select
                  id="section-icon"
                  label="Icon"
                  placeholder="— No icon —"
                  value={form.icon}
                  onChange={update("icon")}
                  options={ICON_OPTIONS}
                  error={fieldError("icon")}
                />
                {previewIcon && <p className="admin-icon-preview">{previewIcon} Preview</p>}
              </>
            )}

            {activeGroup.fields.includes("title") && (
              <FormInput id="section-title" label="Title" value={form.title} onChange={update("title")} error={fieldError("title")} />
            )}
            {activeGroup.fields.includes("subtitle") && (
              <FormInput
                id="section-subtitle"
                label="Subtitle"
                value={form.subtitle}
                onChange={update("subtitle")}
                error={fieldError("subtitle")}
              />
            )}
            {activeGroup.fields.includes("body") && activeGroup.richBody && (
              <RichTextEditor
                key={editing?.id ?? `new-${activeGroup.key}`}
                id="section-body"
                label="Body text"
                initialValue={form.body}
                onChange={(html) => setForm((f) => ({ ...f, body: html }))}
                error={fieldError("body")}
                hint="Select text to bold it or turn it into a list — the same content the public page shows."
              />
            )}
            {activeGroup.fields.includes("body") && !activeGroup.richBody && (
              <Textarea id="section-body" label="Body text" rows={4} value={form.body} onChange={update("body")} error={fieldError("body")} />
            )}

            {activeGroup.fields.includes("image") && (
              <div className="field">
                <label htmlFor="section-image" className="field__label">
                  Image
                </label>
                <input
                  id="section-image"
                  type="file"
                  accept="image/*"
                  className="field__control"
                  onChange={(e) => pickImage(e.target.files?.[0] || null)}
                />
                {fieldError("image") && (
                  <span className="field__error" role="alert">
                    {fieldError("image")}
                  </span>
                )}
                {imagePreview && <img src={imagePreview} alt="" className="admin-form-image-preview" />}
              </div>
            )}

            {(activeGroup.fields.includes("primary_label") || activeGroup.fields.includes("secondary_label")) && (
              <div className="admin-form-grid">
                {activeGroup.fields.includes("primary_label") && (
                  <FormInput
                    id="section-primary-label"
                    label="Primary button label"
                    value={form.primary_label}
                    onChange={update("primary_label")}
                    error={fieldError("primary_label")}
                  />
                )}
                {activeGroup.fields.includes("primary_url") && (
                  <FormInput
                    id="section-primary-url"
                    label="Primary button link"
                    hint='e.g. "/contact"'
                    value={form.primary_url}
                    onChange={update("primary_url")}
                    error={fieldError("primary_url")}
                  />
                )}
                {activeGroup.fields.includes("secondary_label") && (
                  <FormInput
                    id="section-secondary-label"
                    label="Secondary button label"
                    value={form.secondary_label}
                    onChange={update("secondary_label")}
                    error={fieldError("secondary_label")}
                  />
                )}
                {activeGroup.fields.includes("secondary_url") && (
                  <FormInput
                    id="section-secondary-url"
                    label="Secondary button link"
                    hint='e.g. "/training"'
                    value={form.secondary_url}
                    onChange={update("secondary_url")}
                    error={fieldError("secondary_url")}
                  />
                )}
              </div>
            )}

            {!activeGroup.singleton && (
              <FormInput
                id="section-sort-order"
                type="number"
                min="0"
                label="Display order"
                hint="Lower numbers show first"
                value={form.sort_order}
                onChange={update("sort_order")}
                error={fieldError("sort_order")}
              />
            )}

            <label className="admin-checkbox" style={{ marginBottom: "var(--space-6)" }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              Show this on the page
            </label>

            <div className="admin-form-actions">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Saving…" : editing ? "Save Changes" : "Add"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this item?"
        message={deleteTarget ? `"${previewText(deleteTarget)}" will be removed from the page. This can't be undone.` : ""}
      />
    </>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FormInput from "../../../components/ui/FormInput";
import Textarea from "../../../components/ui/Textarea";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import Loader from "../../../components/ui/Loader";
import useFetch from "../../../hooks/useFetch";
import api from "../../../services/api";
import { invalidate } from "../../../utils/adminCache";

const EMPTY_FORM = {
  eyebrow: "",
  title: "",
  description: "",
  alt_text: "",
  primary_cta_label: "",
  primary_cta_url: "",
  secondary_cta_label: "",
  secondary_cta_url: "",
  sort_order: "",
  is_active: true,
};

export default function BannerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: banner, loading: bannerLoading, error: bannerError } = useFetch(isEdit ? `/admin/banners/${id}` : null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // BannerResource nests the two CTAs as { label, to } (matching the
  // public Hero component's prop shape) rather than the flat
  // primary_cta_label/primary_cta_url columns the form/API request use —
  // unpack them back out here.
  useEffect(() => {
    if (!banner) return;
    setForm({
      eyebrow: banner.eyebrow || "",
      title: banner.title || "",
      description: banner.description || "",
      alt_text: banner.alt || "",
      primary_cta_label: banner.primaryCta?.label || "",
      primary_cta_url: banner.primaryCta?.to || "",
      secondary_cta_label: banner.secondaryCta?.label || "",
      secondary_cta_url: banner.secondaryCta?.to || "",
      sort_order: banner.sort_order ?? "",
      is_active: Boolean(banner.is_active),
    });
    setImagePreview(banner.image || null);
  }, [banner]);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const updateChecked = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }));
  const fieldError = (name) => fieldErrors[name]?.[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "is_active") {
        payload.append(key, value ? "1" : "0");
      } else if (value !== "" && value !== null && value !== undefined) {
        payload.append(key, value);
      }
    });
    if (imageFile) payload.append("image", imageFile);
    if (isEdit) payload.append("_method", "PUT");

    try {
      if (isEdit) {
        await api.post(`/admin/banners/${id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/admin/banners", payload, { headers: { "Content-Type": "multipart/form-data" } });
      }
      invalidate("/admin/banners");
      navigate("/admin/banners");
    } catch (err) {
      const response = err.response;
      setError(response?.data?.message || "Something went wrong — please try again.");
      setFieldErrors(response?.data?.errors || {});
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && bannerLoading) {
    return <Loader center label="Loading banner…" />;
  }

  if (isEdit && bannerError) {
    return <Alert variant="error">{bannerError}</Alert>;
  }

  return (
    <>
      <div className="admin-page__header">
        <div>
          <Link to="/admin/banners" className="admin-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Banners
          </Link>
          <h1>{isEdit ? "Edit Banner" : "Add Banner"}</h1>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-panel">
        <div className="admin-form-grid">
          <FormInput
            id="banner-eyebrow"
            label="Eyebrow"
            hint='Small label above the title, e.g. "Talent Track Technologies"'
            value={form.eyebrow}
            onChange={update("eyebrow")}
            error={fieldError("eyebrow")}
          />
          <FormInput
            id="banner-title"
            label="Title"
            required
            value={form.title}
            onChange={update("title")}
            error={fieldError("title")}
          />

          <FormInput
            id="banner-sort-order"
            type="number"
            min="0"
            label="Display order"
            hint="Lower numbers show first"
            value={form.sort_order}
            onChange={update("sort_order")}
            error={fieldError("sort_order")}
          />
          <div className="field">
            <label htmlFor="banner-image" className="field__label">
              Image{!isEdit && <span className="field__required" aria-hidden="true"> *</span>}
            </label>
            <input
              id="banner-image"
              type="file"
              accept="image/*"
              className="field__control"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            {fieldError("image") && (
              <span className="field__error" role="alert">
                {fieldError("image")}
              </span>
            )}
            {imagePreview && <img src={imagePreview} alt="" className="admin-form-image-preview" />}
          </div>

          <FormInput
            id="banner-alt-text"
            label="Image alt text"
            hint="Describes the image for screen readers"
            value={form.alt_text}
            onChange={update("alt_text")}
            error={fieldError("alt_text")}
          />
        </div>

        <Textarea
          id="banner-description"
          label="Description"
          rows={3}
          value={form.description}
          onChange={update("description")}
          error={fieldError("description")}
        />

        <div className="admin-form-grid">
          <FormInput
            id="banner-primary-cta-label"
            label="Primary button label"
            value={form.primary_cta_label}
            onChange={update("primary_cta_label")}
            error={fieldError("primary_cta_label")}
          />
          <FormInput
            id="banner-primary-cta-url"
            label="Primary button link"
            hint='e.g. "/training"'
            value={form.primary_cta_url}
            onChange={update("primary_cta_url")}
            error={fieldError("primary_cta_url")}
          />

          <FormInput
            id="banner-secondary-cta-label"
            label="Secondary button label"
            value={form.secondary_cta_label}
            onChange={update("secondary_cta_label")}
            error={fieldError("secondary_cta_label")}
          />
          <FormInput
            id="banner-secondary-cta-url"
            label="Secondary button link"
            hint='e.g. "/contact"'
            value={form.secondary_cta_url}
            onChange={update("secondary_cta_url")}
            error={fieldError("secondary_cta_url")}
          />
        </div>

        <div className="admin-checkbox-row">
          <label className="admin-checkbox">
            <input type="checkbox" checked={form.is_active} onChange={updateChecked("is_active")} />
            Active (visible on the homepage)
          </label>
        </div>

        <div className="admin-form-actions">
          <Button to="/admin/banners" variant="outline">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Banner"}
          </Button>
        </div>
      </form>
    </>
  );
}

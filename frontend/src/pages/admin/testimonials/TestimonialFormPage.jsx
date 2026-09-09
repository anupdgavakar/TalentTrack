import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FormInput from "../../../components/ui/FormInput";
import Textarea from "../../../components/ui/Textarea";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import Loader from "../../../components/ui/Loader";
import useFetch from "../../../hooks/useFetch";
import api from "../../../services/api";
import { invalidate } from "../../../utils/adminCache";

const RATING_OPTIONS = [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} Star${n === 1 ? "" : "s"}` }));

const EMPTY_FORM = {
  name: "",
  role_title: "",
  company: "",
  quote: "",
  rating: "",
  sort_order: "",
  is_featured: false,
  is_active: true,
};

export default function TestimonialFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const {
    data: testimonial,
    loading: testimonialLoading,
    error: testimonialError,
  } = useFetch(isEdit ? `/admin/testimonials/${id}` : null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!testimonial) return;
    setForm({
      name: testimonial.name || "",
      role_title: testimonial.role_title || "",
      company: testimonial.company || "",
      quote: testimonial.quote || "",
      rating: testimonial.rating ? String(testimonial.rating) : "",
      sort_order: testimonial.sort_order ?? "",
      is_featured: Boolean(testimonial.is_featured),
      is_active: Boolean(testimonial.is_active),
    });
    setAvatarPreview(testimonial.avatar_url || null);
  }, [testimonial]);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

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
      if (key === "is_featured" || key === "is_active") {
        payload.append(key, value ? "1" : "0");
      } else if (value !== "" && value !== null && value !== undefined) {
        payload.append(key, value);
      }
    });
    if (avatarFile) payload.append("avatar", avatarFile);
    if (isEdit) payload.append("_method", "PUT");

    try {
      if (isEdit) {
        await api.post(`/admin/testimonials/${id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/admin/testimonials", payload, { headers: { "Content-Type": "multipart/form-data" } });
      }
      invalidate("/admin/testimonials");
      navigate("/admin/testimonials");
    } catch (err) {
      const response = err.response;
      setError(response?.data?.message || "Something went wrong — please try again.");
      setFieldErrors(response?.data?.errors || {});
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && testimonialLoading) {
    return <Loader center label="Loading testimonial…" />;
  }

  if (isEdit && testimonialError) {
    return <Alert variant="error">{testimonialError}</Alert>;
  }

  return (
    <>
      <div className="admin-page__header">
        <div>
          <Link to="/admin/testimonials" className="admin-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Testimonials
          </Link>
          <h1>{isEdit ? "Edit Testimonial" : "Add Testimonial"}</h1>
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
            id="testimonial-name"
            label="Name"
            required
            value={form.name}
            onChange={update("name")}
            error={fieldError("name")}
          />
          <FormInput
            id="testimonial-role"
            label="Role title"
            hint='e.g. "Software Engineer"'
            value={form.role_title}
            onChange={update("role_title")}
            error={fieldError("role_title")}
          />

          <FormInput
            id="testimonial-company"
            label="Company"
            value={form.company}
            onChange={update("company")}
            error={fieldError("company")}
          />
          <Select
            id="testimonial-rating"
            label="Rating"
            placeholder="— No rating —"
            value={form.rating}
            onChange={update("rating")}
            options={RATING_OPTIONS}
            error={fieldError("rating")}
          />

          <FormInput
            id="testimonial-sort-order"
            type="number"
            min="0"
            label="Display order"
            hint="Lower numbers show first"
            value={form.sort_order}
            onChange={update("sort_order")}
            error={fieldError("sort_order")}
          />
          <div className="field">
            <label htmlFor="testimonial-avatar" className="field__label">
              Photo
            </label>
            <input
              id="testimonial-avatar"
              type="file"
              accept="image/*"
              className="field__control"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
            {fieldError("avatar") && (
              <span className="field__error" role="alert">
                {fieldError("avatar")}
              </span>
            )}
            {avatarPreview && <img src={avatarPreview} alt="" className="admin-form-image-preview admin-form-image-preview--round" />}
          </div>
        </div>

        <Textarea
          id="testimonial-quote"
          label="Quote"
          required
          rows={4}
          value={form.quote}
          onChange={update("quote")}
          error={fieldError("quote")}
        />

        <div className="admin-checkbox-row">
          <label className="admin-checkbox">
            <input type="checkbox" checked={form.is_featured} onChange={updateChecked("is_featured")} />
            Featured on the homepage
          </label>
          <label className="admin-checkbox">
            <input type="checkbox" checked={form.is_active} onChange={updateChecked("is_active")} />
            Active (visible on the public site)
          </label>
        </div>

        <div className="admin-form-actions">
          <Button to="/admin/testimonials" variant="outline">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Testimonial"}
          </Button>
        </div>
      </form>
    </>
  );
}

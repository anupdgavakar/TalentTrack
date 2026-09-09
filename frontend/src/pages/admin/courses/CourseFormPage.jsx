import { useState, useEffect, useMemo } from "react";
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

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const MODE_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "hybrid", label: "Hybrid" },
];

const EMPTY_FORM = {
  category_id: "",
  title: "",
  slug: "",
  short_description: "",
  description: "",
  duration: "",
  level: "",
  mode: "",
  fee: "",
  syllabus: "",
  is_featured: false,
  is_active: true,
};

export default function CourseFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: course, loading: courseLoading, error: courseError } = useFetch(isEdit ? `/admin/courses/${id}` : null);
  const { data: categories } = useFetch("/admin/categories");
  const courseCategories = useMemo(() => (categories || []).filter((c) => c.type === "course"), [categories]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!course) return;
    setForm({
      category_id: course.category?.id ? String(course.category.id) : "",
      title: course.title || "",
      slug: course.slug || "",
      short_description: course.short_description || "",
      description: course.description || "",
      duration: course.duration || "",
      level: course.level || "",
      mode: course.mode || "",
      fee: course.fee ?? "",
      syllabus: course.syllabus || "",
      is_featured: Boolean(course.is_featured),
      is_active: Boolean(course.is_active),
    });
    setImagePreview(course.image_url || null);
  }, [course]);

  // Revoke the local object URL for a newly-picked file when it's replaced
  // or the component unmounts, so we don't leak memory.
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
      if (key === "is_featured" || key === "is_active") {
        payload.append(key, value ? "1" : "0");
      } else if (value !== "" && value !== null && value !== undefined) {
        payload.append(key, value);
      }
    });
    if (imageFile) payload.append("image", imageFile);
    if (isEdit) payload.append("_method", "PUT");

    try {
      if (isEdit) {
        await api.post(`/admin/courses/${id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/admin/courses", payload, { headers: { "Content-Type": "multipart/form-data" } });
      }
      invalidate("/admin/courses");
      invalidate("/admin/dashboard");
      navigate("/admin/courses");
    } catch (err) {
      const response = err.response;
      setError(response?.data?.message || "Something went wrong — please try again.");
      setFieldErrors(response?.data?.errors || {});
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && courseLoading) {
    return <Loader center label="Loading course…" />;
  }

  if (isEdit && courseError) {
    return <Alert variant="error">{courseError}</Alert>;
  }

  return (
    <>
      <div className="admin-page__header">
        <div>
          <Link to="/admin/courses" className="admin-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Courses
          </Link>
          <h1>{isEdit ? "Edit Course" : "Add Course"}</h1>
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
            id="course-title"
            label="Title"
            required
            value={form.title}
            onChange={update("title")}
            error={fieldError("title")}
          />
          <FormInput
            id="course-slug"
            label="Slug"
            hint="Leave blank to auto-generate from the title"
            value={form.slug}
            onChange={update("slug")}
            error={fieldError("slug")}
          />

          <Select
            id="course-category"
            label="Category"
            placeholder="— No category —"
            value={form.category_id}
            onChange={update("category_id")}
            options={courseCategories.map((c) => ({ value: String(c.id), label: c.name }))}
            error={fieldError("category_id")}
          />
          <FormInput
            id="course-duration"
            label="Duration"
            hint='e.g. "8 weeks", "40 hours"'
            value={form.duration}
            onChange={update("duration")}
            error={fieldError("duration")}
          />

          <Select
            id="course-level"
            label="Level"
            placeholder="Select a level"
            value={form.level}
            onChange={update("level")}
            options={LEVEL_OPTIONS}
            error={fieldError("level")}
          />
          <Select
            id="course-mode"
            label="Mode"
            placeholder="Select a mode"
            value={form.mode}
            onChange={update("mode")}
            options={MODE_OPTIONS}
            error={fieldError("mode")}
          />

          <FormInput
            id="course-fee"
            type="number"
            min="0"
            step="0.01"
            label="Fee (₹)"
            value={form.fee}
            onChange={update("fee")}
            error={fieldError("fee")}
          />
          <div className="field">
            <label htmlFor="course-image" className="field__label">
              Course image
            </label>
            <input
              id="course-image"
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
        </div>

        <Textarea
          id="course-short-description"
          label="Short description"
          hint="Shown on course cards — keep it to a sentence or two"
          rows={2}
          value={form.short_description}
          onChange={update("short_description")}
          error={fieldError("short_description")}
        />
        <Textarea
          id="course-description"
          label="Full description"
          rows={5}
          value={form.description}
          onChange={update("description")}
          error={fieldError("description")}
        />
        <Textarea
          id="course-syllabus"
          label="Syllabus"
          rows={5}
          value={form.syllabus}
          onChange={update("syllabus")}
          error={fieldError("syllabus")}
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
          <Button to="/admin/courses" variant="outline">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Course"}
          </Button>
        </div>
      </form>
    </>
  );
}

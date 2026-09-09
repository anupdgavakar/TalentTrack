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

const JOB_TYPE_OPTIONS = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
];

const LISTING_TYPE_OPTIONS = [
  { value: "placement", label: "Placement" },
  { value: "recruitment", label: "Recruitment" },
];

const EMPTY_FORM = {
  category_id: "",
  title: "",
  slug: "",
  company_name: "",
  location: "",
  job_type: "",
  experience_level: "",
  salary_min: "",
  salary_max: "",
  description: "",
  requirements: "",
  listing_type: "",
  closing_date: "",
  is_featured: false,
  is_active: true,
};

export default function JobPostingFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: job, loading: jobLoading, error: jobError } = useFetch(isEdit ? `/admin/job-postings/${id}` : null);
  const { data: categories } = useFetch("/admin/categories");
  const jobCategories = useMemo(() => (categories || []).filter((c) => c.type === "job"), [categories]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!job) return;
    setForm({
      category_id: job.category?.id ? String(job.category.id) : "",
      title: job.title || "",
      slug: job.slug || "",
      company_name: job.company_name || "",
      location: job.location || "",
      job_type: job.job_type || "",
      experience_level: job.experience_level || "",
      salary_min: job.salary_min ?? "",
      salary_max: job.salary_max ?? "",
      description: job.description || "",
      requirements: job.requirements || "",
      listing_type: job.listing_type || "",
      closing_date: job.closing_date || "",
      is_featured: Boolean(job.is_featured),
      is_active: Boolean(job.is_active),
    });
  }, [job]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const updateChecked = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }));
  const fieldError = (name) => fieldErrors[name]?.[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    // No file upload on this form (job postings don't have an image field
    // like courses do), so this can go straight to JSON — no FormData /
    // _method spoofing needed.
    const payload = {};
    Object.entries(form).forEach(([key, value]) => {
      if (key === "is_featured" || key === "is_active") {
        payload[key] = value;
      } else if (value !== "") {
        payload[key] = value;
      }
    });

    try {
      if (isEdit) {
        await api.put(`/admin/job-postings/${id}`, payload);
      } else {
        await api.post("/admin/job-postings", payload);
      }
      invalidate("/admin/job-postings");
      invalidate("/admin/dashboard");
      navigate("/admin/jobs");
    } catch (err) {
      const response = err.response;
      setError(response?.data?.message || "Something went wrong — please try again.");
      setFieldErrors(response?.data?.errors || {});
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && jobLoading) {
    return <Loader center label="Loading job posting…" />;
  }

  if (isEdit && jobError) {
    return <Alert variant="error">{jobError}</Alert>;
  }

  return (
    <>
      <div className="admin-page__header">
        <div>
          <Link to="/admin/jobs" className="admin-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Job Postings
          </Link>
          <h1>{isEdit ? "Edit Job Posting" : "Add Job Posting"}</h1>
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
            id="job-title"
            label="Title"
            required
            value={form.title}
            onChange={update("title")}
            error={fieldError("title")}
          />
          <FormInput
            id="job-slug"
            label="Slug"
            hint="Leave blank to auto-generate from the title"
            value={form.slug}
            onChange={update("slug")}
            error={fieldError("slug")}
          />

          <Select
            id="job-category"
            label="Category"
            placeholder="— No category —"
            value={form.category_id}
            onChange={update("category_id")}
            options={jobCategories.map((c) => ({ value: String(c.id), label: c.name }))}
            error={fieldError("category_id")}
          />
          <Select
            id="job-listing-type"
            label="Listing"
            required
            placeholder="Select a listing type"
            value={form.listing_type}
            onChange={update("listing_type")}
            options={LISTING_TYPE_OPTIONS}
            hint="Placement = candidates we've trained. Recruitment = an employer's open search."
            error={fieldError("listing_type")}
          />

          <FormInput
            id="job-company"
            label="Company name"
            value={form.company_name}
            onChange={update("company_name")}
            error={fieldError("company_name")}
          />
          <FormInput
            id="job-location"
            label="Location"
            value={form.location}
            onChange={update("location")}
            error={fieldError("location")}
          />

          <Select
            id="job-type"
            label="Job type"
            required
            placeholder="Select a job type"
            value={form.job_type}
            onChange={update("job_type")}
            options={JOB_TYPE_OPTIONS}
            error={fieldError("job_type")}
          />
          <FormInput
            id="job-experience"
            label="Experience level"
            hint='e.g. "0-1 years", "3+ years"'
            value={form.experience_level}
            onChange={update("experience_level")}
            error={fieldError("experience_level")}
          />

          <FormInput
            id="job-salary-min"
            type="number"
            min="0"
            step="0.01"
            label="Salary min (₹/month)"
            value={form.salary_min}
            onChange={update("salary_min")}
            error={fieldError("salary_min")}
          />
          <FormInput
            id="job-salary-max"
            type="number"
            min="0"
            step="0.01"
            label="Salary max (₹/month)"
            value={form.salary_max}
            onChange={update("salary_max")}
            error={fieldError("salary_max")}
          />

          <FormInput
            id="job-closing-date"
            type="date"
            label="Closing date"
            hint="Optional. Once this date passes, the listing stops accepting applications and disappears from the public site automatically — you don't need to also switch Active off."
            value={form.closing_date}
            onChange={update("closing_date")}
            error={fieldError("closing_date")}
          />
        </div>

        <Textarea
          id="job-description"
          label="Description"
          required
          rows={5}
          value={form.description}
          onChange={update("description")}
          error={fieldError("description")}
        />
        <Textarea
          id="job-requirements"
          label="Requirements"
          rows={4}
          value={form.requirements}
          onChange={update("requirements")}
          error={fieldError("requirements")}
        />

        <div className="admin-checkbox-row">
          <label className="admin-checkbox">
            <input type="checkbox" checked={form.is_featured} onChange={updateChecked("is_featured")} />
            Featured on the Placement page
          </label>
          <label className="admin-checkbox">
            <input type="checkbox" checked={form.is_active} onChange={updateChecked("is_active")} />
            Active (visible on the public site)
          </label>
        </div>

        <div className="admin-form-actions">
          <Button to="/admin/jobs" variant="outline">
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Job Posting"}
          </Button>
        </div>
      </form>
    </>
  );
}

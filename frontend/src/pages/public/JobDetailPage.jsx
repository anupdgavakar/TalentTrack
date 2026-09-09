import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Briefcase, Clock, Wallet } from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import FormInput from "../../components/ui/FormInput";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import useFetch from "../../hooks/useFetch";
import useSubmitForm from "../../hooks/useSubmitForm";
import useSeo from "../../hooks/useSeo";
import useJsonLd from "../../hooks/useJsonLd";
import { SITE_NAME } from "../../config/site";
import { useAuth } from "../../context/AuthContext";

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} / month`;
  return `${fmt(min || max)} / month`;
}

// Google's JobPosting employmentType enum — mapped from the job_type enum
// migrated in Phase 3 (full_time/part_time/internship/contract).
const EMPLOYMENT_TYPE = {
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  internship: "INTERN",
  contract: "CONTRACTOR",
};

export default function JobDetailPage() {
  const { slug } = useParams();
  const { data: job, loading, error } = useFetch(`/job-postings/${slug}`);

  useSeo({
    title: job?.title,
    description: job?.description,
    noindex: !loading && !job,
  });

  // Google's JobPosting rich-result schema. A known simplification: our
  // `location` field is one free-text string (e.g. "Pune, Maharashtra" or
  // "Remote"), not a structured street/city/state address, so it's mapped
  // into `addressLocality` as a best effort rather than a fully-structured
  // `PostalAddress` — good enough for search engines to show a location,
  // not guaranteed to pass Google's Rich Results Test on every listing.
  useJsonLd(
    "job-schema",
    job && {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: job.description || job.title,
      datePosted: job.created_at,
      validThrough: job.closing_date || undefined,
      employmentType: EMPLOYMENT_TYPE[job.job_type] || undefined,
      hiringOrganization: {
        "@type": "Organization",
        name: job.company_name || SITE_NAME,
      },
      jobLocation: job.location
        ? {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.location,
              addressCountry: "IN",
            },
          }
        : undefined,
      baseSalary:
        job.salary_min || job.salary_max
          ? {
              "@type": "MonetaryAmount",
              currency: "INR",
              value: {
                "@type": "QuantitativeValue",
                minValue: job.salary_min || undefined,
                maxValue: job.salary_max || undefined,
                unitText: "MONTH",
              },
            }
          : undefined,
    }
  );

  if (loading) {
    return (
      <div className="container section">
        <Loader center label="Loading job…" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container section">
        <EmptyState
          title="Job not found"
          description="This listing may have closed or the link is out of date."
          action={
            <Button to="/placement" variant="outline">
              Back to Placement
            </Button>
          }
        />
      </div>
    );
  }

  const salary = formatSalary(job.salary_min, job.salary_max);
  const backTo = job.listing_type === "recruitment" ? "/recruitment" : "/placement";

  return (
    <>
      <header className="page-header">
        <div className="container">
          <Breadcrumb
            items={[
              { label: "Home", to: "/" },
              { label: job.listing_type === "recruitment" ? "Recruitment" : "Placement", to: backTo },
              { label: job.title },
            ]}
          />
          <h1>{job.title}</h1>
          {job.company_name && <p>{job.company_name}</p>}
        </div>
      </header>

      <section className="section">
        <div className="container detail-layout">
          <div className="detail-main">
            <div className="detail-main__meta">
              {job.location && (
                <span className="detail-main__meta-item">
                  <MapPin size={16} aria-hidden="true" /> {job.location}
                </span>
              )}
              {job.job_type && (
                <span className="detail-main__meta-item">
                  <Briefcase size={16} aria-hidden="true" /> {job.job_type.replace("_", " ")}
                </span>
              )}
              {job.experience_level && (
                <span className="detail-main__meta-item">
                  <Clock size={16} aria-hidden="true" /> {job.experience_level}
                </span>
              )}
              {salary && (
                <span className="detail-main__meta-item">
                  <Wallet size={16} aria-hidden="true" /> {salary}
                </span>
              )}
            </div>

            <div className="detail-main__section">
              <h2>Job description</h2>
              <p className="detail-main__body">{job.description}</p>
            </div>

            {job.requirements && (
              <div className="detail-main__section">
                <h2>Requirements</h2>
                <p className="detail-main__body">{job.requirements}</p>
              </div>
            )}
          </div>

          <aside className="detail-sidebar">
            <ApplicationForm jobId={job.id} jobTitle={job.title} />
          </aside>
        </div>
      </section>
    </>
  );
}

function ApplicationForm({ jobId, jobTitle }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", cover_note: "" });
  const [resume, setResume] = useState(null);
  const { submit, submitting, success, error, fieldError } = useSubmitForm("/job-applications");

  // Logged-in candidates (Phase 8) shouldn't have to retype what's already
  // on their account — prefill once the session check resolves, without
  // clobbering anything they've already typed.
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      full_name: f.full_name || user.name || "",
      email: f.email || user.email || "",
      phone: f.phone || user.phone || "",
    }));
  }, [user]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append("job_posting_id", jobId);
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (resume) payload.append("resume", resume);

    try {
      await submit(payload, { isMultipart: true });
      setForm({ full_name: "", email: "", phone: "", cover_note: "" });
      setResume(null);
    } catch {
      // fieldError()/error already reflect the failure — nothing else to do
    }
  };

  if (success) {
    return <Alert variant="success">{success}</Alert>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Apply for this role</h3>
      <p className="detail-sidebar__hint">
        {user
          ? "This'll be added to your account so you can track it from your dashboard."
          : "Tell us a bit about yourself — no account needed."}
      </p>

      {error && (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <FormInput
        id="apply-name"
        label="Full name"
        required
        value={form.full_name}
        onChange={update("full_name")}
        error={fieldError("full_name")}
      />
      <FormInput
        id="apply-email"
        type="email"
        label="Email"
        required
        value={form.email}
        onChange={update("email")}
        error={fieldError("email")}
      />
      <FormInput
        id="apply-phone"
        type="tel"
        label="Phone"
        value={form.phone}
        onChange={update("phone")}
        error={fieldError("phone")}
      />
      <FormInput
        id="apply-resume"
        type="file"
        label="Resume"
        hint="PDF, DOC or DOCX, up to 5MB"
        accept=".pdf,.doc,.docx"
        onChange={(e) => setResume(e.target.files?.[0] || null)}
        error={fieldError("resume")}
      />
      <Textarea
        id="apply-cover-note"
        label="Cover note"
        rows={3}
        placeholder={`Why are you a good fit for ${jobTitle}?`}
        value={form.cover_note}
        onChange={update("cover_note")}
        error={fieldError("cover_note")}
      />

      <Button type="submit" variant="accent" block disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Application"}
      </Button>
    </form>
  );
}

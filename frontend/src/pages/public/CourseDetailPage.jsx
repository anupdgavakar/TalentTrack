import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Clock, Monitor, Layers, Tag } from "lucide-react";
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
import { SITE_NAME, SITE_URL } from "../../config/site";
import { useAuth } from "../../context/AuthContext";

export default function CourseDetailPage() {
  const { slug } = useParams();
  const { data: course, loading, error } = useFetch(`/courses/${slug}`);

  useSeo({
    title: course?.title,
    description: course?.short_description || course?.description,
    image: course?.image_url,
    noindex: !loading && !course,
  });

  // Google's Course rich-result schema — nothing renders until the course
  // has actually loaded, so a 404/loading state never emits a schema with
  // empty fields.
  useJsonLd(
    "course-schema",
    course && {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: course.short_description || course.description || course.title,
      image: course.image_url || undefined,
      provider: {
        "@type": "Organization",
        name: SITE_NAME,
        sameAs: SITE_URL,
      },
    }
  );

  if (loading) {
    return (
      <div className="container section">
        <Loader center label="Loading course…" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container section">
        <EmptyState
          title="Course not found"
          description="This course may have been removed or the link is out of date."
          action={
            <Button to="/training" variant="outline">
              Back to Training
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <header className="page-header">
        <div className="container">
          <Breadcrumb
            items={[
              { label: "Home", to: "/" },
              { label: "Training", to: "/training" },
              { label: course.title },
            ]}
          />
          <h1>{course.title}</h1>
          {course.category && <p>{course.category.name}</p>}
        </div>
      </header>

      <section className="section">
        <div className="container detail-layout">
          <div className="detail-main">
            <div className="detail-main__meta">
              {course.duration && (
                <span className="detail-main__meta-item">
                  <Clock size={16} aria-hidden="true" /> {course.duration}
                </span>
              )}
              {course.mode && (
                <span className="detail-main__meta-item">
                  <Monitor size={16} aria-hidden="true" /> {course.mode}
                </span>
              )}
              {course.level && (
                <span className="detail-main__meta-item">
                  <Layers size={16} aria-hidden="true" /> {course.level}
                </span>
              )}
              {course.fee && (
                <span className="detail-main__meta-item">
                  <Tag size={16} aria-hidden="true" /> ₹{Number(course.fee).toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {course.short_description && <p>{course.short_description}</p>}

            {course.description && (
              <div className="detail-main__section">
                <h2>About this course</h2>
                <p className="detail-main__body">{course.description}</p>
              </div>
            )}

            {course.syllabus && (
              <div className="detail-main__section">
                <h2>Syllabus</h2>
                <p className="detail-main__body">{course.syllabus}</p>
              </div>
            )}
          </div>

          <aside className="detail-sidebar">
            <EnrollmentForm courseId={course.id} courseTitle={course.title} />
          </aside>
        </div>
      </section>
    </>
  );
}

function EnrollmentForm({ courseId, courseTitle }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", message: "" });
  const { submit, submitting, success, error, fieldError } = useSubmitForm("/course-enrollments");

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
    try {
      await submit({ course_id: courseId, ...form });
      setForm({ full_name: "", email: "", phone: "", message: "" });
    } catch {
      // fieldError()/error already reflect the failure — nothing else to do
    }
  };

  if (success) {
    return <Alert variant="success">{success}</Alert>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Enrol in this course</h3>
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
        id="enroll-name"
        label="Full name"
        required
        value={form.full_name}
        onChange={update("full_name")}
        error={fieldError("full_name")}
      />
      <FormInput
        id="enroll-email"
        type="email"
        label="Email"
        required
        value={form.email}
        onChange={update("email")}
        error={fieldError("email")}
      />
      <FormInput
        id="enroll-phone"
        type="tel"
        label="Phone"
        value={form.phone}
        onChange={update("phone")}
        error={fieldError("phone")}
      />
      <Textarea
        id="enroll-message"
        label="Message"
        rows={3}
        placeholder={`Anything we should know about your interest in ${courseTitle}?`}
        value={form.message}
        onChange={update("message")}
        error={fieldError("message")}
      />

      <Button type="submit" variant="accent" block disabled={submitting}>
        {submitting ? "Submitting…" : "Enrol Now"}
      </Button>
    </form>
  );
}

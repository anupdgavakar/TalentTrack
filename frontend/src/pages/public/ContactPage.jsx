import { useSearchParams } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Loader from "../../components/ui/Loader";
import LeadForm from "../../components/forms/LeadForm";
import useFetch from "../../hooks/useFetch";
import useSeo from "../../hooks/useSeo";
import { FALLBACK_SETTINGS } from "../../utils/siteSettings";
import { findSection } from "../../utils/pageSectionKeys";
import { renderBody } from "../../utils/renderBody";

// Fallback copy for the two admin-editable blocks on this page — used only
// if the matching /page-sections row doesn't exist yet (see AboutPage.jsx's
// matching comment for why). The address/phone/email below the heading are
// NOT part of this — those already come from Settings (settings/public),
// unrelated to page_sections.
const FALLBACK = {
  hero: {
    title: "Contact Us",
    subtitle: "Questions about a course, a job opening, or anything else — send us a message and we'll get back to you.",
  },
  get_in_touch: {
    title: "Get in touch",
    body: "Prefer to reach out directly? Our team is available on the details below during business hours, Monday to Saturday.",
  },
};

export default function ContactPage() {
  useSeo({
    title: "Contact Us",
    description: "Questions about a course, a job opening, or anything else — get in touch with Talent Track Technologies.",
  });

  const [searchParams] = useSearchParams();
  const courseSlug = searchParams.get("course");

  const { data: settingsData } = useFetch("/settings/public");
  const settings = { ...FALLBACK_SETTINGS, ...settingsData };

  const { data: sections } = useFetch("/page-sections?page=contact");
  const hero = findSection(sections, "hero") || FALLBACK.hero;
  const getInTouch = findSection(sections, "get_in_touch") || FALLBACK.get_in_touch;

  // "Enquire Now" on a CourseCard links here as /contact?course=<slug> — look
  // the course up so we can prefill the message with its title, rather than
  // just leaving a bare slug for the visitor to explain themselves.
  const { data: course, loading: courseLoading } = useFetch(courseSlug ? `/courses/${courseSlug}` : null);

  if (courseSlug && courseLoading) {
    return (
      <div className="container section">
        <Loader center label="Loading…" />
      </div>
    );
  }

  const initialMessage = course ? `I'm interested in the "${course.title}" course. Please share more details.` : "";

  return (
    <>
      <header className="page-header">
        <div className="container">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Contact Us" }]} />
          <h1>{hero.title}</h1>
          {hero.subtitle && <p>{hero.subtitle}</p>}
        </div>
      </header>

      <section className="section">
        <div className="container split-section">
          <div className="split-section__content">
            <h2>{getInTouch.title}</h2>
            <div dangerouslySetInnerHTML={renderBody(getInTouch.body)} />

            <div className="split-section__list">
              <div className="split-section__list-item">
                <MapPin size={20} aria-hidden="true" />
                <span>{settings.footer_address}</span>
              </div>
              <div className="split-section__list-item">
                <Phone size={20} aria-hidden="true" />
                <a href={`tel:${settings.footer_phone.replace(/\s+/g, "")}`}>{settings.footer_phone}</a>
              </div>
              <div className="split-section__list-item">
                <Mail size={20} aria-hidden="true" />
                <a href={`mailto:${settings.footer_email}`}>{settings.footer_email}</a>
              </div>
            </div>

            {getInTouch.image && (
              <img src={getInTouch.image} alt="" className="section-photo section-photo--inline" loading="lazy" />
            )}
          </div>

          <LeadForm type="general" submitLabel="Send Message" initialMessage={initialMessage} />
        </div>
      </section>
    </>
  );
}

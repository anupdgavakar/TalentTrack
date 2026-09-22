import { CheckCircle2 } from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import LeadForm from "../../components/forms/LeadForm";
import useFetch from "../../hooks/useFetch";
import useSeo from "../../hooks/useSeo";
import { findSection, listSection } from "../../utils/pageSectionKeys";

// See AboutPage.jsx's matching comment — only used if these rows don't
// exist yet in the database.
const FALLBACK = {
  hero: {
    title: "Recruitment Services for Employers",
    subtitle:
      "Tell us who you're looking to hire and our recruitment team will get back to you with a shortlist of "
      + "candidates matched to your role, budget and timeline.",
  },
  intro: {
    title: "Why hire through Talent Track",
    body:
      "We run our own training pipelines, so many of the candidates we place have already been assessed on "
      + "real, job-ready skills — not just a resume. That means faster shortlists and fewer mismatched hires.",
  },
  benefit_item: [
    { body: "Dedicated account manager who learns your hiring needs" },
    { body: "Pre-screened, role-matched candidate shortlists — typically within 5 working days" },
    { body: "Access to our verified talent pool across IT, banking, sales, engineering and more" },
    { body: "Replacement guarantee window on every confirmed hire" },
    { body: "Flexible engagement: one-off roles, bulk hiring, or ongoing retained search" },
  ],
};

export default function RecruitmentPage() {
  useSeo({
    title: "Recruitment Services for Employers",
    description:
      "Pre-screened, role-matched candidate shortlists and end-to-end recruitment support for employers, across IT, banking, sales, engineering and more.",
  });

  const { data: sections } = useFetch("/page-sections?page=recruitment");
  const hero = findSection(sections, "hero") || FALLBACK.hero;
  const intro = findSection(sections, "intro") || FALLBACK.intro;
  const benefitItems = sections ? listSection(sections, "benefit_item") : FALLBACK.benefit_item;
  const benefitItemsToShow = benefitItems.length > 0 ? benefitItems : FALLBACK.benefit_item;

  return (
    <>
      <header className="page-header">
        <div className="container">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Recruitment" }]} />
          <h1>{hero.title}</h1>
          {hero.subtitle && <p>{hero.subtitle}</p>}
        </div>
      </header>

      <section className="section">
        <div className="container split-section">
          <div className="split-section__content">
            <h2>{intro.title}</h2>
            <p>{intro.body}</p>

            <div className="split-section__list">
              {benefitItemsToShow.map((item) => (
                <div className="split-section__list-item" key={item.id || item.body}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <span>{item.body}</span>
                </div>
              ))}
            </div>
          </div>

          <LeadForm type="recruitment" submitLabel="Request a Hiring Consultation" showCompany />
        </div>
      </section>
    </>
  );
}

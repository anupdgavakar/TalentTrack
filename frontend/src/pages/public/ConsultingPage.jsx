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
    title: "Career Consulting",
    subtitle:
      "Not sure which course or career path is right for you? Book a session with one of our counsellors and "
      + "get a plan tailored to your background and goals.",
  },
  intro: {
    title: "What our consulting sessions cover",
    body:
      "Every session starts with understanding where you are today — your background, interests and "
      + "constraints — before we recommend a course, certification or job-search strategy.",
  },
  service_item: [
    { body: "One-on-one career counselling and skill-gap assessment" },
    { body: "Resume and LinkedIn profile review with actionable feedback" },
    { body: "Interview preparation, including mock interviews for your target role" },
    { body: "Course and career-path recommendations based on your goals" },
    { body: "Guidance for career switchers moving into a new field" },
  ],
};

export default function ConsultingPage() {
  useSeo({
    title: "Career Consulting",
    description:
      "One-on-one career counselling, resume review, interview preparation and course recommendations to help you plan your next career move.",
  });

  const { data: sections } = useFetch("/page-sections?page=consulting");
  const hero = findSection(sections, "hero") || FALLBACK.hero;
  const intro = findSection(sections, "intro") || FALLBACK.intro;
  const serviceItems = sections ? listSection(sections, "service_item") : FALLBACK.service_item;
  const serviceItemsToShow = serviceItems.length > 0 ? serviceItems : FALLBACK.service_item;

  return (
    <>
      <header className="page-header">
        <div className="container">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Consulting" }]} />
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
              {serviceItemsToShow.map((item) => (
                <div className="split-section__list-item" key={item.id || item.body}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <span>{item.body}</span>
                </div>
              ))}
            </div>
          </div>

          <LeadForm type="consulting" submitLabel="Book a Consulting Session" />
        </div>
      </section>
    </>
  );
}

import { CheckCircle2 } from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import LeadForm from "../../components/forms/LeadForm";
import useSeo from "../../hooks/useSeo";

const SERVICES = [
  "One-on-one career counselling and skill-gap assessment",
  "Resume and LinkedIn profile review with actionable feedback",
  "Interview preparation, including mock interviews for your target role",
  "Course and career-path recommendations based on your goals",
  "Guidance for career switchers moving into a new field",
];

export default function ConsultingPage() {
  useSeo({
    title: "Career Consulting",
    description:
      "One-on-one career counselling, resume review, interview preparation and course recommendations to help you plan your next career move.",
  });

  return (
    <>
      <header className="page-header">
        <div className="container">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Consulting" }]} />
          <h1>Career Consulting</h1>
          <p>
            Not sure which course or career path is right for you? Book a session with one of our
            counsellors and get a plan tailored to your background and goals.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container split-section">
          <div className="split-section__content">
            <h2>What our consulting sessions cover</h2>
            <p>
              Every session starts with understanding where you are today — your background, interests
              and constraints — before we recommend a course, certification or job-search strategy.
            </p>

            <div className="split-section__list">
              {SERVICES.map((item) => (
                <div className="split-section__list-item" key={item}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <span>{item}</span>
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

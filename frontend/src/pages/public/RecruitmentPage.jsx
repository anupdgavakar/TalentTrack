import { CheckCircle2 } from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import LeadForm from "../../components/forms/LeadForm";
import useSeo from "../../hooks/useSeo";

const BENEFITS = [
  "Dedicated account manager who learns your hiring needs",
  "Pre-screened, role-matched candidate shortlists — typically within 5 working days",
  "Access to our verified talent pool across IT, banking, sales, engineering and more",
  "Replacement guarantee window on every confirmed hire",
  "Flexible engagement: one-off roles, bulk hiring, or ongoing retained search",
];

export default function RecruitmentPage() {
  useSeo({
    title: "Recruitment Services for Employers",
    description:
      "Pre-screened, role-matched candidate shortlists and end-to-end recruitment support for employers, across IT, banking, sales, engineering and more.",
  });

  return (
    <>
      <header className="page-header">
        <div className="container">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Recruitment" }]} />
          <h1>Recruitment Services for Employers</h1>
          <p>
            Tell us who you're looking to hire and our recruitment team will get back to you with a
            shortlist of candidates matched to your role, budget and timeline.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container split-section">
          <div className="split-section__content">
            <h2>Why hire through Talent Track</h2>
            <p>
              We run our own training pipelines, so many of the candidates we place have already been
              assessed on real, job-ready skills — not just a resume. That means faster shortlists and
              fewer mismatched hires.
            </p>

            <div className="split-section__list">
              {BENEFITS.map((item) => (
                <div className="split-section__list-item" key={item}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <span>{item}</span>
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

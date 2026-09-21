import { GraduationCap, Briefcase, Users, Compass, CheckCircle2 } from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import SectionTitle from "../../components/ui/SectionTitle";
import ServiceCard from "../../components/cards/ServiceCard";
import StatsCard from "../../components/cards/StatsCard";
import WhyChooseUs from "../../components/marketing/WhyChooseUs";
import CTASection from "../../components/marketing/CTASection";
import useFetch from "../../hooks/useFetch";
import useSeo from "../../hooks/useSeo";
import getIcon from "../../utils/iconMap";
import { findSection, listSection } from "../../utils/pageSectionKeys";
import { renderBody } from "../../utils/renderBody";

// The four core service pillars link to fixed site routes (/training,
// /placement, ...) and stay hardcoded here rather than becoming admin-
// editable content blocks — an arbitrary edit to one of these in the admin
// panel could silently break primary site navigation, so this boundary is
// intentional (see docs/PHASE_PLAN.md's "Post-handover updates" section).
const PILLARS = [
  {
    icon: GraduationCap,
    title: "Training",
    description: "Job-ready, hands-on courses across in-demand technical and professional skills.",
    to: "/training",
  },
  {
    icon: Briefcase,
    title: "Placement",
    description: "End-to-end placement support connecting our trained candidates with hiring companies.",
    to: "/placement",
  },
  {
    icon: Users,
    title: "Recruitment",
    description: "Recruitment services for employers looking to hire pre-screened, role-ready talent.",
    to: "/recruitment",
  },
  {
    icon: Compass,
    title: "Consulting",
    description: "One-on-one career counselling to help individuals choose the right path forward.",
    to: "/consulting",
  },
];

// Fallback copy for every admin-editable block below — used only if the
// matching /page-sections row doesn't exist yet (e.g. this database
// predates PageSectionSeeder and hasn't had `php artisan db:seed
// --class=PageSectionSeeder --force` run against it), so the page always
// renders real content instead of a blank section while a client's site
// is mid-migration.
const FALLBACK = {
  hero: {
    title: "About Talent Track Technologies",
    subtitle: "Training, placement, recruitment and career consulting — under one roof.",
  },
  intro: {
    body: "Talent Track Technologies was founded on a simple idea: training and hiring shouldn't be two disconnected worlds. Most training providers hand you a certificate and wish you luck. Most recruiters only look at candidates who already have the exact experience they're hiring for. We built our platform to close that gap — pairing practical, job-ready training with a direct path into placement, so the skills people learn with us are the skills employers are actually hiring for.\n\nThat's why every course on our platform is built around real, current employer feedback rather than a syllabus written once and left to go stale, and why every candidate we put forward has already been checked against the actual requirements of the role, not just a keyword match on a resume. It's also why training and hiring live on the same platform in the first place: a candidate who finishes a course with us can move straight into our placement pipeline, and a company that hires through us can ask for a training cohort built around exactly what they need next.",
  },
  approach_intro: { title: "Outcomes over certificates" },
  approach_card: [
    {
      icon: "Target",
      title: "Employer-reviewed curriculum",
      body: "Every syllabus is checked against what employers are actually hiring for, not just what's trending.",
    },
    {
      icon: "ClipboardCheck",
      title: "Hands-on, project-based learning",
      body: "Practical projects and assessments built for retention, not passive lectures and a certificate.",
    },
    {
      icon: "Handshake",
      title: "Every match is human-reviewed",
      body: "Our team checks each application and shortlist against skills, experience and expectations.",
    },
    {
      icon: "Search",
      title: "Custom cohorts on request",
      body: "Hiring companies can request a training cohort built around their exact requirements.",
    },
  ],
  who_we_work_with_intro: { title: "Job seekers and employers, on one platform" },
  job_seekers_intro: { title: "Job seekers", body: "We work with people at every stage of their career." },
  job_seeker_item: [
    { body: "Students preparing for their first role" },
    { body: "Working professionals looking to upskill" },
    { body: "Career changers exploring something new" },
  ],
  employers_intro: { title: "Employers", body: "We work with companies who need a faster, more reliable way to hire." },
  employer_item: [
    { body: "Companies of all sizes looking to hire faster" },
    { body: "Teams that want pre-screened, role-ready candidates" },
    { body: "Organizations that need a custom-trained cohort" },
  ],
  cta: {
    title: "Ready to get started?",
    body: "Whether you're building skills, ready to apply, or hiring for your team — Talent Track Technologies is ready to help.",
    primary_label: "Enquire Now",
    primary_url: "/contact",
    secondary_label: "Explore Training",
    secondary_url: "/training",
  },
};

export default function AboutPage() {
  useSeo({
    title: "About Us",
    description:
      "Learn about Talent Track Technologies — Training, Placement, Recruitment and Career Consulting under one roof.",
  });

  const { data: statistics } = useFetch("/statistics");
  const { data: sections } = useFetch("/page-sections?page=about");

  const hero = findSection(sections, "hero") || FALLBACK.hero;
  const intro = findSection(sections, "intro") || FALLBACK.intro;
  const approachIntro = findSection(sections, "approach_intro") || FALLBACK.approach_intro;
  const approachCards = sections ? listSection(sections, "approach_card") : FALLBACK.approach_card;
  const approachCardsToShow = approachCards.length > 0 ? approachCards : FALLBACK.approach_card;
  const whoWeWorkWithIntro = findSection(sections, "who_we_work_with_intro") || FALLBACK.who_we_work_with_intro;
  const jobSeekersIntro = findSection(sections, "job_seekers_intro") || FALLBACK.job_seekers_intro;
  const jobSeekerItems = sections ? listSection(sections, "job_seeker_item") : FALLBACK.job_seeker_item;
  const jobSeekerItemsToShow = jobSeekerItems.length > 0 ? jobSeekerItems : FALLBACK.job_seeker_item;
  const employersIntro = findSection(sections, "employers_intro") || FALLBACK.employers_intro;
  const employerItems = sections ? listSection(sections, "employer_item") : FALLBACK.employer_item;
  const employerItemsToShow = employerItems.length > 0 ? employerItems : FALLBACK.employer_item;
  const cta = findSection(sections, "cta") || FALLBACK.cta;

  return (
    <>
      <header className="page-header">
        <div className="container">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "About Us" }]} />
          <h1>{hero.title}</h1>
          {hero.subtitle && <p>{hero.subtitle}</p>}
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className={intro.image ? "intro-section" : "prose"}>
            <div className={intro.image ? "prose" : ""} dangerouslySetInnerHTML={renderBody(intro.body)} />
            {intro.image && <img src={intro.image} alt="" className="section-photo" loading="lazy" />}
          </div>
        </div>
      </section>

      {statistics && statistics.length > 0 && (
        <section className="section section--dark">
          <div className="container">
            <div className="stats-grid">
              {statistics.map((stat) => (
                <StatsCard key={stat.id} icon={getIcon(stat.icon)} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="What We Do"
            title="Four services, one connected team"
            subtitle="Because training, placement, recruitment and consulting sit under one roof, a candidate who enrols in a course can move straight into our placement pipeline — and a company that hires through us can request a custom cohort trained for their exact requirements."
            align="center"
          />
          <div className="card-grid">
            {PILLARS.map((pillar) => (
              <ServiceCard key={pillar.title} {...pillar} />
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs sections={sections} />

      <section className="section section--subtle">
        <div className="container">
          <SectionTitle eyebrow="Our Approach" title={approachIntro.title} align="center" />
          <div className="card-grid">
            {approachCardsToShow.map((card) => {
              const Icon = getIcon(card.icon);
              return (
                <div key={card.id || card.title} className="service-card">
                  <div className="service-card__icon">
                    <Icon size={26} aria-hidden="true" />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="Who We Work With" title={whoWeWorkWithIntro.title} align="center" />
          <div className="split-section">
            <div className="split-section__content">
              <h2>{jobSeekersIntro.title}</h2>
              <p>{jobSeekersIntro.body}</p>
              <div className="split-section__list">
                {jobSeekerItemsToShow.map((item) => (
                  <div className="split-section__list-item" key={item.id || item.body}>
                    <CheckCircle2 size={20} aria-hidden="true" />
                    <span>{item.body}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="split-section__content">
              <h2>{employersIntro.title}</h2>
              <p>{employersIntro.body}</p>
              <div className="split-section__list">
                {employerItemsToShow.map((item) => (
                  <div className="split-section__list-item" key={item.id || item.body}>
                    <CheckCircle2 size={20} aria-hidden="true" />
                    <span>{item.body}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--subtle">
        <div className="container">
          <CTASection
            title={cta.title}
            description={cta.body}
            primaryCta={cta.primary_label ? { label: cta.primary_label, to: cta.primary_url || "/contact" } : undefined}
            secondaryCta={cta.secondary_label ? { label: cta.secondary_label, to: cta.secondary_url || "/" } : undefined}
          />
        </div>
      </section>
    </>
  );
}

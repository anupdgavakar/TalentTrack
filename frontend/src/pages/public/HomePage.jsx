import {
  GraduationCap,
  Briefcase,
  Users,
  Compass,
  UserPlus,
  ClipboardCheck,
  BookOpenCheck,
  Search,
  MessagesSquare,
} from "lucide-react";
import Hero from "../../components/marketing/Hero";
import SectionTitle from "../../components/ui/SectionTitle";
import ServiceCard from "../../components/cards/ServiceCard";
import TestimonialCard from "../../components/cards/TestimonialCard";
import StatsCard from "../../components/cards/StatsCard";
import WhyChooseUs from "../../components/marketing/WhyChooseUs";
import LogoMarquee from "../../components/marketing/LogoMarquee";
import CourseCarousel from "../../components/marketing/CourseCarousel";
import CTASection from "../../components/marketing/CTASection";
import useFetch from "../../hooks/useFetch";
import useSeo from "../../hooks/useSeo";
import getIcon from "../../utils/iconMap";

// The four core services never change (they map 1:1 to the company's four
// service lines), so they stay a static array rather than an API call —
// unlike the hero banners, statistics, testimonials and courses below,
// which are all admin-managed content served by the Phase 3/4 API.
const SERVICES = [
  {
    icon: GraduationCap,
    title: "Training",
    description:
      "Industry-oriented technical and professional programs — from certification courses to corporate training — built around real hiring needs.",
    to: "/training",
  },
  {
    icon: Briefcase,
    title: "Placement",
    description:
      "Category-wise job opportunities across IT, banking, sales, engineering and more, with end-to-end placement assistance.",
    to: "/placement",
  },
  {
    icon: Users,
    title: "Recruitment",
    description:
      "We source and screen the right candidates for employers, cutting time-to-hire without cutting quality.",
    to: "/recruitment",
  },
  {
    icon: Compass,
    title: "Consulting",
    description:
      "One-on-one career and business consulting to help you plan the next step with clarity and confidence.",
    to: "/consulting",
  },
];

const PROCESS_STEPS = [
  { icon: UserPlus, title: "Register / Enquire", description: "Tell us your goal — training, a job, or hiring support." },
  { icon: ClipboardCheck, title: "Profile Assessment", description: "We assess your current skills and target role." },
  { icon: BookOpenCheck, title: "Training / Preparation", description: "Structured learning and interview preparation." },
  { icon: Search, title: "Opportunity Matching", description: "We match you to relevant, open roles." },
  { icon: MessagesSquare, title: "Interview", description: "Guided interview scheduling and prep support." },
  { icon: Briefcase, title: "Placement", description: "You're placed — and we stay in touch after." },
];

export default function HomePage() {
  // No `title` — the homepage keeps the plain site name ("Talent Track
  // Technologies") rather than "Home | Talent Track Technologies".
  useSeo({
    description:
      "Training, Placement, Recruitment and Career Consulting — build in-demand skills, get trained, and get placed with Talent Track Technologies.",
  });

  // Shape returned by GET /api/banners already matches Hero's `slides` prop
  // exactly (see backend/app/Http/Resources/BannerResource.php) — no
  // mapping needed between the API response and the component.
  const { data: banners } = useFetch("/banners");
  const { data: statistics } = useFetch("/statistics");
  const { data: testimonials } = useFetch("/testimonials?featured=1");
  // Every active course, not just the featured ones — CourseCarousel is a
  // horizontally scrollable strip rather than a fixed 3-card grid, so
  // there's no reason to cap this to a "sample" anymore. per_page is just
  // generous headroom above the current catalog size.
  const { data: courseData } = useFetch("/courses?per_page=24");
  const allCourses = courseData?.items || [];
  // The "Why Choose Us" grid is admin-managed from the About Page Content
  // screen (see WhyChooseUs.jsx's docblock) but shown here too — same
  // `/page-sections?page=about` request AboutPage.jsx makes.
  const { data: aboutSections } = useFetch("/page-sections?page=about");

  return (
    <>
      {banners && banners.length > 0 && <Hero slides={banners} />}

      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="What We Do"
            title="Four ways we help you move forward"
            subtitle="Whether you're building skills, looking for a job, hiring talent, or planning your next career move — we've got a service for it."
            align="center"
          />
          <div className="card-grid">
            {SERVICES.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
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

      {allCourses.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionTitle
              eyebrow="Training"
              title="Our training programs"
              subtitle="Browse our full range of industry-oriented courses — swipe or use the arrows to see more."
              align="center"
            />
            <CourseCarousel
              courses={allCourses.map((course) => ({
                id: course.id,
                title: course.title,
                category: course.category?.name,
                level: course.level,
                shortDescription: course.short_description,
                duration: course.duration,
                mode: course.mode,
                fee: course.fee,
                imageUrl: course.image_url,
                slug: course.slug,
              }))}
            />
          </div>
        </section>
      )}

      <WhyChooseUs sections={aboutSections} />

      <LogoMarquee sections={aboutSections} />

      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="How It Works"
            title="From enquiry to placement, in six steps"
            align="center"
          />
          <div className="card-grid">
            {PROCESS_STEPS.map(({ icon: Icon, title, description }, idx) => (
              <div key={title} className="service-card">
                <div className="service-card__icon">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <h3>
                  {idx + 1}. {title}
                </h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {testimonials && testimonials.length > 0 && (
        <section className="section section--subtle">
          <div className="container">
            <SectionTitle eyebrow="Success Stories" title="What our candidates say" align="center" />
            <div className="card-grid">
              {testimonials.map((t) => (
                <TestimonialCard
                  key={t.id}
                  testimonial={{
                    quote: t.quote,
                    name: t.name,
                    role: [t.role_title, t.company].filter(Boolean).join(" · "),
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <CTASection
            title="Ready to Build Your Career?"
            description="Whether you're starting to learn, ready to apply, or hiring for your team — Talent Track Technologies is ready to help."
            primaryCta={{ label: "Enquire Now", to: "/contact" }}
            secondaryCta={{ label: "Explore Opportunities", to: "/placement" }}
          />
        </div>
      </section>
    </>
  );
}

import SectionTitle from "../ui/SectionTitle";
import { listSection } from "../../utils/pageSectionKeys";

// Fixed at 4 — enough rows for the alternating-direction effect to read
// clearly without any one row feeling sparse once logos are split across
// them. Rows past the first stay empty (and simply don't render) until an
// admin has added enough logos to fill them.
const ROW_COUNT = 4;

// A CSS scroll-loop needs the track duplicated end-to-end (see the
// `logo-marquee-scroll` keyframes in cards.css, which animates exactly
// -50%) and enough logos that the loop doesn't visibly repeat every
// second — so a row with only 1–2 real logos gets padded by repeating
// them, rather than looking like it's stuttering.
function buildLoop(rowLogos, minPerHalf = 6) {
  if (rowLogos.length === 0) return [];
  const padded = [];
  while (padded.length < minPerHalf) {
    padded.push(...rowLogos);
  }
  return [...padded, ...padded];
}

/**
 * "Hiring Partners" — several rows of company logos, each row scrolling
 * continuously, alternating direction row to row (row 0 right-to-left, row
 * 1 left-to-right, and so on). Pure CSS animation, no JS ticking: each row
 * is just its logos duplicated once and animated with `translateX`, so
 * looping is seamless and there's nothing to keep in sync with scroll
 * state (unlike CourseCarousel, which tracks a real scroll position).
 *
 * Content is admin-managed from the About Page Content screen — the
 * `hiring_partner_logo` section key (repeatable: image + company name) —
 * the same "manage in one place, shown elsewhere" reasoning as
 * WhyChooseUs. Renders nothing until at least one logo has been added, on
 * purpose: this ships with no seeded logos (inventing placeholder company
 * names here would look like fabricated hiring partners), so a real
 * client site starts with this section hidden until an admin uploads
 * actual partner logos.
 */
export default function LogoMarquee({ sections }) {
  const logos = listSection(sections, "hiring_partner_logo");

  if (logos.length === 0) {
    return null;
  }

  const rows = Array.from({ length: ROW_COUNT }, () => []);
  logos.forEach((logo, i) => rows[i % ROW_COUNT].push(logo));

  return (
    <section className="section section--subtle">
      <div className="container">
        <SectionTitle eyebrow="Our Network" title="Hiring Partners" align="center" />
        <div className="logo-marquee">
          {rows
            .filter((row) => row.length > 0)
            .map((row, rowIndex) => (
              <div
                className={`logo-marquee__row${rowIndex % 2 === 1 ? " logo-marquee__row--reverse" : ""}`}
                key={rowIndex}
              >
                <div className="logo-marquee__track" style={{ "--marquee-duration": `${26 + rowIndex * 4}s` }}>
                  {buildLoop(row).map((logo, i) => (
                    <div className="logo-marquee__logo" key={`${logo.id}-${i}`}>
                      <img src={logo.image} alt={logo.title || ""} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

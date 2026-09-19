import { CheckCircle2 } from "lucide-react";
import Button from "../ui/Button";

// Four on-brand gradient combinations, built from the same palette as
// WhyChooseUs's icon badges (see cards.css's why-choose-us-item
// nth-child rules) so a course without its own thumbnail still gets a
// distinct, colorful header instead of a flat placeholder. Picked by a
// hash of the title rather than list position, so it's stable per course
// and works the same whether the card renders in a grid (TrainingPage) or
// a single-child carousel slide (CourseCarousel) — an nth-child rule keyed
// to sibling position would see every carousel card as "1st", since each
// one is the only child of its own slide wrapper.
const HEADER_VARIANTS = 4;

function variantIndex(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash * 31 + title.charCodeAt(i)) % HEADER_VARIANTS;
  }
  return hash;
}

/**
 * course: { id, title, category, level, shortDescription, duration, mode,
 * fee, imageUrl, slug }
 *
 * The colorful header block mirrors a common course-catalog card pattern
 * (photo or brand-color banner, with category/level shown as overlaid
 * pill badges) — see the redesign discussion for the reference. Below it,
 * the checklist deliberately only ever states things that are true for
 * every course rather than fabricated per-course numbers: duration and
 * fee come straight from the course record, and "100% Placement
 * Assistance" restates the same standing commitment already shown
 * elsewhere on the site (ServiceCard's Placement description, the Why
 * Choose Us "100% Job Assistance" item) — unlike a star rating or review
 * count, which this site has no real per-course data for and so isn't
 * shown here.
 */
export default function CourseCard({ course }) {
  const { title, category, level, shortDescription, duration, mode, fee, imageUrl, slug } = course;
  // A CSS custom property, not `backgroundImage` directly — the photo
  // variants in cards.css layer a brand-color tint gradient *and* this
  // image into `background-image`, and setting `backgroundImage` inline
  // would replace that whole layered value instead of filling in one part
  // of it (see the `--course-card-bg-image` rules there).
  const headerStyle = imageUrl ? { "--course-card-bg-image": `url(${imageUrl})` } : undefined;

  return (
    <article className="course-card">
      <div
        className={`course-card__header course-card__header--variant-${variantIndex(title || "")}${
          imageUrl ? " course-card__header--photo" : ""
        }`}
        style={headerStyle}
      >
        {(category || level) && (
          <div className="course-card__header-badges">
            {category && <span className="course-card__badge">{category}</span>}
            {level && <span className="course-card__badge">{level}</span>}
          </div>
        )}
      </div>

      <div className="course-card__body">
        <h3>{title}</h3>
        <p>{shortDescription}</p>

        <ul className="course-card__checklist">
          {duration && (
            <li>
              <CheckCircle2 size={15} aria-hidden="true" />
              Duration: {duration}
            </li>
          )}
          {fee != null && fee !== "" && (
            <li>
              <CheckCircle2 size={15} aria-hidden="true" />
              Fees: ₹{Number(fee).toLocaleString("en-IN")}
            </li>
          )}
          <li>
            <CheckCircle2 size={15} aria-hidden="true" />
            Placement: 100% Placement Assistance
          </li>
          {mode && (
            <li>
              <CheckCircle2 size={15} aria-hidden="true" />
              Mode: {mode}
            </li>
          )}
        </ul>

        <div className="course-card__actions">
          <Button to={`/training/${slug}`} size="sm" variant="outline">
            View Course
          </Button>
          <Button to={`/contact?course=${slug}`} size="sm" variant="ghost">
            Enquire Now
          </Button>
        </div>
      </div>
    </article>
  );
}

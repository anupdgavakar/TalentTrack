// A stable color per eyebrow label (hash of its text, same technique as
// CourseCard's variantIndex() and TestimonialCard's avatarColor()) so
// "WHAT WE DO", "HOW IT WORKS", "OUR APPROACH" and every other section
// pill across the site gets its own color instead of one flat green
// repeated on every page. Set as CSS custom properties (consumed by
// .section-title__eyebrow in components.css) rather than inline
// color/background directly, so the existing .section--dark/--green
// overrides — which need a fixed, contrast-safe color on those colored
// backgrounds — still win over whatever this hashes to.
const EYEBROW_COLORS = [
  ["var(--blue-600)", "var(--blue-100)"],
  ["var(--green-600)", "var(--green-100)"],
  ["var(--violet-600)", "var(--violet-100)"],
  ["var(--amber-600)", "var(--amber-100)"],
  ["var(--teal-600)", "var(--teal-100)"],
  ["var(--rose-600)", "var(--rose-100)"],
  ["var(--indigo-600)", "var(--indigo-100)"],
];

function eyebrowColors(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) % EYEBROW_COLORS.length;
  return EYEBROW_COLORS[hash];
}

/**
 * Consistent heading block used at the top of every homepage/section.
 * `as` picks the heading level (default h2) so page outlines stay valid.
 */
export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "left",
  as: Tag = "h2",
}) {
  const [eyebrowColor, eyebrowBg] = eyebrow ? eyebrowColors(eyebrow) : [];

  return (
    <div className={`section-title${align === "center" ? " section-title--center" : ""}`}>
      {eyebrow && (
        <span
          className="section-title__eyebrow"
          style={{ "--eyebrow-color": eyebrowColor, "--eyebrow-bg": eyebrowBg }}
        >
          {eyebrow}
        </span>
      )}
      <Tag>{title}</Tag>
      {subtitle && <p className="section-title__subtitle">{subtitle}</p>}
    </div>
  );
}

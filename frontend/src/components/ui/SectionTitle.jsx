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
  return (
    <div className={`section-title${align === "center" ? " section-title--center" : ""}`}>
      {eyebrow && <span className="section-title__eyebrow">{eyebrow}</span>}
      <Tag>{title}</Tag>
      {subtitle && <p className="section-title__subtitle">{subtitle}</p>}
    </div>
  );
}

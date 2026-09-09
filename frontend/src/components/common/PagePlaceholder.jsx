// Temporary scaffold placeholder. Every page below is replaced with real,
// designed content in Phase 2 (design system) and Phase 5+ (public site,
// training, placement, admin modules). This component only proves out the
// routing architecture for Phase 1.
export default function PagePlaceholder({ title, description }) {
  return (
    <section style={{ padding: "2rem" }}>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      <p style={{ color: "#888" }}>
        Content for this page will be implemented in a later phase.
      </p>
    </section>
  );
}

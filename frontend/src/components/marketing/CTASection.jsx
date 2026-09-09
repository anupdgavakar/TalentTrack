import Button from "../ui/Button";

export default function CTASection({ title, description, primaryCta, secondaryCta }) {
  return (
    <div className="cta-section">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="cta-section__actions">
        {primaryCta && (
          <Button to={primaryCta.to} variant="accent" size="lg">
            {primaryCta.label}
          </Button>
        )}
        {secondaryCta && (
          <Button to={secondaryCta.to} variant="outline-inverse" size="lg">
            {secondaryCta.label}
          </Button>
        )}
      </div>
    </div>
  );
}

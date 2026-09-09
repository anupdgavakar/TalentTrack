import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ServiceCard({ icon: Icon, title, description, to, ctaLabel = "Learn more" }) {
  return (
    <Link to={to} className="service-card">
      <div className="service-card__icon">
        <Icon size={26} aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="service-card__cta">
        {ctaLabel}
        <ArrowRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}

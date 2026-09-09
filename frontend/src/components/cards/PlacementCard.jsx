import { Link } from "react-router-dom";

/**
 * category: { name, slug, openJobsCount, icon }
 * Fed by GET /api/placement-categories from Phase 7 onward.
 */
export default function PlacementCard({ category }) {
  const { name, slug, openJobsCount, icon: Icon } = category;

  return (
    <Link to={`/placement/${slug}`} className="placement-card">
      <div className="placement-card__icon">
        <Icon size={24} aria-hidden="true" />
      </div>
      <h4>{name}</h4>
      {typeof openJobsCount === "number" && (
        <span className="placement-card__count">
          {openJobsCount} open opportunit{openJobsCount === 1 ? "y" : "ies"}
        </span>
      )}
    </Link>
  );
}

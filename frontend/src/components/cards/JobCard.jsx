import { MapPin, Briefcase, Clock } from "lucide-react";
import Button from "../ui/Button";

/**
 * job: { id, title, company, location, employmentType, experience, featured }
 * Fed by GET /api/jobs from Phase 7 onward.
 */
export default function JobCard({ job }) {
  const { id, title, company, location, employmentType, experience, featured } = job;

  return (
    <article className="job-card">
      <div className="job-card__main">
        <div className="job-card__title-row">
          <h3>{title}</h3>
          {featured && <span className="job-card__badge">Featured</span>}
        </div>
        <div className="job-card__company">{company}</div>
        <div className="job-card__meta">
          {location && (
            <span className="job-card__meta-item">
              <MapPin size={14} aria-hidden="true" /> {location}
            </span>
          )}
          {employmentType && (
            <span className="job-card__meta-item">
              <Briefcase size={14} aria-hidden="true" /> {employmentType}
            </span>
          )}
          {experience && (
            <span className="job-card__meta-item">
              <Clock size={14} aria-hidden="true" /> {experience}
            </span>
          )}
        </div>
      </div>
      <Button to={`/jobs/${id}`} variant="outline">
        View Details
      </Button>
    </article>
  );
}

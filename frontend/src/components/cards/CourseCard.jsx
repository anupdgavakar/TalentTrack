import { Clock, Monitor } from "lucide-react";
import Button from "../ui/Button";

/**
 * course: { title, category, shortDescription, duration, mode, slug }
 * Will be fed by GET /api/courses from Phase 6 onward; for now it just
 * renders whatever shape is passed in.
 */
export default function CourseCard({ course }) {
  const { title, category, shortDescription, duration, mode, slug } = course;

  return (
    <article className="course-card">
      <div className="course-card__body">
        {category && <span className="course-card__category">{category}</span>}
        <h3>{title}</h3>
        <p>{shortDescription}</p>

        <div className="course-card__meta">
          {duration && (
            <span className="course-card__meta-item">
              <Clock size={14} aria-hidden="true" /> {duration}
            </span>
          )}
          {mode && (
            <span className="course-card__meta-item">
              <Monitor size={14} aria-hidden="true" /> {mode}
            </span>
          )}
        </div>

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

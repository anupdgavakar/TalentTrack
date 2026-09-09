/**
 * testimonial: { quote, name, role }
 * Fed by an admin-managed testimonials API from Phase 9/10 onward.
 */
export default function TestimonialCard({ testimonial }) {
  const { quote, name, role } = testimonial;
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="testimonial-card">
      <p className="testimonial-card__quote">{quote}</p>
      <div className="testimonial-card__person">
        <div className="testimonial-card__avatar" aria-hidden="true">
          {initials}
        </div>
        <div>
          <div className="testimonial-card__name">{name}</div>
          <div className="testimonial-card__role">{role}</div>
        </div>
      </div>
    </div>
  );
}

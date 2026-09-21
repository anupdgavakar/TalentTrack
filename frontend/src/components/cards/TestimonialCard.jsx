import { Star, BadgeCheck } from "lucide-react";
import { GoogleIcon } from "../ui/SocialIcons";

// A handful of on-brand avatar background colors, picked by a hash of the
// name (same technique as CourseCard's variantIndex) so each reviewer gets
// a stable, distinct color instead of every avatar looking identical —
// matching the varied avatar colors real Google review widgets show.
const AVATAR_COLORS = ["#2159d1", "#1f9d4f", "#c2410c", "#7c3aed", "#be123c", "#0e7490"];
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * testimonial: { quote, name, role, rating, reviewDate, googleUrl, isVerified }
 * Fed by an admin-managed testimonials API (Phase 9/10 onward), extended
 * to carry a rating, the date the review was actually left, a verified
 * flag, and an optional link back to the real review — styled to read as
 * a genuine Google review card (name, star rating, date, "Google" source
 * mark) because that's what it is: real reviews an admin copies in from
 * the business's own Google Business Profile, not synthesized ones. See
 * TestimonialFormPage.jsx's "Quote" field hint and the migration comment
 * on `is_verified` for why this isn't a live Places API pull.
 */
export default function TestimonialCard({ testimonial }) {
  const { quote, name, role, rating, reviewDate, googleUrl, isVerified } = testimonial;
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const formattedDate = formatDate(reviewDate);

  const Wrapper = googleUrl ? "a" : "div";
  const wrapperProps = googleUrl ? { href: googleUrl, target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Wrapper className="testimonial-card" {...wrapperProps}>
      <div className="testimonial-card__header">
        <div className="testimonial-card__avatar" style={{ background: avatarColor(name || "?") }} aria-hidden="true">
          {initials}
        </div>
        <div className="testimonial-card__person">
          <div className="testimonial-card__name-row">
            <span className="testimonial-card__name">{name}</span>
            {isVerified && <BadgeCheck size={15} className="testimonial-card__verified" aria-label="Verified review" />}
          </div>
          {(formattedDate || role) && <div className="testimonial-card__role">{formattedDate || role}</div>}
        </div>
        <GoogleIcon size={20} className="testimonial-card__google-mark" />
      </div>

      {rating && (
        <div className="testimonial-card__stars" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={15} fill={i < rating ? "currentColor" : "none"} aria-hidden="true" />
          ))}
        </div>
      )}

      <p className="testimonial-card__quote">{quote}</p>
    </Wrapper>
  );
}

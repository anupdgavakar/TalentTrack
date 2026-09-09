import { Sparkles } from "lucide-react";
import Button from "../ui/Button";
import useCarousel from "../../hooks/useCarousel";

/**
 * The homepage hero — a single synchronized carousel. Each entry in `slides`
 * carries BOTH the text (eyebrow/title/description/CTAs) and the image for
 * that slide, so the whole hero — headline, description, buttons and
 * picture — rotates together as one unit, auto-playing exactly like
 * `ImageSlider` (crossfade, pause on hover/focus/reduced-motion, touch
 * swipe, dot navigation, no prev/next arrows).
 *
 * Shape: [{ id, eyebrow?, title, description, primaryCta?, secondaryCta?,
 * image, alt? }] — deliberately close to the planned `banners` table, so
 * this becomes a `GET /api/banners` response later with minimal changes.
 *
 * `stats` (optional, [{ value, label }]) stays constant across slides —
 * rendered as small stat chips beneath the CTAs, same as before.
 */
export default function Hero({ slides = [], stats = [], autoPlay = true, interval = 5000 }) {
  const { index, goTo, pauseHandlers, swipeHandlers } = useCarousel({
    length: slides.length,
    autoPlay,
    interval,
  });

  if (slides.length === 0) return null;

  const slide = slides[index];

  return (
    <section className="hero" {...pauseHandlers} {...swipeHandlers}>
      <div className="container hero__inner">
        <div className="hero__content" aria-live="polite">
          <div key={slide.id} className="hero__slide-text">
            {slide.eyebrow && (
              <span className="hero__eyebrow">
                <Sparkles size={14} aria-hidden="true" />
                {slide.eyebrow}
              </span>
            )}
            <h1>{slide.title}</h1>
            <p>{slide.description}</p>
            <div className="hero__actions">
              {slide.primaryCta && (
                <Button to={slide.primaryCta.to} variant="accent" size="lg">
                  {slide.primaryCta.label}
                </Button>
              )}
              {slide.secondaryCta && (
                <Button to={slide.secondaryCta.to} variant="outline-inverse" size="lg">
                  {slide.secondaryCta.label}
                </Button>
              )}
            </div>
          </div>

          {stats.length > 0 && (
            <div className="hero__stats">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="hero__stat-value">{stat.value}</div>
                  <div className="hero__stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hero__visual">
          <div className="image-slider">
            <div className="image-slider__viewport">
              <img
                key={`${slide.id}-img`}
                src={slide.image}
                alt={slide.alt || ""}
                className="image-slider__img"
                // Above-the-fold LCP candidate on the homepage — the
                // opposite of loading="lazy": hints the browser to fetch
                // this before lower-priority resources (Phase 12).
                fetchPriority="high"
              />
            </div>

            {slides.length > 1 && (
              <div className="image-slider__dots" role="tablist" aria-label="Slides">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`image-slider__dot${i === index ? " is-active" : ""}`}
                    onClick={() => goTo(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

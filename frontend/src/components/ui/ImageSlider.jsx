import useCarousel from "../../hooks/useCarousel";

/**
 * Auto-playing image carousel. Content-managed: pass `slides` as
 * [{ id, image, alt, title?, caption? }] — this shape matches the
 * `banners` table planned for the admin Content module, so swapping this
 * static array for a `GET /api/banners` response later is a drop-in change.
 *
 * Fully automatic by design — no prev/next arrows, just a soft crossfade
 * between slides and small dots for a manual jump. Accessible: pauses on
 * hover/focus/reduced-motion, dots are real buttons, and the current slide
 * is announced to screen readers via aria-live.
 */
export default function ImageSlider({ slides = [], autoPlay = true, interval = 5000 }) {
  const { index, goTo, pauseHandlers, swipeHandlers } = useCarousel({
    length: slides.length,
    autoPlay,
    interval,
  });

  if (slides.length === 0) return null;

  const slide = slides[index];

  return (
    <div className="image-slider" {...pauseHandlers} {...swipeHandlers}>
      <div className="image-slider__viewport" aria-live="polite">
        <img key={slide.id} src={slide.image} alt={slide.alt || ""} className="image-slider__img" />
        {(slide.title || slide.caption) && (
          <div key={`${slide.id}-caption`} className="image-slider__caption">
            {slide.title && <strong>{slide.title}</strong>}
            {slide.caption && <span>{slide.caption}</span>}
          </div>
        )}
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
  );
}

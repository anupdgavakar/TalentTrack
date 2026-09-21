import { useEffect, useRef, useState } from "react";
import TestimonialCard from "../cards/TestimonialCard";

const AUTOPLAY_INTERVAL = 5000;

/**
 * A horizontally swipeable strip of review cards — same mechanics as
 * CourseCarousel (native CSS scroll-snap, one dot per slide, autoplay
 * paused on hover/focus/touch, skipped for prefers-reduced-motion), kept
 * as its own component rather than generalizing CourseCarousel because
 * the two render different card types and there's no other user of a
 * generic version yet. See CourseCarousel.jsx's own comment for the full
 * reasoning behind this approach over a carousel library.
 */
export default function TestimonialCarousel({ testimonials }) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    let frame = null;
    const updateActiveIndex = () => {
      frame = null;
      const slides = track.querySelectorAll(".testimonial-carousel__slide");
      let closest = 0;
      let closestDistance = Infinity;
      slides.forEach((slide, i) => {
        const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = i;
        }
      });
      setActiveIndex(closest);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(updateActiveIndex);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [testimonials.length]);

  const goToSlide = (index) => {
    const track = trackRef.current;
    const slide = track?.querySelectorAll(".testimonial-carousel__slide")[index];
    if (!track || !slide) return;
    track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  };

  useEffect(() => {
    if (paused || testimonials.length <= 1) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % testimonials.length;
        goToSlide(next);
        return next;
      });
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- goToSlide only reads trackRef.current, which is stable
  }, [paused, testimonials.length]);

  const pauseHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
    onTouchStart: () => setPaused(true),
    onTouchEnd: () => setPaused(false),
  };

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div className="testimonial-carousel" {...pauseHandlers}>
      <div className="testimonial-carousel__track" ref={trackRef}>
        {testimonials.map((t) => (
          <div className="testimonial-carousel__slide" key={t.id}>
            <TestimonialCard testimonial={t} />
          </div>
        ))}
      </div>

      {testimonials.length > 1 && (
        <div className="testimonial-carousel__dots" role="tablist" aria-label="Reviews">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to ${t.name}'s review`}
              className={`testimonial-carousel__dot${i === activeIndex ? " is-active" : ""}`}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import CourseCard from "../cards/CourseCard";

/**
 * A horizontally scrollable strip of course cards, used on the homepage to
 * show every training program (not just a sample of 3) without needing a
 * paginated grid. Built on native CSS scroll-snap — the browser already
 * handles touch swipe and trackpad scrolling on an overflow-x track — with
 * one dot per course below it as the slide indicator: clicking a dot
 * scrolls that card into view, and scrolling the strip (swipe, trackpad,
 * or dragging the native scrollbar-less track) updates which dot is lit.
 *
 * Not the single-active-slide `useCarousel` hook (that one crossfades ONE
 * slide at a time, like Hero/ImageSlider, and never shows more than one)
 * — here several cards are visible at once, so "active" just means
 * "closest to the left edge right now".
 */
export default function CourseCarousel({ courses }) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    let frame = null;
    const updateActiveIndex = () => {
      frame = null;
      const slides = track.querySelectorAll(".course-carousel__slide");
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
  }, [courses.length]);

  const goToSlide = (index) => {
    const track = trackRef.current;
    const slide = track?.querySelectorAll(".course-carousel__slide")[index];
    if (!track || !slide) return;
    track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  };

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="course-carousel">
      <div className="course-carousel__track" ref={trackRef}>
        {courses.map((course) => (
          <div className="course-carousel__slide" key={course.slug}>
            <CourseCard course={course} />
          </div>
        ))}
      </div>

      {courses.length > 1 && (
        <div className="course-carousel__dots" role="tablist" aria-label="Training programs">
          {courses.map((course, i) => (
            <button
              key={course.slug}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Go to ${course.title}`}
              className={`course-carousel__dot${i === activeIndex ? " is-active" : ""}`}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

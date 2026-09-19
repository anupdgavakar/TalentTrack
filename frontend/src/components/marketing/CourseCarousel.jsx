import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CourseCard from "../cards/CourseCard";

/**
 * A horizontally scrollable strip of course cards, used on the homepage to
 * show every training program (not just a sample of 3) without needing a
 * paginated grid. Built on native CSS scroll-snap rather than the
 * single-active-slide `useCarousel` hook (that one crossfades ONE slide at
 * a time, like Hero/ImageSlider) or a carousel library — the browser
 * already handles touch swipe and trackpad scrolling on an overflow-x
 * track, so the two arrow buttons just nudge `scrollBy` one card at a
 * time; there's no slide-index state to keep in sync with anything.
 */
export default function CourseCarousel({ courses }) {
  const trackRef = useRef(null);

  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector(".course-carousel__slide");
    const gap = 24; // matches --space-6, used as the track's flex gap below
    const amount = slide ? slide.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
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
        <>
          <button
            type="button"
            className="course-carousel__arrow course-carousel__arrow--prev"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous courses"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="course-carousel__arrow course-carousel__arrow--next"
            onClick={() => scrollByCard(1)}
            aria-label="Next courses"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}

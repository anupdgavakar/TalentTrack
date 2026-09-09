import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Shared auto-rotation logic used by the Hero (image + headline rotate
 * together) and by ImageSlider (image-only carousels elsewhere). Returns
 * the current index plus everything needed to wire up pause-on-hover/focus
 * and touch-swipe on whatever markup the caller renders.
 */
export default function useCarousel({ length, autoPlay = true, interval = 5000 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  const goTo = useCallback((i) => setIndex(((i % length) + length) % length), [length]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!autoPlay || paused || length <= 1) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoPlay, paused, interval, next, length]);

  const pauseHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  };

  const swipeHandlers = {
    onTouchStart: (e) => {
      touchStartX.current = e.touches[0].clientX;
    },
    onTouchEnd: (e) => {
      if (touchStartX.current === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      if (delta > 40) prev();
      else if (delta < -40) next();
      touchStartX.current = null;
    },
  };

  return { index, goTo, next, prev, pauseHandlers, swipeHandlers };
}

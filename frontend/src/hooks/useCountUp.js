import { useEffect, useRef, useState } from "react";

// Parses a stat value like "500+", "92%", "1,200+" into its leading
// integer plus whatever comes after it. The animation only ever counts
// the number; the suffix (an admin might type "+", "%", " Cities", or
// nothing at all) is left untouched and reattached on every frame, so
// this works for any stat value without the admin having to format it
// specially. Returns null for a value with no leading number (e.g. a
// stat someone sets to plain text) so the caller can fall back to just
// showing it as-is instead of animating garbage.
function parseValue(raw) {
  const match = /^(-?[\d,]+)(.*)$/.exec(String(raw ?? "").trim());
  if (!match) return null;
  const number = Number(match[1].replace(/,/g, ""));
  if (Number.isNaN(number)) return null;
  return { number, suffix: match[2] };
}

const DURATION_MS = 1400;

/**
 * Counts a StatsCard's numeric value up from 0 once the card scrolls into
 * view, easing to a stop on the real number — a one-time reveal, not a
 * repeating animation (the observer disconnects itself after the first
 * trigger). Returns `[ref, display]`: attach `ref` to the element that
 * should trigger the count when visible, render `display` in place of the
 * raw value.
 *
 * Skips the animation (shows the final value immediately) when the value
 * isn't a recognizable "<number><suffix>" shape, or when the visitor has
 * `prefers-reduced-motion` set.
 */
export default function useCountUp(rawValue) {
  const ref = useRef(null);
  const parsed = parseValue(rawValue);
  const [display, setDisplay] = useState(() => (parsed ? `0${parsed.suffix}` : rawValue));

  useEffect(() => {
    if (!parsed) {
      setDisplay(rawValue);
      return undefined;
    }

    const node = ref.current;
    if (!node || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(rawValue);
      return undefined;
    }

    let frame = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / DURATION_MS, 1);
          // Ease-out cubic: quick at first, settles gently onto the real
          // number instead of stopping abruptly.
          const eased = 1 - (1 - progress) ** 3;
          const current = Math.round(parsed.number * eased);
          setDisplay(`${current.toLocaleString("en-IN")}${parsed.suffix}`);
          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          }
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
    // Re-running on every `rawValue` change (not just on mount) keeps this
    // correct if admin-edited stats ever refetch into an already-mounted
    // card — re-observing from 0 again is the right behavior there, not a
    // bug to suppress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawValue]);

  return [ref, display];
}

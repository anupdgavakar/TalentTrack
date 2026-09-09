/**
 * lucide-react dropped brand/social icons, so these four are small
 * hand-drawn outlines kept in the same stroke style (24x24, round caps)
 * as the rest of the icon set used across the app.
 */
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function FacebookIcon({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden="true" {...rest}>
      <path d="M15 3h-2a5 5 0 0 0-5 5v3H6v4h2v6h4v-6h3l1-4h-4V8a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function InstagramIcon({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden="true" {...rest}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden="true" {...rest}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="7.5" y1="10" x2="7.5" y2="17" />
      <circle cx="7.5" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      <path d="M11.5 17v-4a2.5 2.5 0 0 1 5 0v4" />
      <line x1="11.5" y1="10" x2="11.5" y2="17" />
    </svg>
  );
}

export function YoutubeIcon({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden="true" {...rest}>
      <rect x="2.5" y="6" width="19" height="12" rx="4" />
      <polygon points="10.5 9.5 15 12 10.5 14.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

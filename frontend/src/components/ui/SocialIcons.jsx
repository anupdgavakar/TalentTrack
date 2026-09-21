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

// Used by TestimonialCard.jsx to mark a review as sourced from Google (the
// standard 4-colour "G" logomark) — same reasoning as WhatsappIcon below:
// purely to indicate *where* a real, admin-entered review came from, not
// an official Google integration or endorsement.
export function GoogleIcon({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" {...rest}>
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.6H24v9h11.8c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.6Z" />
      <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.6-3.9-12.4-9.1h-7.3v5.7C7.9 40.9 15.4 46 24 46Z" />
      <path fill="#FBBC05" d="M11.6 28.2c-.5-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.3A21.9 21.9 0 0 0 2 24c0 3.5.9 6.9 2.3 9.9l7.3-5.7Z" />
      <path fill="#EA4335" d="M24 10.7c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C34.9 4.3 30 2 24 2 15.4 2 7.9 7.1 4.3 14.1l7.3 5.7c1.8-5.2 6.6-9.1 12.4-9.1Z" />
    </svg>
  );
}

// Used by FloatingContactButtons.jsx (a "chat with us on WhatsApp" link) —
// same hand-drawn-outline treatment as the four icons above, not lucide,
// since lucide-react doesn't ship brand icons either.
export function WhatsappIcon({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden="true" {...rest}>
      <path d="M7 20.5 3.5 21l0.6 -3.3A8 8 0 1 1 7 20.5Z" />
      <path d="M8.2 8.4c0.3 -0.7 0.6 -0.7 0.9 -0.7h0.5c0.2 0 0.4 0 0.6 0.5s0.7 1.7 0.8 1.8 0 0.3 0 0.5 -0.2 0.4 -0.4 0.6 -0.3 0.4 -0.1 0.7c0.2 0.3 0.9 1.4 1.9 2.3 1.3 1.1 2.1 1.4 2.4 1.6s0.5 0.1 0.7 -0.1 0.7 -0.8 0.9 -1.1 0.4 -0.2 0.7 -0.1 1.7 0.8 2 0.9 0.5 0.3 0.5 0.5c0.1 0.6 -0.1 1.3 -0.4 1.7 -0.3 0.4 -1.1 0.9 -2.1 0.9 -1.6 0 -3.7 -1 -5.1 -2.3 -1.7 -1.5 -2.7 -3.3 -2.9 -3.7 -0.2 -0.3 -1 -1.5 -1 -2.7 0 -1.3 0.6 -1.8 0.8 -2.1Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

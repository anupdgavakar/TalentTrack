/**
 * Shown until `GET /api/settings/public` resolves (or if it fails), so
 * nothing that reads site settings ever renders blank. Once the admin
 * Settings screen (Phase 9) saves real values, editing them there updates
 * every consumer immediately — these constants are only the
 * "nothing's arrived yet" state, not the source of truth.
 *
 * Extracted out of `Footer.jsx` (Phase 5) in Phase 12 so the new
 * Organization JSON-LD in `PublicLayout` can share the exact same fallback
 * shape instead of duplicating it.
 */
export const FALLBACK_SETTINGS = {
  footer_address: "2nd Floor, Tech Park Road, Baner, Pune, Maharashtra 411045",
  footer_phone: "+91 12345 67890",
  footer_email: "info@talenttracktech.com",
  social_facebook_url: "#",
  social_instagram_url: "#",
  social_linkedin_url: "#",
  social_youtube_url: "#",
};

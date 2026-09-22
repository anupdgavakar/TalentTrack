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
  // "Find Us" map block on the Contact page (ContactPage.jsx). These two
  // are edited from Settings -> Office Location, same as the rest of this
  // file — the values below are the real office location, used only until
  // an admin visits that screen (they haven't needed to yet, since this is
  // a brand-new field with no saved value in the settings table).
  office_map_address:
    "Second Floor, Yugay Plaza, Above Hotel Manas Satara, Between Gandharv Veg and Joshi Wadewale, On main road going towards Congress Bhavan Road, At T Junction Signal, Balgandharv Chowk, Off J.M. Road, Shivaji Nagar, Pune 411005",
  office_map_link: "https://maps.app.goo.gl/BRReepLHcYoyKd3T9",
};

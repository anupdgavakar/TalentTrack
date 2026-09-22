import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import FloatingContactButtons from "../components/marketing/FloatingContactButtons";
import Loader from "../components/ui/Loader";
import useFetch from "../hooks/useFetch";
import useJsonLd from "../hooks/useJsonLd";
import { SITE_NAME, SITE_URL } from "../config/site";
import { FALLBACK_SETTINGS } from "../utils/siteSettings";
import logo from "../assets/logo.png";

// Shared shell for every public-facing page.
export default function PublicLayout() {
  // Sitewide Organization/LocalBusiness structured data (Phase 12,
  // upgraded when the Contact page's "Find Us" map was added) — same
  // settings endpoint and fallback constants Footer.jsx already reads, so
  // this never waits on a request the page doesn't already need.
  // Placeholder social links ("#", the FALLBACK_SETTINGS default) are
  // filtered out of `sameAs` rather than submitted as real URLs.
  //
  // "@type" carries both Organization and LocalBusiness (schema.org and
  // Google both support a type array like this) — LocalBusiness is what
  // signals "this org has one physical, visitable location" to search
  // engines, which is what the address/location result in search actually
  // comes from, alongside (separately) a verified Google Business Profile.
  //
  // The structured `address` below is built from office_map_address (see
  // ContactPage.jsx / Settings -> Office Location) rather than
  // footer_address, since that's the one real, complete office address on
  // file as of this change. For consistent "NAP" (name/address/phone)
  // signals across the site, footer_address in Settings -> Contact Info
  // should be updated to match it.
  //
  // addressLocality/addressRegion/postalCode/addressCountry are fixed
  // (Pune/Maharashtra/411005/IN) rather than parsed out of the free-text
  // address setting, since that field can contain landmark directions as
  // well as the formal address — update these four if the office ever
  // moves to a different city/state/PIN.
  //
  // No `geo` (latitude/longitude) is included — verifying real coordinates
  // for the office needs either a geocoding service or the admin reading
  // them off Google Maps directly, so nothing is guessed here rather than
  // publish invented coordinates for a real place.
  const { data } = useFetch("/settings/public");
  const settings = { ...FALLBACK_SETTINGS, ...data };
  useJsonLd("org-schema", {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_URL + logo,
    image: SITE_URL + logo,
    description: "Training, placement, recruitment and career consulting.",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.office_map_address,
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      postalCode: "411005",
      addressCountry: "IN",
    },
    telephone: settings.footer_phone,
    email: settings.footer_email,
    // Add the Google Business Profile URL here (once one is claimed and
    // verified) alongside the social links below — that's what ties this
    // structured data to the map/local-pack listing in search results.
    sameAs: [
      settings.social_facebook_url,
      settings.social_instagram_url,
      settings.social_linkedin_url,
      settings.social_youtube_url,
    ].filter((url) => url && url !== "#"),
  });

  return (
    <div className="public-layout">
      {/* Only visible once focused (Tab from the address bar) — lets a
          keyboard user jump straight past the header/nav to the page's
          actual content instead of tabbing through every nav link first. */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      {/* tabIndex=-1: not part of the normal tab order, but focusable
          programmatically so the skip link above can move focus here. */}
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<Loader center label="Loading…" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <FloatingContactButtons settings={settings} />
    </div>
  );
}

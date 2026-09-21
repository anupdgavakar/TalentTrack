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
  // Sitewide Organization structured data (Phase 12) — same settings
  // endpoint and fallback constants Footer.jsx already reads, so this
  // never waits on a request the page doesn't already need. Placeholder
  // social links ("#", the FALLBACK_SETTINGS default) are filtered out of
  // `sameAs` rather than submitted as real URLs.
  const { data } = useFetch("/settings/public");
  const settings = { ...FALLBACK_SETTINGS, ...data };
  useJsonLd("org-schema", {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_URL + logo,
    description: "Training, placement, recruitment and career consulting.",
    address: settings.footer_address,
    telephone: settings.footer_phone,
    email: settings.footer_email,
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

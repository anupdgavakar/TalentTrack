import PageSectionManager from "../../../components/admin/PageSectionManager";

/**
 * A one-row "page" (page="site", section_key="logo") that doesn't belong
 * to any single public page — reuses PageSectionManager purely for its
 * image upload/optimization/preview handling rather than building a
 * second image-upload path in Settings. Header.jsx and Footer.jsx read
 * this same row and fall back to the bundled logo.png until an admin
 * uploads a real one.
 */
export default function SiteBrandingPage() {
  return (
    <PageSectionManager
      page="site"
      heading="Site Branding"
      description="Upload your logo — shown in the header and footer across the whole site. Leave unset to keep the default logo."
    />
  );
}

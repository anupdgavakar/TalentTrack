import PagePlaceholder from "../../components/common/PagePlaceholder";
import useSeo from "../../hooks/useSeo";

export default function PrivacyPolicyPage() {
  // noindex: this is still the Phase 1 placeholder, not a real policy (see
  // PagePlaceholder.jsx's own comment) — indexing a thin, incomplete legal
  // page would be actively bad for SEO and misleading to visitors. Carried
  // forward in docs/PHASE_PLAN.md's "Open items" until real legal copy
  // replaces this, at which point this noindex should come off too.
  useSeo({ title: "Privacy Policy", noindex: true });

  return <PagePlaceholder title="Privacy Policy" />;
}

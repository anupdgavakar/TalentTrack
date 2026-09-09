import PagePlaceholder from "../../components/common/PagePlaceholder";
import useSeo from "../../hooks/useSeo";

export default function TermsPage() {
  // noindex — see PrivacyPolicyPage.jsx's comment; same placeholder-content
  // situation, same reasoning.
  useSeo({ title: "Terms of Use", noindex: true });

  return <PagePlaceholder title="Terms of Use" />;
}

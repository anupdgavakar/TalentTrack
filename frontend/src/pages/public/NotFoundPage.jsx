import { SearchX } from "lucide-react";
import Button from "../../components/ui/Button";
import useSeo from "../../hooks/useSeo";

export default function NotFoundPage() {
  useSeo({ title: "Page Not Found", noindex: true });

  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
          <SearchX size={48} aria-hidden="true" style={{ color: "var(--text-muted)", marginBottom: "var(--space-5)" }} />
          <h1>Page not found</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "var(--space-8)" }}>
            The page you're looking for doesn't exist, or may have moved.
          </p>
          <div style={{ display: "flex", gap: "var(--space-4)", justifyContent: "center", flexWrap: "wrap" }}>
            <Button to="/" variant="primary">
              Back to Home
            </Button>
            <Button to="/contact" variant="outline">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

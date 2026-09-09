import { Briefcase } from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import SectionTitle from "../../components/ui/SectionTitle";
import PlacementCard from "../../components/cards/PlacementCard";
import JobCard from "../../components/cards/JobCard";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Alert from "../../components/ui/Alert";
import useFetch from "../../hooks/useFetch";
import useSeo from "../../hooks/useSeo";

export default function PlacementPage() {
  useSeo({
    title: "Placement Opportunities",
    description:
      "Category-wise job opportunities across IT, banking, sales, engineering and more, with end-to-end placement assistance from resume to offer.",
  });

  const { data: categories, loading: categoriesLoading } = useFetch("/categories?type=job");
  const { data: featuredData, loading: jobsLoading, error: jobsError } = useFetch(
    "/job-postings?listing_type=placement&featured=1&per_page=6"
  );
  const featuredJobs = featuredData?.items || [];

  return (
    <>
      <header className="page-header">
        <div className="container">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Placement" }]} />
          <h1>Placement Opportunities</h1>
          <p>
            Category-wise job opportunities across IT, banking, sales, engineering and more —
            with end-to-end placement assistance from resume to offer.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="Browse by Category" title="Find opportunities in your field" />

          {categoriesLoading && <Loader center label="Loading categories…" />}

          {!categoriesLoading && (!categories || categories.length === 0) && (
            <EmptyState title="No categories available yet" />
          )}

          {!categoriesLoading && categories && categories.length > 0 && (
            <div className="card-grid">
              {categories.map((cat) => (
                <PlacementCard key={cat.id} category={{ name: cat.name, slug: cat.slug, icon: Briefcase }} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--subtle">
        <div className="container">
          <SectionTitle eyebrow="Featured" title="Featured openings" />

          {jobsLoading && <Loader center label="Loading openings…" />}
          {jobsError && <Alert variant="error">{jobsError}</Alert>}

          {!jobsLoading && !jobsError && featuredJobs.length === 0 && (
            <EmptyState title="No featured openings right now" description="Check back soon, or browse a category above." />
          )}

          {!jobsLoading && !jobsError && featuredJobs.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {featuredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={{
                    id: job.slug,
                    title: job.title,
                    company: job.company_name,
                    location: job.location,
                    employmentType: job.job_type?.replace("_", " "),
                    experience: job.experience_level,
                    featured: job.is_featured,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

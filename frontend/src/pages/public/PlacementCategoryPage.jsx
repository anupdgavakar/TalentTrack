import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Briefcase } from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import JobCard from "../../components/cards/JobCard";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Alert from "../../components/ui/Alert";
import Pagination from "../../components/ui/Pagination";
import useFetch from "../../hooks/useFetch";
import useSeo from "../../hooks/useSeo";

export default function PlacementCategoryPage() {
  const { categorySlug } = useParams();
  const [page, setPage] = useState(1);

  // Category name for the header comes from the categories list — cheap
  // enough to fetch and filter client-side rather than adding a
  // GET /api/categories/{slug} endpoint just for a page title.
  const { data: categories } = useFetch("/categories?type=job");
  const category = categories?.find((c) => c.slug === categorySlug);

  useSeo({
    title: category ? `${category.name} Jobs` : "Jobs",
    description: `Open ${category?.name || ""} roles with Talent Track Technologies' placement team, updated as new openings are confirmed.`,
  });

  const jobsPath = useMemo(
    () => `/job-postings?listing_type=placement&category=${categorySlug}&page=${page}&per_page=9`,
    [categorySlug, page]
  );
  const { data, loading, error } = useFetch(jobsPath);
  const jobs = data?.items || [];
  const meta = data?.meta;

  return (
    <>
      <header className="page-header">
        <div className="container">
          <Breadcrumb
            items={[
              { label: "Home", to: "/" },
              { label: "Placement", to: "/placement" },
              { label: category?.name || "Category" },
            ]}
          />
          <h1>{category ? `${category.name} Jobs` : "Jobs"}</h1>
          <p>Open roles in this category, updated as our placement team confirms new openings.</p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          {loading && <Loader center label="Loading openings…" />}
          {error && <Alert variant="error">{error}</Alert>}

          {!loading && !error && jobs.length === 0 && (
            <EmptyState
              icon={Briefcase}
              title="No open roles in this category right now"
              description="Check back soon, or browse other categories on the Placement page."
            />
          )}

          {!loading && !error && jobs.length > 0 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {jobs.map((job) => (
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

              {meta && meta.last_page > 1 && (
                <div style={{ marginTop: "var(--space-10)" }}>
                  <Pagination currentPage={meta.current_page} totalPages={meta.last_page} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

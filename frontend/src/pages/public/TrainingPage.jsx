import { useState, useMemo } from "react";
import { GraduationCap } from "lucide-react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Select from "../../components/ui/Select";
import FormInput from "../../components/ui/FormInput";
import CourseCard from "../../components/cards/CourseCard";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Alert from "../../components/ui/Alert";
import Pagination from "../../components/ui/Pagination";
import useFetch from "../../hooks/useFetch";
import useSeo from "../../hooks/useSeo";

export default function TrainingPage() {
  useSeo({
    title: "Training Programs",
    description: "Job-ready, hands-on training courses across in-demand technical and professional skills.",
  });

  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: categories } = useFetch("/categories?type=course");

  const coursesPath = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), per_page: "9" });
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    return `/courses?${params.toString()}`;
  }, [category, search, page]);

  const { data, loading, error } = useFetch(coursesPath);
  const courses = data?.items || [];
  const meta = data?.meta;

  return (
    <>
      <header className="page-header">
        <div className="container">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Training" }]} />
          <h1>Training Programs</h1>
          <p>
            Industry-oriented technical and professional courses — certification programs to
            corporate training — built around what employers are actually hiring for.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="filter-bar">
            <FormInput
              id="course-search"
              label="Search"
              className="field--search"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
            <Select
              id="course-category"
              label="Category"
              placeholder="All categories"
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
              options={(categories || []).map((c) => ({ value: c.slug, label: c.name }))}
            />
          </div>

          {loading && <Loader center label="Loading courses…" />}

          {error && <Alert variant="error">{error}</Alert>}

          {!loading && !error && courses.length === 0 && (
            <EmptyState
              icon={GraduationCap}
              title="No courses match your filters"
              description="Try a different category or search term."
            />
          )}

          {!loading && !error && courses.length > 0 && (
            <>
              <div className="card-grid">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={{
                      title: course.title,
                      category: course.category?.name,
                      shortDescription: course.short_description,
                      duration: course.duration,
                      mode: course.mode,
                      slug: course.slug,
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

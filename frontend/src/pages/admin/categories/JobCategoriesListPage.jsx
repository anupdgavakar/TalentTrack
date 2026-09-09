import CategoryManager from "../../../components/admin/CategoryManager";

/** Job categories (type=job) — Phase 7. See components/admin/CategoryManager.jsx. */
export default function JobCategoriesListPage() {
  return (
    <CategoryManager
      type="job"
      heading="Job Categories"
      description="Used to group job postings on the public Placement page."
      listingLabel="job postings"
      listingCachePrefix="/admin/job-postings"
    />
  );
}

import CategoryManager from "../../../components/admin/CategoryManager";

/** Training categories (type=course) — Phase 6. See components/admin/CategoryManager.jsx. */
export default function CategoriesListPage() {
  return (
    <CategoryManager
      type="course"
      heading="Training Categories"
      description="Used to group courses on the public Training page."
      listingLabel="courses"
      listingCachePrefix="/admin/courses"
    />
  );
}

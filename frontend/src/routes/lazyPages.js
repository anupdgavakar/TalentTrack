import { lazy } from "react";

// Once a page has been reloaded to recover from one stale-chunk failure,
// clear the flag as soon as any lazy import succeeds — so this can still
// protect against a *future* deploy's stale chunk later in the same
// session, rather than only ever firing once per tab forever.
const RELOAD_FLAG = "chunk-reload-attempted";

/**
 * Wraps a dynamic import() so a stale-chunk failure — "Failed to fetch
 * dynamically imported module: .../AboutPage-<hash>.js" — triggers one
 * automatic full-page reload instead of surfacing React Router's default
 * "Unexpected Application Error" crash screen.
 *
 * This happens to anyone who has the site open (or was open recently
 * enough that the tab hasn't been refreshed) across a deploy: the page's
 * JS still references the OLD build's content-hashed chunk filenames,
 * which the new deploy has already replaced on the server, so any
 * lazy-loaded route they navigate to client-side 404s trying to fetch a
 * chunk that no longer exists. A plain reload fetches the current
 * index.html (and therefore the current hashes) and fixes it — this does
 * that automatically, once, rather than making a visitor who happens to
 * have an old tab open see a broken-looking error page and have to figure
 * out to refresh it themselves.
 *
 * The sessionStorage flag stops this from reload-looping if the failure
 * has some other cause (offline, a genuinely broken deploy): a second
 * failure without a successful import in between just throws normally,
 * which is what falls back to the router's default error screen.
 */
function lazyWithReload(importer) {
  return lazy(() =>
    importer()
      .then((mod) => {
        sessionStorage.removeItem(RELOAD_FLAG);
        return mod;
      })
      .catch((error) => {
        const isChunkLoadError = /failed to fetch dynamically imported module|importing a module script failed/i.test(
          error?.message || ""
        );
        if (isChunkLoadError && sessionStorage.getItem(RELOAD_FLAG) !== "1") {
          sessionStorage.setItem(RELOAD_FLAG, "1");
          window.location.reload();
          // The reload is about to navigate away — never resolve or
          // reject, so React doesn't also render an error state for the
          // instant before that happens.
          return new Promise(() => {});
        }
        throw error;
      })
  );
}

/**
 * Every route-based code-split page (Phase 12), gathered in one file that
 * exports nothing but lazy components. Needed because oxlint's
 * `react-refresh/only-export-components` rule flags a file that mixes
 * component-like bindings with non-component exports (AppRoutes.jsx also
 * exports the router config) — its own suggested fix is exactly this:
 * move the components to a separate file. Splitting it out this way also
 * keeps AppRoutes.jsx's route table readable instead of burying 28 lazy()
 * calls above it.
 *
 * HomePage is deliberately NOT here — see AppRoutes.jsx's comment on why
 * it stays a normal, eager import.
 */
export const AboutPage = lazyWithReload(() => import("../pages/public/AboutPage"));
export const TrainingPage = lazyWithReload(() => import("../pages/public/TrainingPage"));
export const CourseDetailPage = lazyWithReload(() => import("../pages/public/CourseDetailPage"));
export const PlacementPage = lazyWithReload(() => import("../pages/public/PlacementPage"));
export const PlacementCategoryPage = lazyWithReload(() => import("../pages/public/PlacementCategoryPage"));
export const JobDetailPage = lazyWithReload(() => import("../pages/public/JobDetailPage"));
export const RecruitmentPage = lazyWithReload(() => import("../pages/public/RecruitmentPage"));
export const ConsultingPage = lazyWithReload(() => import("../pages/public/ConsultingPage"));
export const ContactPage = lazyWithReload(() => import("../pages/public/ContactPage"));
export const PrivacyPolicyPage = lazyWithReload(() => import("../pages/public/PrivacyPolicyPage"));
export const TermsPage = lazyWithReload(() => import("../pages/public/TermsPage"));
export const NotFoundPage = lazyWithReload(() => import("../pages/public/NotFoundPage"));

export const CandidateLoginPage = lazyWithReload(() => import("../pages/candidate/LoginPage"));
export const CandidateRegisterPage = lazyWithReload(() => import("../pages/candidate/RegisterPage"));
export const CandidateDashboardPage = lazyWithReload(() => import("../pages/candidate/DashboardPage"));

export const AdminLoginPage = lazyWithReload(() => import("../pages/admin/LoginPage"));
export const AdminDashboardPage = lazyWithReload(() => import("../pages/admin/DashboardPage"));
export const CoursesListPage = lazyWithReload(() => import("../pages/admin/courses/CoursesListPage"));
export const CourseFormPage = lazyWithReload(() => import("../pages/admin/courses/CourseFormPage"));
export const CategoriesListPage = lazyWithReload(() => import("../pages/admin/categories/CategoriesListPage"));
export const JobCategoriesListPage = lazyWithReload(() => import("../pages/admin/categories/JobCategoriesListPage"));
export const EnrollmentsListPage = lazyWithReload(() => import("../pages/admin/enrollments/EnrollmentsListPage"));
export const JobPostingsListPage = lazyWithReload(() => import("../pages/admin/jobs/JobPostingsListPage"));
export const JobPostingFormPage = lazyWithReload(() => import("../pages/admin/jobs/JobPostingFormPage"));
export const JobApplicationsListPage = lazyWithReload(() => import("../pages/admin/applications/JobApplicationsListPage"));
export const BannersListPage = lazyWithReload(() => import("../pages/admin/banners/BannersListPage"));
export const BannerFormPage = lazyWithReload(() => import("../pages/admin/banners/BannerFormPage"));
export const TestimonialsListPage = lazyWithReload(() => import("../pages/admin/testimonials/TestimonialsListPage"));
export const TestimonialFormPage = lazyWithReload(() => import("../pages/admin/testimonials/TestimonialFormPage"));
export const StatisticsListPage = lazyWithReload(() => import("../pages/admin/statistics/StatisticsListPage"));
export const AboutContentPage = lazyWithReload(() => import("../pages/admin/content/AboutContentPage"));
export const ContactContentPage = lazyWithReload(() => import("../pages/admin/content/ContactContentPage"));
export const SettingsPage = lazyWithReload(() => import("../pages/admin/settings/SettingsPage"));
export const LeadsListPage = lazyWithReload(() => import("../pages/admin/leads/LeadsListPage"));
export const ReportsPage = lazyWithReload(() => import("../pages/admin/reports/ReportsPage"));

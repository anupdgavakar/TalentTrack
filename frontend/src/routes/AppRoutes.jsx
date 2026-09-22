import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import Loader from "../components/ui/Loader";

// HomePage is the one page kept as a normal (non-lazy) import — it's the
// most common landing page, so it should render with the very first JS
// chunk rather than waiting on a second request + Suspense flash. Every
// other route below is lazy (Phase 12, see ./lazyPages.js): before this, a
// first-time visitor browsing the public site downloaded the entire admin
// section's code (every CRUD list/form page across Courses, Jobs, Leads,
// Reports, Settings...) as part of the same bundle, even though an
// anonymous visitor can never reach any of it. React.lazy + route-based
// code splitting means each page (and each admin module) only downloads
// when its route is actually visited.
import HomePage from "../pages/public/HomePage";
import {
  AboutPage,
  TrainingPage,
  CourseDetailPage,
  PlacementPage,
  PlacementCategoryPage,
  JobDetailPage,
  RecruitmentPage,
  ConsultingPage,
  ContactPage,
  PrivacyPolicyPage,
  TermsPage,
  NotFoundPage,
  CandidateLoginPage,
  CandidateRegisterPage,
  CandidateDashboardPage,
  AdminLoginPage,
  AdminDashboardPage,
  CoursesListPage,
  CourseFormPage,
  CategoriesListPage,
  JobCategoriesListPage,
  EnrollmentsListPage,
  JobPostingsListPage,
  JobPostingFormPage,
  JobApplicationsListPage,
  BannersListPage,
  BannerFormPage,
  TestimonialsListPage,
  TestimonialFormPage,
  StatisticsListPage,
  AboutContentPage,
  ContactContentPage,
  TrainingContentPage,
  PlacementContentPage,
  RecruitmentContentPage,
  ConsultingContentPage,
  SiteBrandingPage,
  SettingsPage,
  LeadsListPage,
  ReportsPage,
} from "./lazyPages";

// Central route table. New public pages plug into the `PublicLayout` branch;
// the candidate account area (/login, /register, /dashboard — Phase 8) lives
// in that same branch since it keeps the site header/footer, guarded by
// `ProtectedRoute` with no `requireAdmin`; new admin modules plug into the
// `AdminLayout` branch, guarded by the same `ProtectedRoute` with
// `requireAdmin` (see routes/ProtectedRoute.jsx). Phase 9 adds more
// nav/screens to the admin branch rather than replacing it.
//
// Every lazy page above renders inside a `<Suspense>` boundary — one shared
// boundary wrapping `<Outlet />` in `PublicLayout`/`AdminLayout` for
// everything nested under those layouts (Phase 12), so individual routes
// below don't each need their own. `/admin/login` sits outside both layouts
// (no sidebar/header to show while it loads), so it gets its own small
// Suspense wrapper instead.
const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/training", element: <TrainingPage /> },
      { path: "/training/:slug", element: <CourseDetailPage /> },
      { path: "/placement", element: <PlacementPage /> },
      { path: "/placement/:categorySlug", element: <PlacementCategoryPage /> },
      { path: "/jobs/:slug", element: <JobDetailPage /> },
      { path: "/recruitment", element: <RecruitmentPage /> },
      { path: "/consulting", element: <ConsultingPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
      { path: "/terms", element: <TermsPage /> },
      { path: "/login", element: <CandidateLoginPage /> },
      { path: "/register", element: <CandidateRegisterPage /> },
      {
        // Candidate account area (Phase 8) — logged-in-only, but stays
        // inside PublicLayout (site header/footer) since it's still part
        // of the public site, unlike the separate /admin section.
        element: <ProtectedRoute redirectTo="/login" />,
        children: [{ path: "/dashboard", element: <CandidateDashboardPage /> }],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/admin/login",
    element: (
      <Suspense fallback={<Loader center label="Loading…" />}>
        <AdminLoginPage />
      </Suspense>
    ),
  },
  {
    path: "/admin",
    element: <ProtectedRoute requireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboardPage /> },
          { path: "courses", element: <CoursesListPage /> },
          { path: "courses/new", element: <CourseFormPage /> },
          { path: "courses/:id/edit", element: <CourseFormPage /> },
          { path: "categories", element: <CategoriesListPage /> },
          { path: "enrollments", element: <EnrollmentsListPage /> },
          { path: "jobs", element: <JobPostingsListPage /> },
          { path: "jobs/new", element: <JobPostingFormPage /> },
          { path: "jobs/:id/edit", element: <JobPostingFormPage /> },
          { path: "job-categories", element: <JobCategoriesListPage /> },
          { path: "applications", element: <JobApplicationsListPage /> },
          { path: "banners", element: <BannersListPage /> },
          { path: "banners/new", element: <BannerFormPage /> },
          { path: "banners/:id/edit", element: <BannerFormPage /> },
          { path: "testimonials", element: <TestimonialsListPage /> },
          { path: "testimonials/new", element: <TestimonialFormPage /> },
          { path: "testimonials/:id/edit", element: <TestimonialFormPage /> },
          { path: "statistics", element: <StatisticsListPage /> },
          { path: "content/about", element: <AboutContentPage /> },
          { path: "content/contact", element: <ContactContentPage /> },
          { path: "content/training", element: <TrainingContentPage /> },
          { path: "content/placement", element: <PlacementContentPage /> },
          { path: "content/recruitment", element: <RecruitmentContentPage /> },
          { path: "content/consulting", element: <ConsultingContentPage /> },
          { path: "content/branding", element: <SiteBrandingPage /> },
          { path: "settings", element: <SettingsPage /> },
          { path: "leads", element: <LeadsListPage /> },
          { path: "reports", element: <ReportsPage /> },
        ],
      },
    ],
  },
]);

export default router;

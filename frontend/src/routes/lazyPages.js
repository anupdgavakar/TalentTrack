import { lazy } from "react";

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
export const AboutPage = lazy(() => import("../pages/public/AboutPage"));
export const TrainingPage = lazy(() => import("../pages/public/TrainingPage"));
export const CourseDetailPage = lazy(() => import("../pages/public/CourseDetailPage"));
export const PlacementPage = lazy(() => import("../pages/public/PlacementPage"));
export const PlacementCategoryPage = lazy(() => import("../pages/public/PlacementCategoryPage"));
export const JobDetailPage = lazy(() => import("../pages/public/JobDetailPage"));
export const RecruitmentPage = lazy(() => import("../pages/public/RecruitmentPage"));
export const ConsultingPage = lazy(() => import("../pages/public/ConsultingPage"));
export const ContactPage = lazy(() => import("../pages/public/ContactPage"));
export const PrivacyPolicyPage = lazy(() => import("../pages/public/PrivacyPolicyPage"));
export const TermsPage = lazy(() => import("../pages/public/TermsPage"));
export const NotFoundPage = lazy(() => import("../pages/public/NotFoundPage"));

export const CandidateLoginPage = lazy(() => import("../pages/candidate/LoginPage"));
export const CandidateRegisterPage = lazy(() => import("../pages/candidate/RegisterPage"));
export const CandidateDashboardPage = lazy(() => import("../pages/candidate/DashboardPage"));

export const AdminLoginPage = lazy(() => import("../pages/admin/LoginPage"));
export const AdminDashboardPage = lazy(() => import("../pages/admin/DashboardPage"));
export const CoursesListPage = lazy(() => import("../pages/admin/courses/CoursesListPage"));
export const CourseFormPage = lazy(() => import("../pages/admin/courses/CourseFormPage"));
export const CategoriesListPage = lazy(() => import("../pages/admin/categories/CategoriesListPage"));
export const JobCategoriesListPage = lazy(() => import("../pages/admin/categories/JobCategoriesListPage"));
export const EnrollmentsListPage = lazy(() => import("../pages/admin/enrollments/EnrollmentsListPage"));
export const JobPostingsListPage = lazy(() => import("../pages/admin/jobs/JobPostingsListPage"));
export const JobPostingFormPage = lazy(() => import("../pages/admin/jobs/JobPostingFormPage"));
export const JobApplicationsListPage = lazy(() => import("../pages/admin/applications/JobApplicationsListPage"));
export const BannersListPage = lazy(() => import("../pages/admin/banners/BannersListPage"));
export const BannerFormPage = lazy(() => import("../pages/admin/banners/BannerFormPage"));
export const TestimonialsListPage = lazy(() => import("../pages/admin/testimonials/TestimonialsListPage"));
export const TestimonialFormPage = lazy(() => import("../pages/admin/testimonials/TestimonialFormPage"));
export const StatisticsListPage = lazy(() => import("../pages/admin/statistics/StatisticsListPage"));
export const AboutContentPage = lazy(() => import("../pages/admin/content/AboutContentPage"));
export const ContactContentPage = lazy(() => import("../pages/admin/content/ContactContentPage"));
export const SettingsPage = lazy(() => import("../pages/admin/settings/SettingsPage"));
export const LeadsListPage = lazy(() => import("../pages/admin/leads/LeadsListPage"));
export const ReportsPage = lazy(() => import("../pages/admin/reports/ReportsPage"));

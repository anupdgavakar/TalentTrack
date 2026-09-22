import { Suspense, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Tags,
  ClipboardList,
  Briefcase,
  FolderKanban,
  ClipboardCheck,
  Image,
  ImagePlus,
  Quote,
  BarChart3,
  FileEdit,
  Settings,
  Inbox,
  FileBarChart,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/ui/Loader";
import logoMark from "../assets/logo-mark.png";

// Nav grows as later phases add domains — Training (Phase 6), Placement/
// Recruitment (Phase 7), Site Content/Settings (Phase 9) and Leads/Reports
// (Phase 10) screens are all here now.
const NAV_LINKS = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard, end: true },
  { label: "Courses", to: "/admin/courses", icon: GraduationCap },
  { label: "Categories", to: "/admin/categories", icon: Tags },
  { label: "Enrollments", to: "/admin/enrollments", icon: ClipboardList },
  { label: "Job Postings", to: "/admin/jobs", icon: Briefcase },
  { label: "Job Categories", to: "/admin/job-categories", icon: FolderKanban },
  { label: "Applications", to: "/admin/applications", icon: ClipboardCheck },
  { label: "Leads", to: "/admin/leads", icon: Inbox },
  { label: "Banners", to: "/admin/banners", icon: Image },
  { label: "Testimonials", to: "/admin/testimonials", icon: Quote },
  { label: "Statistics", to: "/admin/statistics", icon: BarChart3 },
  { label: "About Content", to: "/admin/content/about", icon: FileEdit },
  { label: "Contact Content", to: "/admin/content/contact", icon: FileEdit },
  { label: "Training Content", to: "/admin/content/training", icon: FileEdit },
  { label: "Placement Content", to: "/admin/content/placement", icon: FileEdit },
  { label: "Recruitment Content", to: "/admin/content/recruitment", icon: FileEdit },
  { label: "Consulting Content", to: "/admin/content/consulting", icon: FileEdit },
  { label: "Site Branding", to: "/admin/content/branding", icon: ImagePlus },
  { label: "Settings", to: "/admin/settings", icon: Settings },
  { label: "Reports", to: "/admin/reports", icon: FileBarChart },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const linkClass = ({ isActive }) => `admin-sidebar__link${isActive ? " is-active" : ""}`;

  return (
    <div className="admin-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <aside className={`admin-sidebar${mobileOpen ? " is-open" : ""}`}>
        <div className="admin-sidebar__brand">
          <img src={logoMark} alt="" aria-hidden="true" />
          <span>Talent Track Admin</span>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin">
          {NAV_LINKS.map(({ label, to, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} onClick={() => setMobileOpen(false)}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <a href="/" target="_blank" rel="noreferrer" className="admin-sidebar__link">
            <ExternalLink size={18} aria-hidden="true" />
            View site
          </a>
          <button type="button" className="admin-sidebar__link admin-sidebar__logout" onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="admin-sidebar__overlay" onClick={() => setMobileOpen(false)} />}

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-topbar__toggle"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="admin-topbar__spacer" />
          <div className="admin-topbar__user">
            <span className="admin-topbar__user-name">{user?.name}</span>
            <span className="admin-topbar__user-role">Administrator</span>
          </div>
        </header>

        <main id="main-content" className="admin-page" tabIndex={-1}>
          <Suspense fallback={<Loader center label="Loading…" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

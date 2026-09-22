import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { findSection } from "../../utils/pageSectionKeys";
import defaultLogo from "../../assets/logo.png";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Training", to: "/training" },
  { label: "Placement", to: "/placement" },
  { label: "Recruitment", to: "/recruitment" },
  { label: "Consulting", to: "/consulting" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  // Admin-uploaded logo (Site Branding) — falls back to the bundled
  // default until one's set. See SiteBrandingPage.jsx.
  const { data: siteSections } = useFetch("/page-sections?page=site");
  const logo = findSection(siteSections, "logo")?.image || defaultLogo;

  const accountLink = isAdmin ? "/admin/dashboard" : "/dashboard";

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate("/", { replace: true });
  };

  // Close the mobile panel automatically if the viewport is resized back
  // up to desktop width (e.g. rotating a tablet).
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const linkClass = ({ isActive }) => `site-header__link${isActive ? " is-active" : ""}`;

  return (
    <header className="site-header">
      <div className="container site-header__bar">
        <NavLink to="/" className="site-header__logo" aria-label="Talent Track Technologies — home">
          <img src={logo} alt="Talent Track Technologies" />
        </NavLink>

        <nav className="site-header__nav" aria-label="Primary">
          <div className="site-header__links">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === "/"} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="site-header__actions">
            {isAuthenticated ? (
              <div className="site-header__account">
                <NavLink to={accountLink} className="site-header__account-link">
                  <User size={16} aria-hidden="true" />
                  {user?.name ? user.name.split(" ")[0] : "My Account"}
                </NavLink>
                <button type="button" className="site-header__account-logout" onClick={handleLogout}>
                  <LogOut size={16} aria-hidden="true" />
                  <span className="sr-only">Log out</span>
                </button>
              </div>
            ) : (
              <Button to="/login" size="sm" variant="outline">
                Log In
              </Button>
            )}
            <Button to="/contact" size="sm" variant="accent">
              Enquire Now
            </Button>
            <button
              type="button"
              className="site-header__toggle"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </nav>
      </div>

      <div id="mobile-nav-panel" className="site-header__mobile-panel" hidden={!mobileOpen}>
        <div className="container">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <NavLink to={accountLink} className={linkClass} onClick={() => setMobileOpen(false)}>
                {user?.name ? `Hi, ${user.name.split(" ")[0]}` : "My Account"}
              </NavLink>
              <Button block variant="outline" icon={LogOut} iconPosition="left" onClick={handleLogout}>
                Log Out
              </Button>
            </>
          ) : (
            <Button to="/login" block variant="outline" onClick={() => setMobileOpen(false)}>
              Log In
            </Button>
          )}
          <Button to="/contact" block variant="accent" onClick={() => setMobileOpen(false)}>
            Enquire Now
          </Button>
        </div>
      </div>
    </header>
  );
}

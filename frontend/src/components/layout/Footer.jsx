import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "../ui/SocialIcons";
import logo from "../../assets/logo.png";
import useFetch from "../../hooks/useFetch";
import { FALLBACK_SETTINGS } from "../../utils/siteSettings";

const SERVICE_LINKS = [
  { label: "Training", to: "/training" },
  { label: "Placement", to: "/placement" },
  { label: "Recruitment", to: "/recruitment" },
  { label: "Consulting", to: "/consulting" },
];

const COMPANY_LINKS = [
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const { data } = useFetch("/settings/public");
  const settings = { ...FALLBACK_SETTINGS, ...data };

  const socialLinks = [
    { label: "Facebook", href: settings.social_facebook_url, icon: FacebookIcon },
    { label: "Instagram", href: settings.social_instagram_url, icon: InstagramIcon },
    { label: "LinkedIn", href: settings.social_linkedin_url, icon: LinkedinIcon },
    { label: "YouTube", href: settings.social_youtube_url, icon: YoutubeIcon },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link to="/" className="site-footer__logo" aria-label="Talent Track Technologies — home">
              <img src={logo} alt="Talent Track Technologies" loading="lazy" decoding="async" />
            </Link>
            <p>
              Training, placement, recruitment and career consulting — Talent
              Track Technologies helps you build skills, get trained and get
              placed.
            </p>
            <div className="site-footer__social">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} aria-label={label}>
                  <Icon size={17} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4>Services</h4>
            <ul className="site-footer__links">
              {SERVICE_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul className="site-footer__links">
              {COMPANY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Get in Touch</h4>
            <ul className="site-footer__contact">
              <li>
                <MapPin size={16} aria-hidden="true" />
                <span>{settings.footer_address}</span>
              </li>
              <li>
                <Phone size={16} aria-hidden="true" />
                <a href={`tel:${settings.footer_phone.replace(/\s+/g, "")}`}>{settings.footer_phone}</a>
              </li>
              <li>
                <Mail size={16} aria-hidden="true" />
                <a href={`mailto:${settings.footer_email}`}>{settings.footer_email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>&copy; {year} Talent Track Technologies. All rights reserved.</span>
          <div className="site-footer__bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

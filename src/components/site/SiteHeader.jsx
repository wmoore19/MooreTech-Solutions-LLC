import { useEffect, useState } from "react";
import { Github, Menu, MessageSquareText, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logoUrl from "@/assets/mooretech-logo.webp";
import { company, navigation } from "@/siteData";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="shell nav-shell">
        <Link className="brand" to="/" aria-label="MooreTech Solutions home">
          <img src={logoUrl} alt="MooreTech Solutions LLC" />
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="desktop-actions">
          <a
            className="icon-link"
            href={company.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="MooreTech Solutions on GitHub"
            data-track-event="company_github_clicked"
            data-track-placement="header"
            data-track-destination="github"
          >
            <Github size={19} />
          </a>
          <a
            className="button button-small"
            href={company.smsHref}
            data-track-event="company_text_clicked"
            data-track-placement="header"
            data-track-destination="sms"
          >
            <MessageSquareText size={17} />
            Text us
          </a>
        </div>

        <button
          className="menu-button"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="mobile-nav-wrap">
          <nav className="shell mobile-nav" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <NavLink
                className={({ isActive }) => (isActive ? "mobile-link active" : "mobile-link")}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
            <a
              href={company.githubUrl}
              target="_blank"
              rel="noreferrer"
              data-track-event="company_github_clicked"
              data-track-placement="mobile_nav"
              data-track-destination="github"
            >
              GitHub
            </a>
            <a
              className="button"
              href={company.smsHref}
              data-track-event="company_text_clicked"
              data-track-placement="mobile_nav"
              data-track-destination="sms"
            >
              Text {company.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

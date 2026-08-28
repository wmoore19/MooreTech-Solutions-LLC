import { Github, Mail, MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";
import logoUrl from "@/assets/mooretech-logo.webp";
import { businessLaunch, company, ironline, ironlineBudget } from "@/siteData";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-system" aria-hidden="true">
        <span>MooreTech systems online</span>
        <span>Ironline Office / Budget / Launch</span>
      </div>
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Link to="/" aria-label="MooreTech Solutions home">
            <img src={logoUrl} alt="MooreTech Solutions LLC" />
          </Link>
          <p>
            The company behind Ironline Office, Ironline Budget, Ironline Launch,
            and carefully scoped custom systems.
          </p>
          <span className="footer-location">
            Established {company.founded} · {company.location} · {company.serviceArea}
          </span>
        </div>

        <div>
          <h2>Explore</h2>
          <a href={ironline.url} target="_blank" rel="noreferrer">Ironline Office</a>
          <a href={ironlineBudget.url} target="_blank" rel="noreferrer">Ironline Budget</a>
          <a href={businessLaunch.externalUrl} target="_blank" rel="noreferrer">Ironline Launch</a>
          <Link to="/custom-builds">Custom builds</Link>
          <Link to="/about">About MooreTech</Link>
          <Link to="/careers">Careers</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div>
          <h2>Contact</h2>
          <a
            href={company.smsHref}
            data-track-event="company_text_clicked"
            data-track-placement="footer"
            data-track-destination="sms"
          >
            <MessageSquareText size={16} />
            Text {company.phoneDisplay}
          </a>
          <a
            href={"mailto:" + company.email}
            data-track-event="company_email_clicked"
            data-track-placement="footer"
            data-track-destination="email"
          >
            <Mail size={16} />
            {company.email}
          </a>
          <a
            href={company.githubUrl}
            target="_blank"
            rel="noreferrer"
            data-track-event="company_github_clicked"
            data-track-placement="footer"
            data-track-destination="github"
          >
            <Github size={16} />
            GitHub repository
          </a>
          <span className="footer-response">{company.responseTime}.</span>
        </div>
      </div>

      <div className="shell footer-bottom">
        <p>© 2026 MooreTech Solutions LLC. All rights reserved.</p>
        <div>
          <Link to="/security">Security</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

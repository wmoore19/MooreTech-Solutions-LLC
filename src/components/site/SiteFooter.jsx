import { Github, Mail, MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";
import logoUrl from "@/assets/mooretech-logo.webp";
import { company } from "@/siteData";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Link to="/" aria-label="MooreTech Solutions home">
            <img src={logoUrl} alt="MooreTech Solutions LLC" />
          </Link>
          <p>
            Practical software products and thoughtfully scoped custom systems for
            real-world operations.
          </p>
          <span className="footer-location">
            Established {company.founded} · {company.location}
          </span>
        </div>

        <div>
          <h2>Explore</h2>
          <Link to="/products">Ironline Office</Link>
          <Link to="/custom-builds">Custom builds</Link>
          <Link to="/about">About MooreTech</Link>
          <Link to="/careers">Careers</Link>
        </div>

        <div>
          <h2>Contact</h2>
          <a href={company.smsHref}>
            <MessageSquareText size={16} />
            Text {company.phoneDisplay}
          </a>
          <a href={"mailto:" + company.email}>
            <Mail size={16} />
            {company.email}
          </a>
          <a href={company.githubUrl} target="_blank" rel="noreferrer">
            <Github size={16} />
            GitHub repository
          </a>
        </div>
      </div>

      <div className="shell footer-bottom">
        <p>© 2026 MooreTech Solutions LLC. All rights reserved.</p>
        <div>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

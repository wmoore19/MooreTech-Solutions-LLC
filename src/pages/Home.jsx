import {
  ArrowRight,
  Check,
  ExternalLink,
  Layers3,
  MessageSquareText,
  MoveRight,
  Puzzle,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import logoUrl from "@/assets/mooretech-logo.webp";
import { company, customBuildEmail, ironline } from "@/siteData";

const principles = [
  {
    icon: Check,
    title: "Useful before impressive",
    text: "We begin with the work that needs to get done, then choose the simplest technology that fits.",
  },
  {
    icon: Layers3,
    title: "Built to grow deliberately",
    text: "Products and custom systems are structured so improvements can be added without needless complexity.",
  },
  {
    icon: Puzzle,
    title: "Connected where it matters",
    text: "We look for practical opportunities to reduce duplicate entry and keep information moving.",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="shell hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">Software for real operations</span>
            <h1>Practical technology, built around how work actually gets done.</h1>
            <p>
              MooreTech Solutions LLC builds straightforward software products and
              carefully scoped custom systems for owner-led teams.
            </p>
            <div className="hero-actions">
              <Link
                className="button"
                to="/products"
                data-track-event="company_product_clicked"
                data-track-placement="home_hero"
                data-track-destination="products"
              >
                Explore Ironline Office
                <ArrowRight size={18} />
              </Link>
              <Link
                className="button button-secondary"
                to="/custom-builds"
                data-track-event="custom_build_clicked"
                data-track-placement="home_hero"
                data-track-destination="custom_builds"
              >
                Request a custom build
              </Link>
            </div>
            <div className="hero-meta" aria-label="Company details">
              <span>Established 2026</span>
              <span>{company.location}</span>
              <span>Text-first contact available</span>
            </div>
          </div>

          <div className="brand-panel">
            <div className="brand-panel-status" aria-hidden="true">
              <span>MT // operations matrix</span>
              <span>Online</span>
            </div>
            <div className="brand-panel-glow" aria-hidden="true" />
            <img src={logoUrl} alt="MooreTech Solutions LLC" />
            <div className="brand-panel-list">
              <div>
                <span>01</span>
                <p>Software products</p>
              </div>
              <div>
                <span>02</span>
                <p>Custom operational tools</p>
              </div>
              <div>
                <span>03</span>
                <p>Integrations and automation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow">{ironline.eyebrow}</span>
              <h2>One clear workflow for service work.</h2>
            </div>
            <p>
              Ironline Office is designed to help owner-led service teams organize
              everyday work without taking on enterprise-level complexity.
            </p>
          </div>

          <article className="product-feature">
            <div className="product-copy">
              <div className="product-badge">Available now</div>
              <h3>{ironline.name}</h3>
              <p>{ironline.summary}</p>
              <div className="workflow" aria-label="Ironline Office core workflow">
                {ironline.workflow.map((step, index) => (
                  <div key={step}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{step}</strong>
                    {index < ironline.workflow.length - 1 && <MoveRight aria-hidden="true" />}
                  </div>
                ))}
              </div>
              <div className="inline-actions">
                <a
                  className="button"
                  href={ironline.url}
                  target="_blank"
                  rel="noreferrer"
                  data-track-event="ironline_website_clicked"
                  data-track-placement="home_product"
                  data-track-destination="ironline"
                >
                  Visit Ironline Office
                  <ExternalLink size={17} />
                </a>
                <Link
                  className="text-link"
                  to="/products"
                  data-track-event="company_product_clicked"
                  data-track-placement="home_product"
                  data-track-destination="products"
                >
                  Product overview <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            <div className="product-side">
              <span className="small-label">Designed around</span>
              <ul className="check-list">
                <li><Check /> Customers and requests</li>
                <li><Check /> Estimates and approvals</li>
                <li><Check /> Scheduling and field work</li>
                <li><Check /> Invoicing and payments</li>
                <li><Check /> Follow-up and visibility</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <div className="section-heading centered-heading">
            <span className="eyebrow">Selective custom work</span>
            <h2>When off-the-shelf software does not quite fit.</h2>
            <p>
              MooreTech accepts a limited number of custom build requests for
              focused operational problems with a clear business purpose.
            </p>
          </div>
          <div className="service-grid">
            <article>
              <Wrench />
              <h3>Internal tools</h3>
              <p>Simple dashboards, workflow tools, and operational systems built around a defined process.</p>
            </article>
            <article>
              <Layers3 />
              <h3>Portals and lightweight apps</h3>
              <p>Purpose-built experiences for customers, teams, or partners when a generic tool creates friction.</p>
            </article>
            <article>
              <Puzzle />
              <h3>Integrations and automation</h3>
              <p>Practical connections that reduce repeat entry, missed handoffs, and scattered information.</p>
            </article>
          </div>
          <div className="center-actions">
            <Link
              className="button"
              to="/custom-builds"
              data-track-event="custom_build_clicked"
              data-track-placement="home_custom_builds"
              data-track-destination="custom_builds"
            >
              See how custom requests work <ArrowRight size={18} />
            </Link>
            <a
              className="text-link"
              href={customBuildEmail}
              data-track-event="company_email_clicked"
              data-track-placement="home_custom_builds"
              data-track-destination="email"
            >
              Email a request
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <span className="eyebrow">How we think</span>
            <h2>Software should reduce work, not create another job.</h2>
          </div>
          <div className="principle-grid">
            {principles.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <div className="icon-box"><Icon /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-cta">
        <div className="shell cta-panel">
          <div>
            <span className="eyebrow">Start a conversation</span>
            <h2>Tell us what you are trying to improve.</h2>
            <p>
              Texting is encouraged. A short description of the problem is enough
              to start.
            </p>
          </div>
          <div className="cta-actions">
            <a
              className="button button-light"
              href={company.smsHref}
              data-track-event="company_text_clicked"
              data-track-placement="home_cta"
              data-track-destination="sms"
            >
              <MessageSquareText size={18} />
              Text {company.phoneDisplay}
            </a>
            <Link
              className="button button-outline-light"
              to="/contact"
              data-track-event="company_contact_clicked"
              data-track-placement="home_cta"
              data-track-destination="contact"
            >
              Other contact options
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

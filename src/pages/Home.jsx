import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ExternalLink,
  Layers3,
  MessageSquareText,
  Puzzle,
  Rocket,
  WalletCards,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import logoUrl from "@/assets/mooretech-logo.webp";
import { company, customBuildEmail, productPortfolio } from "@/siteData";

const productIcons = {
  office: BriefcaseBusiness,
  budget: WalletCards,
  launch: Rocket,
};

const principles = [
  {
    icon: Check,
    title: "Useful before impressive",
    text: "We begin with the work that needs to get done, then choose the simplest technology that fits.",
  },
  {
    icon: Layers3,
    title: "Built to grow deliberately",
    text: "Each product has a clear job, so improvements can be added without turning it into a bloated all-in-one.",
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
            <span className="eyebrow">The company behind Ironline</span>
            <h1>Practical software for work, money, and a new business.</h1>
            <p>
              MooreTech Solutions LLC builds focused products that make everyday
              operations easier to understand, run, and improve.
            </p>
            <div className="hero-actions">
              <Link
                className="button"
                to="/products"
                data-track-event="company_product_clicked"
                data-track-placement="home_hero"
                data-track-destination="products"
              >
                Explore all three products
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
              <span>{company.serviceArea}</span>
            </div>
          </div>

          <div className="brand-panel">
            <div className="brand-panel-status" aria-hidden="true">
              <span>MT // Ironline product network</span>
              <span>Online</span>
            </div>
            <div className="brand-panel-glow" aria-hidden="true" />
            <img src={logoUrl} alt="MooreTech Solutions LLC" />
            <div className="brand-panel-list">
              {productPortfolio.map((product) => (
                <div key={product.key}>
                  <span>{product.number}</span>
                  <p>{product.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section portfolio-section">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow">The Ironline product family</span>
              <h2>Three products. Three clear jobs.</h2>
            </div>
            <p>
              Each Ironline product solves a distinct problem with its own focused
              website, workflow, and next step.
            </p>
          </div>

          <div className="portfolio-grid">
            {productPortfolio.map((product) => {
              const Icon = productIcons[product.key];
              return (
                <article
                  className={"portfolio-card portfolio-" + product.key}
                  key={product.key}
                >
                  <div className="portfolio-card-head">
                    <div className="product-icon" aria-hidden="true">
                      <Icon />
                    </div>
                    <span className="product-status">{product.status}</span>
                  </div>
                  <span className="portfolio-kicker">
                    {product.number} / {product.category}
                  </span>
                  <h3>{product.name}</h3>
                  <p className="product-tagline">{product.tagline}</p>
                  <p className="product-summary">{product.summary}</p>
                  <ul className="portfolio-list">
                    {product.highlights.map((item) => (
                      <li key={item}>
                        <Check />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="portfolio-actions">
                    <a
                      className="text-link"
                      href={product.primaryUrl}
                      target="_blank"
                      rel="noreferrer"
                      data-track-event="ironline_product_clicked"
                      data-track-placement="home_portfolio"
                      data-track-destination={product.key}
                    >
                      {product.primaryLabel}
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="portfolio-note">
            <span>IRONLINE // A MOORETECH SOLUTIONS LLC PRODUCT FAMILY</span>
            <Link to="/products">
              Compare the products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <div className="section-heading">
            <span className="eyebrow">Selective custom work</span>
            <h2>When an off-the-shelf product does not fit.</h2>
            <p>
              MooreTech accepts a limited number of custom build requests for
              focused operational problems with a clear business purpose.
            </p>
          </div>
          <div className="service-grid">
            <article>
              <Wrench />
              <h3>Internal tools</h3>
              <p>Dashboards, workflow tools, and operational systems built around one defined process.</p>
            </article>
            <article>
              <Layers3 />
              <h3>Portals and focused apps</h3>
              <p>Purpose-built customer, team, or partner experiences where a generic tool creates friction.</p>
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
            <span className="eyebrow">How we build</span>
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

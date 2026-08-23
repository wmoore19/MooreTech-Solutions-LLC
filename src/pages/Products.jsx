import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "@/components/site/PageIntro";
import { ironline } from "@/siteData";

const fit = [
  "Owner-led service businesses",
  "Small teams coordinating office and field work",
  "Businesses moving from spreadsheets or disconnected tools",
  "Teams that value a guided, straightforward workflow",
];

export default function Products() {
  return (
    <>
      <PageIntro
        eyebrow="Products"
        title="Focused software for work that has to move."
        description="We are building the MooreTech product portfolio deliberately. Ironline Office is our first public product."
      />

      <section className="section">
        <div className="shell product-page-card">
          <div className="product-page-main">
            <span className="product-badge">Available now</span>
            <h2>{ironline.name}</h2>
            <p className="lead">{ironline.summary}</p>

            <div className="workflow workflow-large">
              {ironline.workflow.map((step, index) => (
                <div key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
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
                data-track-placement="products_primary"
                data-track-destination="ironline"
              >
                Explore Ironline Office <ExternalLink size={17} />
              </a>
              <Link
                className="text-link"
                to="/contact"
                data-track-event="company_contact_clicked"
                data-track-placement="products_primary"
                data-track-destination="contact"
              >
                Ask a question <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <aside className="fit-card">
            <span className="small-label">Designed with these teams in mind</span>
            <ul className="check-list">
              {fit.map((item) => (
                <li key={item}><Check /> {item}</li>
              ))}
            </ul>
            <p className="fit-note">
              Every business works differently. Visit Ironline Office for current
              features, pricing, and trial details before deciding whether it fits.
            </p>
          </aside>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell product-proof">
          <div className="product-proof-visual">
            <img src={ironline.socialImageUrl} alt="Ironline Office product preview" />
          </div>
          <div className="product-proof-copy">
            <span className="eyebrow">Built by MooreTech</span>
            <h2>A live product with its own focused home.</h2>
            <p>
              Ironline Office has a dedicated website for its current capabilities,
              pricing, account registration, support information, privacy policy,
              and terms. That keeps product decisions close to the product while
              MooreTech remains the clear company behind it.
            </p>
            <ul className="check-list">
              <li><Check /> One connected service-work workflow</li>
              <li><Check /> A public product website and registration path</li>
              <li><Check /> Product-specific support and policy information</li>
            </ul>
            <div className="inline-actions">
              <a
                className="button"
                href={ironline.url}
                target="_blank"
                rel="noreferrer"
                data-track-event="ironline_website_clicked"
                data-track-placement="products_proof"
                data-track-destination="ironline"
              >
                Visit ironlineoffice.com <ExternalLink size={17} />
              </a>
              <a
                className="text-link"
                href={ironline.trialUrl}
                target="_blank"
                rel="noreferrer"
                data-track-event="ironline_trial_clicked"
                data-track-placement="products_proof"
                data-track-destination="ironline_register"
              >
                View current trial sign-up <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell narrow-copy">
          <span className="eyebrow">A deliberate portfolio</span>
          <h2>We will add products when they solve a clear problem well.</h2>
          <p>
            MooreTech is not presenting a shelf of unfinished ideas. New products
            will appear here only when they are ready to be understood and used.
          </p>
        </div>
      </section>
    </>
  );
}

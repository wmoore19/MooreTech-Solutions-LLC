import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ExternalLink,
  Rocket,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageIntro from "@/components/site/PageIntro";
import { productPortfolio } from "@/siteData";

const productIcons = {
  office: BriefcaseBusiness,
  budget: WalletCards,
  launch: Rocket,
};

function SecondaryAction({ product }) {
  if (product.secondaryUrl.startsWith("/")) {
    return (
      <Link className="text-link" to={product.secondaryUrl}>
        {product.secondaryLabel} <ArrowRight size={16} />
      </Link>
    );
  }

  return (
    <a
      className="text-link"
      href={product.secondaryUrl}
      target="_blank"
      rel="noreferrer"
    >
      {product.secondaryLabel} <ExternalLink size={16} />
    </a>
  );
}

export default function Products() {
  return (
    <>
      <PageIntro
        eyebrow="Products"
        title="The Ironline product family."
        description="Focused products for running service work, planning money, and launching a straightforward Arkansas business—with MooreTech Solutions LLC clearly behind each one."
      />

      <section className="section products-portfolio">
        <div className="shell">
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
                  <h2>{product.name}</h2>
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
                      className="button"
                      href={product.primaryUrl}
                      target="_blank"
                      rel="noreferrer"
                      data-track-event="ironline_product_clicked"
                      data-track-placement="products_portfolio"
                      data-track-destination={product.key}
                    >
                      {product.primaryLabel}
                      <ExternalLink size={16} />
                    </a>
                    <SecondaryAction product={product} />
                  </div>
                </article>
              );
            })}
          </div>

          <div className="portfolio-note portfolio-note-large">
            <div>
              <span>ONE OWNER // THREE FOCUSED PRODUCTS</span>
              <p>
                MooreTech Solutions LLC owns and develops the Ironline product family.
                Product details, account paths, policies, and support live on each
                product's dedicated website.
              </p>
            </div>
            <Link className="button button-secondary" to="/contact">
              Ask MooreTech a question <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import {
  ArrowRight,
  BadgeDollarSign,
  Banknote,
  Check,
  ClipboardCheck,
  FileCheck2,
  Landmark,
  ReceiptText,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import InquiryForm from "@/components/site/InquiryForm";
import PageIntro from "@/components/site/PageIntro";
import { businessLaunch, company } from "@/siteData";
import "./business-launch.css";

const included = [
  {
    icon: ClipboardCheck,
    title: "Readiness and fit screen",
    text: "A plain-language intake to confirm the request fits this service: a straightforward, owner-managed Arkansas LLC.",
  },
  {
    icon: FileCheck2,
    title: "Arkansas filing guidance",
    text: "Administrative help checking name availability, organizing the owner’s information, and completing the state filing for the owner to review and approve.",
  },
  {
    icon: Landmark,
    title: "EIN and bank readiness",
    text: "A free IRS EIN walkthrough plus a clean checklist of formation records, identification, and ownership details commonly requested by business banks.",
  },
  {
    icon: ReceiptText,
    title: "Sales-tax setup, when applicable",
    text: "Help identifying the Arkansas registration path and organizing the information needed for ATAP. The owner remains responsible for tax decisions, rates, collection, and returns.",
  },
  {
    icon: Banknote,
    title: "Operating handoff",
    text: "A practical startup checklist for separating money, keeping receipts, saving approvals, tracking deadlines, and knowing what still needs professional advice.",
  },
  {
    icon: Check,
    title: "Ironline QuickStart",
    text: "An optional starter workspace in Ironline Office and one guided training session. Any ongoing software subscription is separate and disclosed before signup.",
  },
];

const steps = [
  {
    number: "01",
    title: "Fit check",
    text: "MooreTech reviews the proposed business, owner count, activity, and location. Out-of-scope or regulated matters are referred out before paid work begins.",
  },
  {
    number: "02",
    title: "Owner decisions",
    text: "The owner chooses the name, structure, registered agent, addresses, tax positions, and banking provider. MooreTech explains the administrative path without choosing for the owner.",
  },
  {
    number: "03",
    title: "Guided setup",
    text: "We organize the information and walk through the applicable government systems. The owner reviews and approves every filing before it is submitted.",
  },
  {
    number: "04",
    title: "Handoff and training",
    text: "The owner receives a launch checklist, document folder plan, deadline reminders to create, and an Ironline QuickStart session if selected.",
  },
];

const exclusions = [
  "Legal, tax, accounting, investment, or insurance advice",
  "Custom operating agreements, contracts, bylaws, or other legal documents",
  "Multi-member LLCs, corporations, nonprofit organizations, or foreign registrations",
  "Professional, regulated, licensed, or high-risk business formations",
  "Registered-agent service, address service, mail handling, or ongoing compliance monitoring",
  "Bookkeeping, payroll, tax-return preparation, sales-tax return filing, or audit representation",
  "Guarantees of approval, processing time, bank acceptance, tax treatment, or business results",
];

export default function BusinessLaunch() {
  return (
    <>
      <PageIntro
        eyebrow="Arkansas Business Launch"
        title="A guided start for a straightforward Arkansas LLC."
        description="MooreTech provides administrative and technology help for a first-time owner who wants a clear setup path, organized records, and a working business system—without pretending the paperwork is legal or tax advice."
      />

      <section className="section launch-overview">
        <div className="shell launch-overview-grid">
          <div>
            <span className="eyebrow">One clear package</span>
            <h2>Start organized for $200.</h2>
            <p className="lead">
              This fixed-fee service is designed for one-owner Arkansas LLCs with a
              straightforward business activity. MooreTech keeps the steps visible,
              helps with the administrative work, and leaves every owner decision
              with the client.
            </p>
            <div className="inline-actions">
              <a
                className="button"
                href="#request"
                data-track-event="business_launch_clicked"
                data-track-placement="business_launch_overview"
                data-track-destination="request"
              >
                Request a fit check <ArrowRight size={18} />
              </a>
              <Link
                className="text-link"
                to="/contact"
                data-track-event="company_contact_clicked"
                data-track-placement="business_launch_overview"
                data-track-destination="contact"
              >
                Ask a question
              </Link>
            </div>
          </div>

          <aside className="launch-price-card">
            <span className="small-label">MooreTech service fee</span>
            <div className="launch-price">
              <span>$</span>
              <strong>{businessLaunch.price}</strong>
            </div>
            <p>One time, for the included administrative and technology services.</p>
            <div className="launch-price-rule" />
            <p>
              <strong>Paid separately by the owner:</strong> Arkansas filing fees,
              sales-tax permit fees if applicable, city or industry licenses,
              registered-agent costs, banking costs, and any professional advice.
            </p>
            <p className="launch-price-note">
              Government and third-party charges can change and are never hidden
              inside the MooreTech service fee.
            </p>
          </aside>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow">What is included</span>
              <h2>Administrative help from intake through handoff.</h2>
            </div>
            <p>
              The package focuses on setup tasks that can be standardized, checked,
              and taught without replacing an Arkansas attorney, CPA, tax preparer,
              insurance professional, or licensed registered agent.
            </p>
          </div>

          <div className="launch-includes-grid">
            {included.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <div className="icon-box"><Icon /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <span className="eyebrow">How the work moves</span>
            <h2>Four milestones, with owner approval at every filing step.</h2>
          </div>

          <div className="launch-steps">
            {steps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell launch-boundary-grid">
          <div>
            <span className="eyebrow">Scope boundary</span>
            <h2>Good fit: simple, owner-led, and Arkansas-based.</h2>
            <p>
              A typical fit is one adult owner forming a standard Arkansas LLC for
              an ordinary, non-regulated business and willing to make and approve
              their own legal, tax, and banking decisions.
            </p>
            <ul className="check-list launch-fit-list">
              <li><Check /> One owner</li>
              <li><Check /> Arkansas domestic LLC</li>
              <li><Check /> Straightforward, non-regulated activity</li>
              <li><Check /> Owner can provide accurate information and valid ID</li>
              <li><Check /> Owner agrees to review every submission</li>
            </ul>
          </div>

          <aside className="launch-exclusions">
            <div className="launch-exclusion-heading">
              <ShieldAlert />
              <div>
                <span className="small-label">Not included</span>
                <h3>Matters that require a different professional or engagement</h3>
              </div>
            </div>
            <ul>
              {exclusions.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="shell launch-disclaimer">
          <BadgeDollarSign />
          <div>
            <span className="eyebrow">Important before you buy</span>
            <h2>This is administrative and technology assistance—not professional advice.</h2>
            <p>
              MooreTech Solutions LLC is not a law firm, CPA firm, tax preparer,
              registered agent, bank, insurer, or government agency. Purchasing this
              package does not create an attorney-client, accountant-client, or
              fiduciary relationship. Clients should consult qualified professionals
              when a decision depends on law, taxes, ownership rights, liability,
              licensing, insurance, or financial consequences.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-cta" id="request">
        <div className="shell launch-request-grid">
          <div className="launch-request-copy">
            <span className="eyebrow">Request a fit check</span>
            <h2>Tell us what you want to start.</h2>
            <p>
              The first review is only to confirm whether the fixed package fits.
              Sending this form does not create a paid engagement. MooreTech will
              provide the written scope and service agreement before work begins.
            </p>
            <p className="launch-contact-note">
              Prefer text? <a href={company.smsHref}>Text {company.phoneDisplay}</a>.
            </p>
          </div>
          <InquiryForm
            defaultType="business_launch"
            showType={false}
            title="Arkansas Business Launch request"
            description="Share the proposed business activity, owner count, Arkansas city or county, and whether you have already filed anything."
          />
        </div>
      </section>
    </>
  );
}

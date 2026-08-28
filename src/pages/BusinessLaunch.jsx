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
    text: "Administrative help checking Arkansas name availability and preparing a filing checklist. The client types, reviews, signs, attests, submits, and pays on the official state site.",
  },
  {
    icon: Landmark,
    title: "EIN and bank readiness",
    text: "A guided visit to the free official IRS EIN site plus a bank-readiness checklist. The client enters all SSN, responsible-party, identity, password, MFA, and bank information.",
  },
  {
    icon: ReceiptText,
    title: "Sales-tax setup, when applicable",
    text: "Help locating the Arkansas registration path and organizing a checklist for ATAP. The client chooses every tax answer and types, attests, submits, and pays on the official site.",
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
    text: "MooreTech points to official sites and explains the administrative sequence. The client types, reviews, signs, attests, submits, and pays every filing or registration.",
  },
  {
    number: "04",
    title: "Handoff and training",
    text: "The client receives a launch checklist, document-folder plan, deadlines to place on the client’s own calendar, and an Ironline QuickStart session if selected.",
  },
];

const responsibilityRows = [
  {
    topic: "Business choices",
    mooreTech: "Provide plain-language checklists, public links, and general descriptions of the available administrative paths.",
    client: "Choose the entity, legal name, registered agent, ownership, tax treatment, licenses, and every answer placed on a form.",
  },
  {
    topic: "Official filings",
    mooreTech: "Guide navigation on official sites and point out obvious missing fields or clerical mismatches in client-entered information.",
    client: "Type, review, sign, attest, submit, and pay for every filing, registration, permit, and government charge.",
  },
  {
    topic: "Sensitive access",
    mooreTech: "Use client-controlled sessions and avoid collecting sensitive credentials or identity information.",
    client: "Keep sole control of SSNs, passwords, MFA codes, banking logins, bank identity checks, and government-account credentials.",
  },
  {
    topic: "Ironline setup",
    mooreTech: "Configure and test Ironline with client-approved business data, then provide the included training.",
    client: "Approve the data, complete account-security steps, and decide how the business will use the system.",
  },
  {
    topic: "After launch",
    mooreTech: "Deliver a handoff checklist and identify known deadlines as reminders, not ongoing compliance monitoring.",
    client: "Handle ongoing taxes, sales-tax returns, licenses, Arkansas franchise tax, records, insurance, banking, and professional advice.",
  },
];

const timeAllocation = [
  { task: "Intake, name check, and checklist", minutes: 30 },
  { task: "Official-site navigation and bank readiness", minutes: 60 },
  { task: "Ironline configuration and test", minutes: 60 },
  { task: "Client training", minutes: 45 },
  { task: "Post-session follow-up", minutes: 20 },
  { task: "Routine message responses", minutes: 25 },
];

const serviceMap = [
  {
    label: "MooreTech direct",
    note: "Implementation work MooreTech can perform under a defined written scope.",
    items: [
      "Ironline Launch and its included Ironline QuickStart",
      "Ironline Office configuration and training",
      "Websites, forms, domains, business email, and analytics",
      "Workflow automation, integrations, and custom builds",
      "Lead-routing and growth systems",
      "Technology access, backups, and security setup",
      "Defined support blocks or retainers",
    ],
  },
  {
    label: "MooreTech-guided; client-controlled",
    note: "MooreTech can guide the screen and sequence while the client keeps control.",
    items: [
      "Official government websites and filing portals",
      "Bank and payment-processor onboarding",
      "Third-party software onboarding",
      "Identity checks, credentials, MFA, attestations, submissions, and payments",
    ],
  },
  {
    label: "Licensed or outside specialist",
    note: "The client contracts directly with the appropriate independent provider.",
    items: [
      "Legal advice, contracts, trademarks, and registered-agent service",
      "Tax advice, tax returns, payroll, and audit representation",
      "Insurance, loans, lending decisions, and credit advice",
      "Regulated, licensed, or professional-entity work",
    ],
  },
];

const recommendedStack = [
  {
    area: "Operations",
    tool: "Ironline Office",
    note: "Primary system for requests, customers, estimates, schedules, invoices, and follow-up.",
  },
  {
    area: "Payments",
    tool: "Square Free",
    note: "A practical starting payment rail; the client owns the account and processor relationship.",
  },
  {
    area: "Basic bookkeeping",
    tool: "Wave Starter",
    note: "A basic recordkeeping starting point; tax and accounting decisions stay with the client and advisor.",
  },
  {
    area: "Business banking",
    tool: "Local bank or Bluevine / Relay",
    note: "Compare fees, cash-deposit needs, support, eligibility, security, and software connections.",
  },
  {
    area: "Email and files",
    tool: "Google Workspace or Microsoft 365",
    note: "Professional email, shared files, calendars, account controls, and recovery options.",
  },
  {
    area: "Advisors",
    tool: "ASBTDC + attorney / CPA / EA",
    note: "Business education plus licensed or credentialed help when a decision exceeds MooreTech’s scope.",
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
        eyebrow="a MooreTech Solutions LLC service"
        title="Ironline Launch: a guided administrative start for a straightforward Arkansas LLC."
        description="Ironline Launch makes MooreTech the implementation partner for a clear setup path, organized records, and a working business system while the client controls every official filing, identity step, and professional decision."
      />

      <section className="section launch-overview">
        <div className="shell launch-overview-grid">
          <div>
            <span className="eyebrow">One clear package</span>
            <h2>Start organized for $200.</h2>
            <p className="lead">
              Ironline Launch is a fixed-fee MooreTech Solutions LLC service for a
              straightforward, one-owner Arkansas LLC. MooreTech provides guided
              administrative and technology help; the client makes every decision
              and completes every official filing.
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
            <span className="small-label">Ironline Launch service fee</span>
            <div className="launch-price">
              <span>$</span>
              <strong>{businessLaunch.price}</strong>
            </div>
            <p>One time, for up to four total MooreTech labor hours allocated across the listed tasks.</p>
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
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow">Responsibility boundary</span>
              <h2>MooreTech can guide. The client must decide and act.</h2>
            </div>
            <p>
              These boundaries protect the client’s identity, keep official
              attestations truthful, and prevent administrative help from being
              mistaken for legal, tax, accounting, banking, or registered-agent work.
            </p>
          </div>

          <div className="launch-table-wrap">
            <table className="launch-responsibility-table">
              <caption>Ironline Launch responsibility split</caption>
              <thead>
                <tr>
                  <th scope="col">Area</th>
                  <th scope="col">MooreTech can</th>
                  <th scope="col">Client must</th>
                </tr>
              </thead>
              <tbody>
                {responsibilityRows.map((row) => (
                  <tr key={row.topic}>
                    <th scope="row">{row.topic}</th>
                    <td>{row.mooreTech}</td>
                    <td>{row.client}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <div className="section-heading">
            <span className="eyebrow">How the work moves</span>
            <h2>Four milestones, with client control at every official step.</h2>
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

      <section className="section">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow">Four-hour package cap</span>
              <h2>The included time is allocated before work begins.</h2>
            </div>
            <p>
              The six allocations total 240 minutes. Unused time is not cash value,
              and MooreTech will not move into paid extra work without advance written
              client approval.
            </p>
          </div>

          <div className="launch-allocation-grid">
            {timeAllocation.map((item) => (
              <article key={item.task}>
                <strong>{item.minutes}</strong>
                <span>minutes</span>
                <p>{item.task}</p>
              </article>
            ))}
          </div>

          <div className="launch-support-rules">
            <div>
              <span className="small-label">Support window</span>
              <h3>Monday–Friday, 9:00 a.m.–5:00 p.m. Central</h3>
              <p>Federal holidays are excluded. The normal response target is within two business days.</p>
            </div>
            <ul>
              <li>No emergency, same-day, evening, weekend, or holiday support.</li>
              <li>Extra work is $50 per hour, billed in 15-minute increments, only after advance written approval.</li>
              <li>There is no automatic overtime and no work beyond the package cap without that approval.</li>
              <li>Correcting MooreTech’s own in-scope error is not extra work, carries no added charge, and does not reduce the client’s included time.</li>
            </ul>
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
              <li><Check /> Client agrees to type, sign, attest, submit, and pay official filings</li>
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
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow">Implementation partner</span>
              <h2>One MooreTech relationship, with clear professional lanes.</h2>
            </div>
            <p>
              MooreTech can implement the operating technology and coordinate a
              clean handoff. Every direct service below has its own written scope and
              price except the Ironline QuickStart already included in Ironline Launch.
            </p>
          </div>

          <div className="launch-service-map">
            {serviceMap.map((lane) => (
              <article key={lane.label}>
                <span className="small-label">{lane.label}</span>
                <p>{lane.note}</p>
                <ul>
                  {lane.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </div>

          <div className="section-heading launch-stack-heading">
            <span className="eyebrow">Recommended starting stack</span>
            <h2>Simple tools, chosen around the actual workflow.</h2>
          </div>
          <div className="launch-stack-grid">
            {recommendedStack.map((item) => (
              <article key={item.area}>
                <span>{item.area}</span>
                <h3>{item.tool}</h3>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
          <p className="launch-vendor-note">
            Outside providers contract directly with the client. Prices, eligibility,
            features, and terms can change. MooreTech will disclose in writing any
            referral, affiliate, reseller, or other compensation it may receive before
            a related recommendation or purchase.
          </p>
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
            title="Ironline Launch request"
            description="Share the proposed business activity, owner count, Arkansas city or county, and whether you have already filed anything."
          />
        </div>
      </section>
    </>
  );
}

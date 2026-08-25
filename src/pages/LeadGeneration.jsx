import { useState } from "react";
import {
  ArrowRight, Building2, CalendarCheck, MailCheck, MapPinned, PhoneCall,
  ShieldCheck, Target,
} from "lucide-react";
import { submitPipelineInquiry } from "@/pipeline/api";
import "@/pages/lead-generation.css";

const facilityTypes = [
  "Offices", "Medical facilities", "Dental offices", "Property-management companies",
  "Apartment communities", "Banks", "Churches", "Private schools", "Warehouses",
  "Car dealerships", "Professional offices", "Multi-location businesses",
];

const serviceFitCards = [
  { icon: Building2, title: "Owner-led companies", copy: "Small teams where the owner or a working manager still drives sales." },
  { icon: MapPinned, title: "Defined territory", copy: "A practical geographic area the team can actually service." },
  { icon: Target, title: "Clear best-fit account", copy: "A known facility type, contract size, and service category." },
  { icon: CalendarCheck, title: "Capacity to quote", copy: "Availability to attend qualified meetings and follow through." },
];

const process = [
  ["01", "Define the target", "We document one service, one territory, the best-fit facility types, exclusions, and a written qualified-appointment definition."],
  ["02", "Research accounts", "MooreTech manually identifies businesses using public information and records why each one appears to fit."],
  ["03", "Client approval", "The client approves, rejects, or excludes targets before any account enters active outreach."],
  ["04", "Human-led outreach", "MooreTech prepares manual email outreach and conducts human-led business calls. No bulk sender or predictive dialer is required."],
  ["05", "Qualify interest", "The decision role, business need, review timing, fit, and specific agreed next step are recorded."],
  ["06", "Schedule and report", "Qualified appointments are placed on the client's calendar and reported through business outcomes."],
];

const faq = [
  ["Are these leads sold to other companies?", "No. The target accounts and opportunities are researched for the specific client campaign. MooreTech does not sell the same internet lead to several local competitors."],
  ["What does the free sample include?", "Up to 10 researched target businesses, a short fit explanation, and selected publicly available business contact information. It does not include outreach."],
  ["What does the Founding Client Pilot cost?", "$300 upfront for a 14-day campaign, plus $150 for each held qualified appointment. Prices and quantities are confirmed in writing before the campaign."],
  ["Do you guarantee customers or revenue?", "No. MooreTech does not guarantee sales, contracts, proposals, revenue, or return on investment. We guarantee only the limited replacement standard described on this page."],
  ["What is a qualified appointment?", "A client-approved account in the agreed territory, with a decision-maker or influencer who has acknowledged a relevant need or review period and voluntarily agrees to a specific meeting."],
  ["Will MooreTech send cold texts automatically?", "No. The launch workflow does not automate cold texts, bulk email, predictive dialing, prerecorded calls, or AI voice calls."],
  ["Can I exclude current customers and competitors?", "Yes. Existing customers, known opportunities, competitors, and do-not-contact records are captured before outreach and enforced through a central suppression list."],
  ["What happens after an opportunity is won?", "The pipeline ends at the handoff. The client can optionally open Ironline Office for downstream customer and service operations, but this service does not duplicate those workflows."],
];

const initial = {
  name: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  industry: "Commercial cleaning and janitorial",
  city_state: "",
  service_territory: "",
  accepting_new_clients: "yes",
  account_type_wanted: "",
  minimum_contract_value: "",
  interest: "free_sample",
  preferred_contact: "email",
  notes: "",
  consent_given: false,
  website_check: "",
  started_at: Date.now(),
};

function RequestForm() {
  const [form, setForm] = useState(initial);
  const [state, setState] = useState({ loading: false, message: "", error: "" });

  const submit = async (event) => {
    event.preventDefault();
    setState({ loading: true, message: "", error: "" });
    try {
      const result = await submitPipelineInquiry(form);
      setState({ loading: false, message: result.message, error: "" });
      setForm({ ...initial, started_at: Date.now() });
    } catch (error) {
      setState({ loading: false, message: "", error: error.message });
    }
  };

  return (
    <form className="leadgen-form" onSubmit={submit}>
      <div>
        <p className="leadgen-kicker">Start with fit, not a sales pitch</p>
        <h2 style={{ margin: 0 }}>Request your sample or pilot review</h2>
      </div>
      {state.message ? <div className="leadgen-message">{state.message}</div> : null}
      {state.error ? <div className="leadgen-message error">{state.error}</div> : null}
      <div className="leadgen-fields">
        <div className="leadgen-field"><label htmlFor="lg-name">Name</label><input id="lg-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
        <div className="leadgen-field"><label htmlFor="lg-company">Company</label><input id="lg-company" required value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></div>
        <div className="leadgen-field"><label htmlFor="lg-email">Business email</label><input id="lg-email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
        <div className="leadgen-field"><label htmlFor="lg-phone">Phone</label><input id="lg-phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div>
        <div className="leadgen-field"><label htmlFor="lg-website">Website</label><input id="lg-website" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></div>
        <div className="leadgen-field"><label htmlFor="lg-industry">Industry</label><input id="lg-industry" required value={form.industry} onChange={(event) => setForm({ ...form, industry: event.target.value })} /></div>
        <div className="leadgen-field"><label htmlFor="lg-location">City and state</label><input id="lg-location" required value={form.city_state} onChange={(event) => setForm({ ...form, city_state: event.target.value })} /></div>
        <div className="leadgen-field"><label htmlFor="lg-territory">Service territory</label><input id="lg-territory" required value={form.service_territory} onChange={(event) => setForm({ ...form, service_territory: event.target.value })} /></div>
        <div className="leadgen-field"><label htmlFor="lg-capacity">Currently accepting new clients?</label>
          <select id="lg-capacity" value={form.accepting_new_clients} onChange={(event) => setForm({ ...form, accepting_new_clients: event.target.value })}>
            <option value="yes">Yes</option><option value="limited">Limited capacity</option><option value="not_now">Not right now</option>
          </select>
        </div>
        <div className="leadgen-field"><label htmlFor="lg-interest">Interested in</label>
          <select id="lg-interest" value={form.interest} onChange={(event) => setForm({ ...form, interest: event.target.value })}>
            <option value="free_sample">Free 10-account sample</option><option value="pilot">Founding Client Pilot</option><option value="both">Both</option>
          </select>
        </div>
        <div className="leadgen-field wide"><label htmlFor="lg-wanted">Type of commercial account wanted</label><textarea id="lg-wanted" required value={form.account_type_wanted} onChange={(event) => setForm({ ...form, account_type_wanted: event.target.value })} /></div>
        <div className="leadgen-field"><label htmlFor="lg-minimum">Approximate minimum contract value</label><input id="lg-minimum" value={form.minimum_contract_value} onChange={(event) => setForm({ ...form, minimum_contract_value: event.target.value })} /></div>
        <div className="leadgen-field"><label htmlFor="lg-contact">Preferred contact method</label>
          <select id="lg-contact" value={form.preferred_contact} onChange={(event) => setForm({ ...form, preferred_contact: event.target.value })}>
            <option value="email">Email</option><option value="call">Call</option><option value="text">Text</option>
          </select>
        </div>
        <div className="leadgen-field wide"><label htmlFor="lg-notes">Notes</label><textarea id="lg-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div>
        <div aria-hidden="true" style={{ position: "absolute", left: "-10000px" }}>
          <label htmlFor="lg-check">Leave blank</label><input id="lg-check" tabIndex={-1} autoComplete="off" value={form.website_check} onChange={(event) => setForm({ ...form, website_check: event.target.value })} />
        </div>
      </div>
      <label className="leadgen-consent">
        <input type="checkbox" required checked={form.consent_given} onChange={(event) => setForm({ ...form, consent_given: event.target.checked })} />
        <span>MooreTech Solutions LLC may contact me about this request using my selected contact method. This is not consent to automated marketing texts.</span>
      </label>
      <button className="leadgen-button" disabled={state.loading}>
        {state.loading ? "Submitting…" : "Submit request"} <ArrowRight size={17} />
      </button>
      <span className="leadgen-footnote">Submitting creates a private MooreTech sales prospect and work-inbox item. It does not send cold outreach or charge a payment method.</span>
    </form>
  );
}

export default function LeadGeneration() {
  return (
    <div className="leadgen-page">
      <section className="leadgen-hero">
        <div className="leadgen-shell leadgen-hero-grid">
          <div>
            <span className="leadgen-eyebrow">MooreTech Commercial Pipeline</span>
            <h1>Exclusive Commercial Opportunities. <span>Not Recycled Lead Lists.</span></h1>
            <p className="leadgen-hero-copy">MooreTech researches the right accounts, reaches the appropriate decision-makers, qualifies interest, and schedules sales appointments for commercial service companies.</p>
            <div className="leadgen-actions">
              <a className="leadgen-button" href="#request">Request a Free 10-Account Sample <ArrowRight size={17} /></a>
              <a className="leadgen-button secondary" href="#pilot">Apply for the Founding Client Pilot</a>
            </div>
          </div>
          <aside className="leadgen-hero-aside">
            <strong>Built for one company at a time.</strong>
            <span>Your territory. Your qualification criteria. Your approved accounts. Your opportunities—not a shared list sold to competing providers.</span>
          </aside>
        </div>
      </section>

      <section className="leadgen-section">
        <div className="leadgen-shell">
          <div className="leadgen-section-head">
            <p className="leadgen-kicker">Who this is for</p>
            <h2>Commercial service companies ready for the right conversations.</h2>
            <p>This is a focused business-development service for operators who can take on new recurring commercial work but do not have time to build and work a disciplined account list.</p>
          </div>
          <div className="leadgen-grid four">
            {serviceFitCards.map(({ icon: Icon, title, copy }) => <article className="leadgen-card" key={title}><Icon size={24} /><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="leadgen-section compact">
        <div className="leadgen-shell">
          <div className="leadgen-section-head">
            <p className="leadgen-kicker">Launch focus</p>
            <h2>Commercial cleaning and janitorial.</h2>
            <p>At launch, MooreTech is concentrating on recurring commercial cleaning contracts so the targeting, qualification criteria, and reporting stay specific.</p>
          </div>
          <div className="leadgen-tags">
            {facilityTypes.map((type) => <span className="leadgen-tag" key={type}>{type}</span>)}
          </div>
        </div>
      </section>

      <section className="leadgen-section">
        <div className="leadgen-shell">
          <div className="leadgen-section-head">
            <p className="leadgen-kicker">How the process works</p>
            <h2>One clean pipeline from target definition to client handoff.</h2>
          </div>
          <div className="leadgen-grid three">
            {process.map(([number, title, copy]) => <article className="leadgen-card" key={number}><span className="leadgen-number">{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="leadgen-section compact">
        <div className="leadgen-shell leadgen-grid two">
          <div>
            <p className="leadgen-kicker">What the client receives</p>
            <h2>Recorded work, visible decisions, and business outcomes.</h2>
          </div>
          <ul className="leadgen-list">
            <li>Client-specific ideal customer and qualification profile</li>
            <li>Researched account list with reasons for fit and public sources</li>
            <li>Decision-maker tracking and manual outreach activity</li>
            <li>Client approval and exclusion controls before outreach</li>
            <li>Qualification summaries and calendar-ready appointments</li>
            <li>Campaign funnel, held meetings, proposals, wins, and reported revenue</li>
          </ul>
        </div>
      </section>

      <section className="leadgen-section" id="pilot">
        <div className="leadgen-shell">
          <div className="leadgen-section-head">
            <p className="leadgen-kicker">Start small</p>
            <h2>Evaluate the targeting before committing to a full campaign.</h2>
          </div>
          <div className="leadgen-offer">
            <article id="free-sample">
              <p className="leadgen-kicker">Free sample</p>
              <h3>10-account targeting preview</h3>
              <div className="leadgen-price">$0</div>
              <ul className="leadgen-list">
                <li>Up to 10 researched target businesses</li>
                <li>Basic fit explanation</li>
                <li>Selected publicly available decision-maker information</li>
                <li>No outreach included</li>
                <li>No payment required</li>
              </ul>
              <div className="leadgen-actions"><a className="leadgen-button secondary" href="#request">Request the sample</a></div>
            </article>
            <article className="featured">
              <p className="leadgen-kicker">Founding Client Pilot</p>
              <h3>14-day focused campaign</h3>
              <div className="leadgen-price">$300 <small>upfront + $150 per held qualified appointment</small></div>
              <ul className="leadgen-list">
                <li>One service category and one geographic territory</li>
                <li>Up to 50 researched target accounts</li>
                <li>Manual email outreach and human-led business calls</li>
                <li>Qualification and appointment scheduling</li>
                <li>Campaign notes and final report</li>
              </ul>
              <div className="leadgen-actions"><a className="leadgen-button" href="#request">Apply for the pilot</a></div>
            </article>
          </div>
        </div>
      </section>

      <section className="leadgen-section">
        <div className="leadgen-shell">
          <div className="leadgen-section-head">
            <p className="leadgen-kicker">Qualified appointment standard</p>
            <h2>“Interested” is not enough.</h2>
            <p>Every required condition is recorded before a meeting is treated as qualified.</p>
          </div>
          <div className="leadgen-definition">
            <div><strong>Account fit</strong><span>The organization matches the written industry, facility, territory, and minimum-opportunity requirements.</span></div>
            <div><strong>Decision role</strong><span>The contact makes or influences vendor decisions.</span></div>
            <div><strong>Relevant signal</strong><span>The contact acknowledges a need, service problem, review period, contract expiration, or genuine interest.</span></div>
            <div><strong>Voluntary meeting</strong><span>The contact agrees to a specific meeting date and time.</span></div>
            <div><strong>No exclusion</strong><span>The company is not a current customer, known opportunity, competitor, or do-not-contact record.</span></div>
          </div>
        </div>
      </section>

      <section className="leadgen-section compact">
        <div className="leadgen-shell">
          <div className="leadgen-disclosure">
            <h2>What MooreTech does—and does not—guarantee.</h2>
            <p><strong>Limited replacement standard:</strong> If an appointment does not satisfy the written qualification criteria agreed upon before the campaign, MooreTech will replace it. MooreTech does not guarantee that the prospect will purchase the client’s services.</p>
            <p>MooreTech does not guarantee sales, contracts, proposals, revenue, or return on investment.</p>
          </div>
        </div>
      </section>

      <section className="leadgen-section">
        <div className="leadgen-shell">
          <div className="leadgen-grid two">
            <article className="leadgen-card"><MapPinned size={25} /><h3>Exclusive territory is written down</h3><p>Each pilot identifies one geographic territory and the service being promoted. MooreTech uses that scope to prevent muddled targeting and avoid recycling the same opportunity among direct competitors.</p></article>
            <article className="leadgen-card"><ShieldCheck size={25} /><h3>Why the leads are not resold</h3><p>The campaign starts with the client’s ideal customer, exclusions, capacity, and qualification rules. That makes the work a client-specific sales pipeline—not a commodity list purchased and resold.</p></article>
          </div>
        </div>
      </section>

      <section className="leadgen-section compact">
        <div className="leadgen-shell">
          <div className="leadgen-ironline">
            <div>
              <p className="leadgen-kicker">Optional downstream handoff</p>
              <h2>Win the opportunity here. Run the customer relationship in Ironline Office.</h2>
              <p>MooreTech Commercial Pipeline ends at appointment and opportunity outcome. A won opportunity can optionally move into Ironline Office later for customer, service, job, invoicing, and payment workflows.</p>
            </div>
            <a className="leadgen-button secondary" href="https://ironlineoffice.com/" target="_blank" rel="noreferrer">Explore Ironline Office <ArrowRight size={17} /></a>
          </div>
        </div>
      </section>

      <section className="leadgen-section">
        <div className="leadgen-shell">
          <div className="leadgen-section-head">
            <p className="leadgen-kicker">Frequently asked questions</p>
            <h2>Transparent from the first conversation.</h2>
          </div>
          <div className="leadgen-faq">
            {faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className="leadgen-section" id="request">
        <div className="leadgen-shell leadgen-form-grid">
          <aside className="leadgen-contact-block">
            <p className="leadgen-kicker">Contact MooreTech</p>
            <h2>Tell us what a worthwhile commercial account looks like.</h2>
            <p>We will review the territory, target account, minimum opportunity, and current capacity before deciding whether the sample or pilot is a good fit.</p>
            <a href="tel:+18708191018"><PhoneCall size={18} /> Call or text 870-819-1018</a>
            <a href="mailto:admin@ironlineoffice.com"><MailCheck size={18} /> admin@ironlineoffice.com</a>
            <div className="leadgen-disclosure" style={{ marginTop: 22, padding: 18 }}>
              <strong>Manual-first launch</strong>
              <p>MooreTech does not use automated cold texts, prerecorded calls, predictive dialing, or automatic bulk email in this service.</p>
            </div>
          </aside>
          <RequestForm />
        </div>
      </section>
    </div>
  );
}

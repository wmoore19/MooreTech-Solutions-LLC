import { ArrowRight, Check, FileCheck2, Mail, MessageSquareText, ShieldCheck, X } from "lucide-react";
import PageIntro from "@/components/site/PageIntro";
import InquiryForm from "@/components/site/InquiryForm";
import { company, customBuildEmail } from "@/siteData";

const steps = [
  ["01", "Understand the process", "We begin with the work, bottleneck, users, and result you need—not a list of fashionable features."],
  ["02", "Define a practical first version", "We narrow the request into a clear scope that can be reviewed, tested, and improved."],
  ["03", "Build in visible stages", "You see progress early enough to correct assumptions before they become expensive."],
  ["04", "Launch with a clear handoff", "We document the important parts and agree on what ongoing support, if any, makes sense."],
];

export default function CustomBuilds() {
  return (
    <>
      <PageIntro
        eyebrow="Custom builds"
        title="Have a process that does not fit off-the-shelf software?"
        description="MooreTech considers focused custom software requests when the problem, users, and business value are clear."
      >
        <div className="intro-actions">
          <a
            className="button"
            href={company.smsHref}
            data-track-event="company_text_clicked"
            data-track-placement="custom_build_intro"
            data-track-destination="sms"
          >
            <MessageSquareText size={18} /> Text your idea
          </a>
          <a
            className="button button-secondary"
            href={customBuildEmail}
            data-track-event="company_email_clicked"
            data-track-placement="custom_build_intro"
            data-track-destination="email"
          >
            <Mail size={18} /> Email a request
          </a>
        </div>
      </PageIntro>

      <section className="section">
        <div className="shell two-column">
          <div>
            <span className="eyebrow">Common request types</span>
            <h2>Small, useful systems with a specific job.</h2>
            <p className="lead">
              Typical requests may include internal dashboards, customer or staff
              portals, lightweight operational apps, workflow automation, and
              carefully chosen integrations.
            </p>
          </div>
          <div className="scope-card">
            <h3>A stronger starting request includes:</h3>
            <ul className="check-list">
              <li><Check /> What happens today</li>
              <li><Check /> Where time or information is lost</li>
              <li><Check /> Who will use the system</li>
              <li><Check /> What a useful result would look like</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <div className="section-heading">
            <span className="eyebrow">A straightforward process</span>
            <h2>From problem to useful first release.</h2>
          </div>
          <div className="process-grid">
            {steps.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
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
            <span className="eyebrow">Before paid work begins</span>
            <h2>Clear expectations protect both sides.</h2>
          </div>
          <div className="engagement-grid">
            <article className="engagement-card">
              <MessageSquareText />
              <h3>No-cost fit review</h3>
              <p>An initial conversation helps determine whether the problem and MooreTech are a sensible match.</p>
            </article>
            <article className="engagement-card">
              <FileCheck2 />
              <h3>Written scope</h3>
              <p>Paid work begins only after the first version, responsibilities, timing, and commercial terms are documented.</p>
            </article>
            <article className="engagement-card">
              <ShieldCheck />
              <h3>Ownership and operations</h3>
              <p>Code, data, hosting, access, third-party services, handoff, and ongoing support are agreed in writing for the project.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell fit-split">
          <article className="fit-panel good-fit">
            <Check />
            <h2>Usually a good fit</h2>
            <ul>
              <li>A defined operational problem</li>
              <li>A reachable decision-maker and users</li>
              <li>Willingness to start with a focused version</li>
              <li>A realistic reason the build should exist</li>
            </ul>
          </article>
          <article className="fit-panel not-fit">
            <X />
            <h2>Usually not a good fit</h2>
            <ul>
              <li>A large platform with no prioritized first release</li>
              <li>A request built only around copying another product</li>
              <li>An urgent deadline that prevents proper review</li>
              <li>A project without an owner for decisions and testing</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <InquiryForm
            defaultType="custom_build"
            showType={false}
            title="Request an initial project review"
            description={`Tell us what is happening today and what you want to improve. ${company.responseTime}.`}
          />
        </div>
      </section>

      <section className="section section-cta">
        <div className="shell cta-panel">
          <div>
            <span className="eyebrow">Prefer a quick start?</span>
            <h2>Start with the problem, not a polished specification.</h2>
            <p>A few sentences by text are enough for an initial review.</p>
          </div>
          <a
            className="button button-light"
            href={company.smsHref}
            data-track-event="company_text_clicked"
            data-track-placement="custom_build_cta"
            data-track-destination="sms"
          >
            Text {company.phoneDisplay} <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </>
  );
}

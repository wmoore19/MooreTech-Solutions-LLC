import { Database, KeyRound, ShieldCheck, UsersRound } from "lucide-react";
import PageIntro from "@/components/site/PageIntro";
import { company } from "@/siteData";

const practices = [
  {
    icon: Database,
    title: "Collect only what has a job",
    text: "We aim to limit information to what is needed for the product, project, support request, or business process being served.",
  },
  {
    icon: KeyRound,
    title: "Restrict sensitive access",
    text: "Website inquiries are stored behind administrator-only access. Credentials and service secrets are kept out of public source code.",
  },
  {
    icon: UsersRound,
    title: "Define responsibility clearly",
    text: "For custom work, data access, hosting, ownership, vendors, backups, and ongoing support are discussed as part of the written scope.",
  },
  {
    icon: ShieldCheck,
    title: "Communicate material issues",
    text: "If a confirmed incident materially affects customer information under our control, we will work with affected parties and providers to respond appropriately.",
  },
];

export default function Security() {
  return (
    <>
      <PageIntro
        eyebrow="Security & data practices"
        title="Practical safeguards, clear limits, and honest communication."
        description="Security depends on the product, data, vendors, and scope. MooreTech does not claim certifications or controls that have not been independently established."
      />

      <section className="section">
        <div className="shell principle-grid">
          {practices.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <div className="icon-box"><Icon /></div>
              <h2 className="card-heading">{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell story-grid">
          <div>
            <span className="eyebrow">Before custom work begins</span>
            <h2>Security requirements belong in the scope.</h2>
          </div>
          <div className="story-copy">
            <p>
              A useful first review identifies the people using the system, the
              information involved, required integrations, expected availability,
              and who will manage access after launch.
            </p>
            <p>
              MooreTech then documents the agreed approach—including important
              vendor dependencies and responsibilities—before paid work begins.
            </p>
            <a
              className="text-link"
              href={"mailto:" + company.email}
              data-track-event="company_email_clicked"
              data-track-placement="security"
              data-track-destination="email"
            >
              Ask a security or data question
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

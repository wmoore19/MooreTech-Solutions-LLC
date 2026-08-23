import { Compass, Handshake, ShieldCheck } from "lucide-react";
import PageIntro from "@/components/site/PageIntro";
import { company, leadership } from "@/siteData";

const values = [
  {
    icon: Compass,
    title: "Clarity",
    text: "People should understand what a system does, what it costs them in time, and what happens next.",
  },
  {
    icon: Handshake,
    title: "Practical partnership",
    text: "Useful software comes from listening to the people closest to the work and testing assumptions early.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible growth",
    text: "We prefer focused promises, visible progress, and products that earn a larger role over time.",
  },
];

export default function About() {
  return (
    <>
      <PageIntro
        eyebrow="About MooreTech"
        title="A small technology company building for practical work."
        description={`MooreTech Solutions LLC was established in ${company.founded} in Northeast Arkansas. We create software products and selected custom systems for businesses across the United States that need clearer, more connected operations.`}
      />

      <section className="section">
        <div className="shell story-grid">
          <div>
            <span className="eyebrow">Why we started</span>
            <h2>Too much business software adds complexity before it adds value.</h2>
          </div>
          <div className="story-copy">
            <p>
              MooreTech was formed around a straightforward idea: technology should
              make the next step easier to see and the important work easier to
              complete.
            </p>
            <p>
              Our first public product, Ironline Office, applies that idea to the
              everyday flow of service work. Our custom work follows the same
              principle—understand the operation first, then build only what helps.
            </p>
            <p className="service-area-note">
              Based in {company.location} · {company.serviceArea}
            </p>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <div className="section-heading">
            <span className="eyebrow">Leadership</span>
            <h2>The people accountable for the work.</h2>
            <p>
              MooreTech is deliberately small. Product decisions, customer feedback,
              and project conversations stay close to the people building the company.
            </p>
          </div>
          <div className="leadership-grid">
            {leadership.map((leader) => (
              <article className="leader-card" key={leader.name}>
                <div className="leader-avatar" aria-hidden="true">{leader.initials}</div>
                <div>
                  <h3>{leader.name}</h3>
                  <span className="leader-role">{leader.role}</span>
                  <p>{leader.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <span className="eyebrow">What guides us</span>
            <h2>Grounded decisions, understandable systems.</h2>
          </div>
          <div className="principle-grid">
            {values.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <div className="icon-box"><Icon /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

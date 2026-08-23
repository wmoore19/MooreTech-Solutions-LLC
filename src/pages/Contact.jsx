import { Github, Mail, MessageSquareText, Phone } from "lucide-react";
import PageIntro from "@/components/site/PageIntro";
import { company, customBuildEmail } from "@/siteData";

export default function Contact() {
  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="Start with a text, email, or short description."
        description="Texting is encouraged. Tell us whether you are asking about Ironline Office, a custom build, careers, or something else."
      />

      <section className="section">
        <div className="shell contact-grid">
          <a className="contact-card featured" href={company.smsHref}>
            <MessageSquareText />
            <span>Recommended</span>
            <h2>Text us</h2>
            <p>{company.phoneDisplay}</p>
            <small>Best for a quick question or first conversation.</small>
          </a>

          <a className="contact-card" href={"mailto:" + company.email}>
            <Mail />
            <span>Email</span>
            <h2>{company.email}</h2>
            <p>Product, company, and general inquiries.</p>
          </a>

          <a className="contact-card" href={company.phoneHref}>
            <Phone />
            <span>Call</span>
            <h2>{company.phoneDisplay}</h2>
            <p>If we miss you, leaving a text is the fastest follow-up.</p>
          </a>

          <a
            className="contact-card"
            href={company.githubUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Github />
            <span>GitHub</span>
            <h2>MooreTech repository</h2>
            <p>{company.githubLabel}</p>
          </a>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell inquiry-panel">
          <div>
            <span className="eyebrow">Custom build inquiries</span>
            <h2>A useful first message can be brief.</h2>
          </div>
          <div>
            <p>Include what happens today, what is slowing the work down, and who would use the solution.</p>
            <a className="button" href={customBuildEmail}>
              <Mail size={18} /> Email a custom build request
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

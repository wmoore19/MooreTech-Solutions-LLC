import { Github, Mail, MessageSquareText, Phone } from "lucide-react";
import PageIntro from "@/components/site/PageIntro";
import InquiryForm from "@/components/site/InquiryForm";
import { company } from "@/siteData";

export default function Contact() {
  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="Start with a text, email, or short description."
        description={`Texting is encouraged. Tell us whether you are asking about Ironline Office, a custom build, a partnership, careers, or something else. ${company.responseTime}.`}
      />

      <section className="section">
        <div className="shell contact-grid">
          <a
            className="contact-card featured"
            href={company.smsHref}
            data-track-event="company_text_clicked"
            data-track-placement="contact_card"
            data-track-destination="sms"
          >
            <MessageSquareText />
            <span>Recommended</span>
            <h2>Text us</h2>
            <p>{company.phoneDisplay}</p>
            <small>Best for a quick question or first conversation.</small>
          </a>

          <a
            className="contact-card"
            href={"mailto:" + company.email}
            data-track-event="company_email_clicked"
            data-track-placement="contact_card"
            data-track-destination="email"
          >
            <Mail />
            <span>Email</span>
            <h2>{company.email}</h2>
            <p>Product, company, and general inquiries.</p>
          </a>

          <a
            className="contact-card"
            href={company.phoneHref}
            data-track-event="company_call_clicked"
            data-track-placement="contact_card"
            data-track-destination="phone"
          >
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
            data-track-event="company_github_clicked"
            data-track-placement="contact_card"
            data-track-destination="github"
          >
            <Github />
            <span>GitHub</span>
            <h2>MooreTech repository</h2>
            <p>{company.githubLabel}</p>
          </a>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell">
          <InquiryForm
            title="Send a structured inquiry"
            description="Choose the topic and share enough context for us to route your request. Please do not include passwords, payment details, or other sensitive information."
          />
        </div>
      </section>
    </>
  );
}

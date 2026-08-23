import PageIntro from "@/components/site/PageIntro";
import { company } from "@/siteData";

export default function Privacy() {
  return (
    <>
      <PageIntro
        eyebrow="Legal"
        title="Privacy policy"
        description="Effective August 22, 2026"
      />
      <section className="section">
        <div className="shell legal-copy">
          <h2>Information you choose to send</h2>
          <p>
            This website does not currently provide a public account or application
            form. If you contact MooreTech by email, phone, or text, we receive the
            information you choose to send so we can respond to your inquiry.
          </p>

          <h2>Website and hosting information</h2>
          <p>
            Our hosting and service providers may process basic technical
            information needed to deliver, secure, and maintain the website, such as
            device, browser, network, and request information.
          </p>

          <h2>How information is used</h2>
          <p>
            We use contact information to answer questions, discuss products or
            services, review career introductions, protect our services, and meet
            applicable business or legal obligations. We do not sell personal
            information.
          </p>

          <h2>Third-party links</h2>
          <p>
            Links to Ironline Office, GitHub, and other third-party services are
            governed by those services' own privacy practices.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy can be sent to{" "}
            <a href={"mailto:" + company.email}>{company.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}

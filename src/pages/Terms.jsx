import PageIntro from "@/components/site/PageIntro";
import { company } from "@/siteData";

export default function Terms() {
  return (
    <>
      <PageIntro
        eyebrow="Legal"
        title="Website terms"
        description="Effective August 23, 2026"
      />
      <section className="section">
        <div className="shell legal-copy">
          <h2>Website purpose</h2>
          <p>
            This website provides general information about MooreTech Solutions
            LLC, its products, selected custom build services, careers, and contact
            methods. You may use it only for lawful purposes.
          </p>

          <h2>No automatic engagement</h2>
          <p>
            Sending a message, custom build request, or résumé does not create a
            contract, employment relationship, confidentiality obligation, or
            obligation to provide services. Do not submit confidential or sensitive
            information unless MooreTech has agreed to an appropriate process. Any
            paid work requires a separate written agreement.
          </p>

          <h2>Custom project terms</h2>
          <p>
            A potential project's scope, deliverables, fees, timing, ownership,
            licensing, hosting, data responsibilities, third-party services,
            support, and acceptance terms are established only in a written
            agreement for that project.
          </p>

          <h2>Product information</h2>
          <p>
            Product features, availability, pricing, and trial terms may change.
            The applicable product website and written product terms control if
            this company website differs from current product information.
          </p>

          <h2>Website availability and accuracy</h2>
          <p>
            We work to keep the website useful and accurate, but it is provided for
            general informational purposes and may contain errors or become
            temporarily unavailable. To the extent permitted by law, MooreTech
            disclaims warranties arising solely from use of this informational
            website.
          </p>

          <h2>Intellectual property</h2>
          <p>
            Unless otherwise stated, this website's branding, copy, design, and
            original materials belong to MooreTech Solutions LLC. Third-party names
            and marks belong to their respective owners.
          </p>

          <h2>External services</h2>
          <p>
            We are not responsible for the availability, content, or policies of
            external websites linked from this site. A link does not imply an
            endorsement beyond what the surrounding text expressly states.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms can be sent to{" "}
            <a href={"mailto:" + company.email}>{company.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}

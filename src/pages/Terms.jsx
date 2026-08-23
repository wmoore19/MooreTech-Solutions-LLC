import PageIntro from "@/components/site/PageIntro";
import { company } from "@/siteData";

export default function Terms() {
  return (
    <>
      <PageIntro
        eyebrow="Legal"
        title="Website terms"
        description="Effective August 22, 2026"
      />
      <section className="section">
        <div className="shell legal-copy">
          <h2>Website purpose</h2>
          <p>
            This website provides general information about MooreTech Solutions
            LLC, its products, custom build services, careers, and contact methods.
          </p>

          <h2>No automatic engagement</h2>
          <p>
            Sending a message, custom build request, or résumé does not create a
            contract, employment relationship, or obligation to provide services.
            Any paid work requires a separate written agreement.
          </p>

          <h2>Product information</h2>
          <p>
            Product features, availability, pricing, and trial terms may change.
            The applicable product website and written agreement control if this
            website differs from current product information.
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
            external websites linked from this site.
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

import PageIntro from "@/components/site/PageIntro";
import { company } from "@/siteData";

export default function Privacy() {
  return (
    <>
      <PageIntro
        eyebrow="Legal"
        title="Privacy policy"
        description="Effective August 23, 2026"
      />
      <section className="section">
        <div className="shell legal-copy">
          <h2>Information you choose to send</h2>
          <p>
            When you use our inquiry form or contact MooreTech by email, phone, or
            text, we receive the information you choose to provide. This may include
            your name, work email, phone number, company, preferred contact method,
            inquiry type, project stage, timeframe, and message. Please do not send
            passwords, payment-card details, health information, or other sensitive
            information through the website.
          </p>

          <h2>Technical and usage information</h2>
          <p>
            Base44 provides the website hosting and application services used by
            this site. MooreTech records privacy-conscious events such as page paths,
            referring website hostnames, and clicks on key contact or product links
            so we can understand whether the site is useful. We do not place the
            contents of your inquiry, your name, email, or phone number into those
            analytics events. Hosting and security systems may also process device,
            browser, network, request, and diagnostic information needed to deliver
            and protect the site.
          </p>

          <h2>How information is used</h2>
          <p>
            We use information to respond to inquiries, discuss products or
            potential services, review career introductions, improve the website,
            prevent misuse, maintain records, and meet applicable business or legal
            obligations. We do not sell personal information.
          </p>

          <h2>Storage, access, and service providers</h2>
          <p>
            Website inquiries are stored with administrator-only access and used to
            notify the MooreTech contact email. We may rely on hosting, email,
            security, and other service providers that process information on our
            behalf to perform those services. We retain information only as long as
            reasonably needed for the purposes described here, our records, dispute
            resolution, or legal obligations.
          </p>

          <h2>Your choices</h2>
          <p>
            You can choose to contact us by text, phone, or email instead of using
            the form. You may also ask us to review, correct, or delete information
            you submitted, subject to information we must retain for legitimate
            business or legal reasons.
          </p>

          <h2>Third-party links</h2>
          <p>
            Links to Ironline Office, GitHub, and other external services are
            governed by those services' own privacy practices. Review their policies
            before providing information there.
          </p>

          <h2>Policy changes</h2>
          <p>
            We may update this policy as the website and company develop. The
            effective date above identifies the current version.
          </p>

          <h2>Contact</h2>
          <p>
            Questions or privacy requests can be sent to{" "}
            <a href={"mailto:" + company.email}>{company.email}</a> or by text at{" "}
            <a href={company.smsHref}>{company.phoneDisplay}</a>.
          </p>
        </div>
      </section>
    </>
  );
}

import { ArrowRight, Check, Mail } from "lucide-react";
import PageIntro from "@/components/site/PageIntro";
import { careersEmail, company } from "@/siteData";

const traits = [
  "You explain complicated ideas plainly.",
  "You care whether the finished tool is genuinely useful.",
  "You are comfortable testing assumptions and changing course.",
  "You treat customers and teammates with patience and respect.",
];

export default function Careers() {
  return (
    <>
      <PageIntro
        eyebrow="Careers"
        title="Help build technology that respects people's time."
        description="MooreTech is early, growing carefully, and interested in meeting thoughtful people across product, development, customer success, and sales."
      />

      <section className="section">
        <div className="shell careers-layout">
          <div className="opening-card">
            <span className="product-badge">General interest</span>
            <h2>No specific opening is posted today.</h2>
            <p>
              We still welcome introductions from people who connect with the work.
              Email your résumé and a short note about the kind of problems you
              are good at solving.
            </p>
            <a className="button" href={careersEmail}>
              <Mail size={18} /> Email your résumé
            </a>
            <span className="contact-note">Sent to {company.email}</span>
          </div>

          <aside className="trait-card">
            <span className="small-label">You may fit our way of working if</span>
            <ul className="check-list">
              {traits.map((trait) => (
                <li key={trait}><Check /> {trait}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="section section-soft">
        <div className="shell narrow-copy">
          <span className="eyebrow">A note on timing</span>
          <h2>Sending a résumé is an introduction, not a promise of an opening.</h2>
          <p>
            We will review career emails as the company grows. When a defined role
            opens, we will publish its responsibilities, working arrangement, and
            hiring process here.
          </p>
          <a className="text-link" href={careersEmail}>
            Introduce yourself <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </>
  );
}

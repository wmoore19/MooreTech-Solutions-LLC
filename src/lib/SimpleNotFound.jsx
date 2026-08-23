import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function SimpleNotFound() {
  return (
    <section className="page-intro not-found">
      <div className="shell page-intro-inner">
        <span className="eyebrow">404</span>
        <h1>That page is not here.</h1>
        <p>The link may have changed, or the page may not exist.</p>
        <Link className="button" to="/">
          <ArrowLeft size={18} /> Return home
        </Link>
      </div>
    </section>
  );
}

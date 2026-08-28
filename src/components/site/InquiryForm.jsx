import { useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, MessageSquareText, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { trackSiteEvent } from "@/lib/siteAnalytics";
import { company } from "@/siteData";

const initialForm = (defaultType) => ({
  inquiry_type: defaultType,
  name: "",
  email: "",
  phone: "",
  company: "",
  preferred_contact: "email",
  message: "",
  project_stage: defaultType === "custom_build" ? "exploring" : "not_applicable",
  timeframe: defaultType === "custom_build" ? "not_sure" : "not_applicable",
  consent_given: false,
  website: "",
});

export default function InquiryForm({
  defaultType = "general",
  showType = true,
  title = "Send MooreTech a request",
  description = "Share a short description. We will review it and respond using your preferred contact method.",
}) {
  const [form, setForm] = useState(() => initialForm(defaultType));
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const startedAt = useRef(Date.now());

  const update = (event) => {
    const { name, type, value, checked } = event.target;
    setForm((current) => {
      const next = {
        ...current,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "inquiry_type") {
        next.project_stage = value === "custom_build" ? "exploring" : "not_applicable";
        next.timeframe = value === "custom_build" ? "not_sure" : "not_applicable";
      }

      return next;
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    if ((form.preferred_contact === "text" || form.preferred_contact === "call") && form.phone.trim().length < 7) {
      setError("Please include a phone number for text or call follow-up.");
      return;
    }

    setStatus("submitting");

    try {
      const response = await base44.functions.invoke("submit-inquiry", {
        ...form,
        source_page: window.location.pathname,
        started_at: startedAt.current,
      });
      const result = response?.data ?? response;

      if (!result?.success) {
        throw new Error(result?.error || "The request could not be submitted.");
      }

      trackSiteEvent("company_inquiry_submitted", {
        inquiry_type: form.inquiry_type,
        preferred_contact: form.preferred_contact,
        source_page: window.location.pathname,
      });
      setStatus("success");
      setForm(initialForm(defaultType));
      startedAt.current = Date.now();
    } catch (submissionError) {
      const message =
        submissionError?.response?.data?.error ||
        submissionError?.message ||
        "We could not submit the request right now. Please text us instead.";
      setError(message);
      setStatus("error");
      trackSiteEvent("company_inquiry_failed", {
        inquiry_type: form.inquiry_type,
        source_page: window.location.pathname,
      });
    }
  };

  if (status === "success") {
    return (
      <div className="inquiry-success" role="status">
        <CheckCircle2 />
        <div>
          <span className="eyebrow">Request received</span>
          <h2>Thank you. We will review it carefully.</h2>
          <p>
            We aim to respond within two business days. If you need to add
            something, text {company.phoneDisplay}.
          </p>
          <a
            className="text-link"
            href={company.smsHref}
            data-track-event="company_text_clicked"
            data-track-placement="inquiry_success"
            data-track-destination="sms"
          >
            <MessageSquareText size={17} /> Text MooreTech
          </a>
        </div>
      </div>
    );
  }

  return (
    <form className="inquiry-form" onSubmit={submit} noValidate>
      <div className="form-heading">
        <span className="eyebrow">Secure inquiry</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="form-grid">
        {showType && (
          <label>
            What can we help with?
            <select name="inquiry_type" value={form.inquiry_type} onChange={update}>
              <option value="custom_build">Custom software build</option>
              <option value="ironline_office">Ironline Office</option>
              <option value="business_launch">Arkansas Business Launch</option>
              <option value="partnership">Partnership</option>
              <option value="general">General question</option>
            </select>
          </label>
        )}

        <label>
          Your name
          <input name="name" value={form.name} onChange={update} autoComplete="name" maxLength={120} required />
        </label>

        <label>
          Work email
          <input name="email" value={form.email} onChange={update} type="email" autoComplete="email" maxLength={254} required />
        </label>

        <label>
          Company <span>(optional)</span>
          <input name="company" value={form.company} onChange={update} autoComplete="organization" maxLength={160} />
        </label>

        <label>
          Phone <span>(optional unless texting or calling)</span>
          <input name="phone" value={form.phone} onChange={update} type="tel" autoComplete="tel" maxLength={50} />
        </label>

        <label>
          Preferred response
          <select name="preferred_contact" value={form.preferred_contact} onChange={update}>
            <option value="email">Email</option>
            <option value="text">Text</option>
            <option value="call">Call</option>
          </select>
        </label>

        {form.inquiry_type === "custom_build" && (
          <>
            <label>
              Project stage
              <select name="project_stage" value={form.project_stage} onChange={update}>
                <option value="exploring">Exploring the idea</option>
                <option value="comparing">Comparing options</option>
                <option value="ready_to_scope">Ready to define a first version</option>
                <option value="urgent_need">Operational need is urgent</option>
              </select>
            </label>

            <label>
              Preferred timeframe
              <select name="timeframe" value={form.timeframe} onChange={update}>
                <option value="not_sure">Not sure yet</option>
                <option value="flexible">Flexible</option>
                <option value="one_to_three_months">1–3 months</option>
                <option value="three_to_six_months">3–6 months</option>
              </select>
            </label>
          </>
        )}

        <label className="form-full">
          What are you trying to improve?
          <textarea
            name="message"
            value={form.message}
            onChange={update}
            rows={7}
            minLength={20}
            maxLength={5000}
            placeholder="What happens today, where time or information is lost, who is affected, and what a useful result would look like."
            required
          />
        </label>

        <label className="website-field" aria-hidden="true">
          Website
          <input name="website" value={form.website} onChange={update} tabIndex={-1} autoComplete="off" />
        </label>

        <label className="consent-field form-full">
          <input
            name="consent_given"
            type="checkbox"
            checked={form.consent_given}
            onChange={update}
            required
          />
          <span>
            MooreTech may contact me about this request. Submitting does not create
            a contract or paid engagement. See our <Link to="/privacy">privacy policy</Link>.
          </span>
        </label>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-submit">
        <button className="button" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? <LoaderCircle className="spin" /> : <Send size={18} />}
          {status === "submitting" ? "Sending securely…" : "Send request"}
        </button>
        <small>
          Prefer a quick conversation? Text {company.phoneDisplay}.
        </small>
      </div>
    </form>
  );
}

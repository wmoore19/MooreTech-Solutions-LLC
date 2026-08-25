import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { company } from "@/siteData";

const pageMeta = {
  "/": {
    title: "MooreTech Solutions LLC | Practical Software & Custom Systems",
    description:
      "MooreTech Solutions LLC builds practical software products, including Ironline Office, and carefully scoped custom systems for real-world operations.",
  },
  "/products": {
    title: "Ironline Office & MooreTech Products | MooreTech Solutions LLC",
    description:
      "Explore Ironline Office, MooreTech's first public product for owner-led service teams managing customers, work, schedules, invoices, and follow-up.",
  },
  "/lead-generation": {
    title: "Commercial Lead Generation | MooreTech Solutions LLC",
    description:
      "Request a free 10-account sample or apply for MooreTech’s 14-day commercial lead-generation pilot for commercial service companies.",
  },
  "/custom-builds": {
    title: "Custom Operational Software Builds | MooreTech Solutions LLC",
    description:
      "Request a focused custom dashboard, portal, operational app, integration, or workflow automation from MooreTech Solutions LLC.",
  },
  "/about": {
    title: "About MooreTech Solutions LLC | Practical Technology Company",
    description:
      "Meet the Northeast Arkansas team behind MooreTech Solutions LLC and learn how we build understandable software for practical business operations.",
  },
  "/careers": {
    title: "Careers at MooreTech Solutions LLC",
    description:
      "Learn how MooreTech Solutions LLC approaches hiring and introduce yourself for future product, development, customer success, or sales opportunities.",
  },
  "/contact": {
    title: "Contact MooreTech Solutions LLC | Text or Email",
    description:
      "Contact MooreTech Solutions LLC about Ironline Office, a custom software request, a partnership, careers, or a general company question.",
  },
  "/security": {
    title: "Security & Data Practices | MooreTech Solutions LLC",
    description:
      "Review MooreTech Solutions LLC's practical approach to access, data minimization, vendors, incident communication, and responsible software delivery.",
  },
  "/privacy": {
    title: "Privacy Policy | MooreTech Solutions LLC",
    description:
      "Read how MooreTech Solutions LLC handles website inquiries, contact information, operational analytics, hosting data, and third-party links.",
  },
  "/terms": {
    title: "Website Terms | MooreTech Solutions LLC",
    description:
      "Review the terms that apply when using the MooreTech Solutions LLC company website or sending a product, project, or career inquiry.",
  },
};

function upsertMeta(selector, attribute, value, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export default function SiteMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = pageMeta[pathname] || {
      title: "Page not found | MooreTech Solutions LLC",
      description: company.siteDescription,
    };
    const canonicalUrl =
      company.siteUrl.replace(/\/$/, "") + (pathname === "/" ? "/" : pathname);

    document.title = meta.title;

    upsertMeta('meta[name="description"]', "name", "description", meta.description);
    upsertMeta('meta[name="robots"]', "name", "robots", pageMeta[pathname] ? "index,follow" : "noindex,follow");
    upsertMeta('meta[property="og:title"]', "property", "og:title", meta.title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", meta.description);
    upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
    upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", company.legalName);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    upsertMeta('meta[property="og:image"]', "property", "og:image", company.socialImageUrl);
    upsertMeta('meta[property="og:image:alt"]', "property", "og:image:alt", "MooreTech Solutions LLC");
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", meta.title);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", meta.description);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", company.socialImageUrl);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);
  }, [pathname]);

  return null;
}

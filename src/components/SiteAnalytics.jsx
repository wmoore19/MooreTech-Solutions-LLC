import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackSiteEvent } from "@/lib/siteAnalytics";

export default function SiteAnalytics() {
  const { pathname } = useLocation();

  useEffect(() => {
    let referrerHost = "";
    try {
      referrerHost = document.referrer ? new URL(document.referrer).hostname : "";
    } catch {
      referrerHost = "";
    }

    trackSiteEvent("company_site_page_view", {
      path: pathname,
      referrer_host: referrerHost,
    });
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target.closest?.("[data-track-event]");
      if (!target) return;

      trackSiteEvent(target.dataset.trackEvent, {
        path: window.location.pathname,
        placement: target.dataset.trackPlacement || "page",
        destination: target.dataset.trackDestination || "internal",
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}

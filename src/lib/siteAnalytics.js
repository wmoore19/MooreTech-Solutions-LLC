import { base44 } from "@/api/base44Client";

export function trackSiteEvent(eventName, properties = {}) {
  try {
    base44.analytics.track({
      eventName,
      properties,
    });
  } catch {
    // Analytics must never interrupt the visitor's task.
  }
}

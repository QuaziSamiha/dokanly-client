import { sendGTMEvent } from "@next/third-parties/google";
import { isAnalyticsEnabled } from "@/config/gtm.config";
import type { GA4Event } from "./gtm-events.types";

export function trackEvent(event: GA4Event): void {
  if (!isAnalyticsEnabled() || typeof window === "undefined") return;
  sendGTMEvent({ event: event.name, ...event.params });
}

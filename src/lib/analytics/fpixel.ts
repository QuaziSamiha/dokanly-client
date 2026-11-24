//* the Meta base script
import { FACEBOOK_PIXEL_ID } from "@/config/env.config";

export const FB_PIXEL_ID = FACEBOOK_PIXEL_ID; // THIS UNIQUELY IDENTIFIES WEBSITE INSIDE META
// console.log("DEBUG: FB_PIXEL_ID value is:", FB_PIXEL_ID);

// * REUSABLE HELPER FUNCTION
export const pageview = (): void => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
};

// * GENERIC EVEN FUNCTION - REUSABLE EVENT TRACKING HELPER FUNCTION
export const event = (
  name: string,
  options: Record<string, unknown> = {},
): void => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", name, options);
  }
};

/**
 * Benefits: reusable, maintainable, type-safe, scalable
 */

/**
Example Usage:

event("Purchase", {
  value: 100,
  currency: "USD",
});

INTERNALLY: 
fbq("track", "Purchase", {
  value: 100
});

or:

event("AddToCart");
*/

This document explains how Google Tag Manager (GTM) and Google Analytics 4 (GA4) fit together, what Consent Mode is and why it matters, and the planned implementation structure for wiring them into this project.

This is a **planning/reference document**. It describes the intended architecture before the code exists — check the actual `src/lib/analytics/` folder for the current implementation status.

---

## 1. Why GTM in front of GA4 (instead of GA4 directly)

Talking to GA4 directly (`gtag.js`) means every new tracking tool (Meta Pixel, Hotjar, a new GA4 property, etc.) requires a code change and a deploy.

Putting GTM in front of GA4 means the **app only ever ships one tag — the GTM container ID**. Everything downstream of that (which analytics tools receive data, which events map to which tags) is configured in the GTM web UI, with no deploy required.

```text
Next.js app  →  dataLayer (window.dataLayer)  →  GTM container  →  GA4 / Meta Pixel / etc.
```

The app's only responsibility is pushing well-defined events into `dataLayer`. GTM decides what happens to them.

---

## 2. Google-side setup (done once, outside the codebase)

1. **Create a GTM container** at [tagmanager.google.com](https://tagmanager.google.com) → Create Account → Container type "Web" → yields a `GTM-XXXXXXX` ID.
2. **Create a GA4 property** (if one doesn't exist for this project) at [analytics.google.com](https://analytics.google.com) → Admin → Create Property → Web data stream → yields a `G-XXXXXXX` Measurement ID.
3. **Link GA4 inside GTM**: GTM → Tags → New → Tag type "Google Analytics: GA4 Configuration" → paste the `G-XXXXXXX` ID → Trigger: "All Pages" → Save.
4. **Publish** the container (GTM → "Submit", top right). Changes only take effect after publishing — GTM's workspace view lets you preview/test before that.

**Key consequence**: the Measurement ID (`G-XXXXXXX`) lives inside the GTM container config, not in this codebase. The app only needs `NEXT_PUBLIC_GTM_ID`.

### Note on the "Website URL" field during GA4 stream creation

When creating the web data stream in GA4 (Admin → Data streams → Add stream → Web), you're asked for a **Website URL** and **Stream name**. Neither needs to be live or correct at creation time:

- GA4 doesn't validate or ping that URL when the stream is created — it's just a label, editable later under Property → Data Streams without changing the Measurement ID.
- If the production domain is already known, use it (e.g. `thaihealthproduct.com`). If not deployed yet, a placeholder (`localhost:3000`, `example.com`) is fine — update it once the real domain exists.
- Use a descriptive **Stream name** (e.g. `THP Production`) instead of the default "My Website" — it's only for organizing streams inside the GA4 dashboard.
- "Enhanced measurement" (scrolls, outbound clicks, etc.) can stay on — it's independent of the GTM wiring described in this doc and doesn't conflict with it.

---

## 3. Package choice: `@next/third-parties`

Use Next.js's own `@next/third-parties/google` package rather than a hand-rolled `<Script>` tag. It is the framework-maintained integration for this Next.js version, and it lazy-loads GTM **after hydration** by default, which avoids competing with the app's own bundle for the main thread on first load.

```bash
npm install @next/third-parties
```

Exposes:
- `<GoogleTagManager gtmId="GTM-XXXX" />` — mounted once in the root layout.
- `sendGTMEvent(payload)` — pushes a custom event into `dataLayer` from anywhere in the client tree.

---

## 4. Implementation structure

```text
src/
  lib/
    analytics/
      index.ts              # barrel — the only import path used elsewhere
      gtm.config.ts          # isAnalyticsEnabled(), getGtmId()
      events.ts              # trackEvent(), trackPageView() — wraps sendGTMEvent
      events.types.ts        # typed GA4 event union (view_item, add_to_cart, purchase...)
  config/
    env.config.ts            # add getGtmId() alongside the existing getBaseUrl()
instrumentation-client.ts     # pushes the consent default BEFORE hydration,
                               # tracks SPA pageviews via onRouterTransitionStart
```

### Why `instrumentation-client.ts` matters here

`@next/third-parties`'s `<GoogleTagManager>` loads its script **after hydration**. `instrumentation-client.ts` runs **before** hydration. That ordering is exactly why the default-denied consent push must live there and not inside a React component — it has to exist in `dataLayer` before GTM's script ever executes, otherwise there's a window where tags could fire with no consent signal at all.

It's also the place to track pageviews on client-side route changes: GTM does not auto-detect SPA navigations the way `gtag.js` does, so each route change needs an explicit `dataLayer` push via the `onRouterTransitionStart` hook.

### Environment variables

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

Added to `.env.development`, `.env.production`, and `.env.office`. When unset, `isAnalyticsEnabled()` returns `false` and the GTM component never mounts — so local dev never sends data into production GA4.

### File sketches

`src/config/env.config.ts`:
```ts
export const getGtmId = (): string | undefined => process.env.NEXT_PUBLIC_GTM_ID;
```

`src/config/gtm.config.ts`:
```ts
import { getGtmId } from "@/config/env.config";

export const isAnalyticsEnabled = (): boolean => Boolean(getGtmId());
```

`instrumentation-client.ts` (project root):
```ts
window.dataLayer = window.dataLayer || [];
function gtag(...args: unknown[]) {
  window.dataLayer.push(args);
}
gtag("consent", "default", {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
});

export function onRouterTransitionStart(url: string) {
  window.dataLayer?.push({ event: "page_view", page_path: url });
}
```

`src/lib/analytics/gtm.consent.ts`:
```ts
type ConsentState = "granted" | "denied";

export function updateConsent(state: ConsentState) {
  window.dataLayer?.push(["consent", "update", {
    analytics_storage: state,
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  }]);
  localStorage.setItem("cookie-consent", state);
}

export function getStoredConsent(): ConsentState | null {
  return localStorage.getItem("cookie-consent") as ConsentState | null;
}
```

`src/lib/analytics/gtm-events.types.ts` — typed event union, extendable as features grow:
```ts
export type GA4Event =
  | { name: "view_item"; params: { item_id: string; item_name: string; value: number; currency: "THB" } }
  | { name: "add_to_cart"; params: { item_id: string; item_name: string; quantity: number; value: number; currency: "THB" } }
  | { name: "purchase"; params: { transaction_id: string; value: number; currency: "THB"; items: unknown[] } };
```

`src/lib/analytics/gtm.events.ts`:
```ts
import { sendGTMEvent } from "@next/third-parties/google";
import { isAnalyticsEnabled } from "@/config/gtm.config";
import type { GA4Event } from "./events.types";

export function trackEvent(event: GA4Event) {
  if (!isAnalyticsEnabled() || typeof window === "undefined") return;
  sendGTMEvent({ event: event.name, ...event.params });
}
```

`src/app/[locale]/layout.tsx` — mounted once at the root, gated by `isAnalyticsEnabled()`:
```tsx
import { GoogleTagManager } from "@next/third-parties/google";
import { getGtmId } from "@/config/env.config";
import { isAnalyticsEnabled } from "@/config/gtm.config";
import CookieConsentBanner from "@/components/feedback/consent/CookieConsentBanner";

// inside the returned JSX:
{isAnalyticsEnabled() && <GoogleTagManager gtmId={getGtmId()!} />}
...
<CookieConsentBanner />
```

`CookieConsentBanner.tsx` calls `updateConsent("granted")` / `updateConsent("denied")` on click, and only renders while `getStoredConsent()` is `null`.

---

## 5. What this buys

- **One chokepoint** — every feature imports from `lib/analytics`, never `sendGTMEvent` directly. Swapping the tag manager later touches one file.
- **Env-gated** — analytics silently no-ops when `NEXT_PUBLIC_GTM_ID` is unset, so CI and local dev never pollute production GA4 data.
- **Compliant by default** — Consent Mode v2 defaults to denied; tags only fire after explicit accept.
- **Ecommerce-ready** — the typed event union anticipates `view_item` / `add_to_cart` / `purchase` since this is a product-selling app, so wiring tracking into product/cart/order components later is a one-liner against an existing schema, not a redesign.

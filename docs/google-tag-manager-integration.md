# Google Tag Manager Integration — Natura Care

**Date:** 2026-06-03
**Project:** Natura Care (Next.js 15 App Router)
**GTM Container ID:** `GTM-WD6JPSJS`

---

## Overview

Google Tag Manager (GTM) is embedded site-wide using the official `@next/third-parties/google` package. It runs on every page and allows the client to deploy marketing/analytics tags (Google Ads, Facebook Pixel events, conversion tracking, etc.) from the GTM dashboard without touching the codebase.

---

## What is Google Tag Manager (GTM)?

**Google Tag Manager (GTM)** is a free tag management system provided by Google. It allows you to manage and deploy marketing tags (snippets of code or tracking pixels) on your website or mobile app without having to modify the underlying source code every time.

Instead of hardcoding tracking scripts directly into your project, you install a single GTM container code. From that point on, you manage all your tracking codes from a web-based user interface.

---

## What Does It Do & How Does It Work?

### What It Does

- **Centralizes Code Snippets:** Keeps all your third-party scripts (Google Analytics, Meta Pixel, Hotjar, Google Ads tracking) in one organized dashboard.
- **Triggers Specific Events:** Tracks user behavior like button clicks, form submissions, video plays, scroll depth, and file downloads.
- **Improves Performance:** GTM loads tags asynchronously, meaning a slow-loading tracking script won't block the rest of your page from rendering.
- **Version Control:** Allows you to test changes in a preview mode, create versions, and roll back to previous setups if a tag breaks something on the site.

### How It Works

GTM operates using three core components: **Tags**, **Triggers**, and **Variables**.

```
[ User Action ] ---> [ Trigger Fires ] ---> [ Tag Executes ]
                            ^
                            |
                     [ Using Variables ]

```

1. **Tags:** _What_ data is being sent. A tag is the actual code snippet (e.g., Google Analytics 4 Event code) that executes on your site.
2. **Triggers:** _When_ the data is sent. A trigger listens for specific events on your website (e.g., "Page View on `/thank-you`" or "Click on the 'Submit' button"). When the condition is met, it tells the tag to fire.
3. **Variables:** _Information_ needed by tags and triggers. Variables are placeholders for values that change (e.g., the URL of the current page, a product price, or a custom form ID).

---

## What is the Relation with Google Analytics and Meta Pixel?

A common point of confusion is whether GTM replaces Google Analytics or the Meta (Facebook) Pixel. **It does not.** Think of GTM as the **delivery truck**, while Google Analytics and the Meta Pixel are the **packages** inside.

| Tool                       | Role                                                                                                                                                                  | Analogy               |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **Google Tag Manager**     | **The Management Layer:** It collects, routes, and deploys tracking scripts based on user interactions. It doesn't analyze data; it just sends it.                    | The Router / Pipeline |
| **Google Analytics (GA4)** | **The Analytics Engine:** It receives data _from_ GTM, processes it, and generates reports on user demographics, traffic sources, and behavior trends.                | The Report Dashboard  |
| **Meta Pixel**             | **The Advertising Tracker:** It receives user action data _from_ GTM to build custom ad audiences on Facebook/Instagram, track ad conversions, and optimize ad spend. | The Ad Optimizer      |

### Without GTM vs. With GTM

- **Without GTM:** You would have to manually paste the Google Analytics base code, the Meta Pixel base code, and individual JavaScript event listeners for every single button or form you want to track directly into your codebase.
- **With GTM:** You paste the GTM container code once. When a user clicks a button, GTM captures that event and simultaneously routes it to _both_ Google Analytics and the Meta Pixel using tags you set up in the GTM UI.

---

## How to Implement Google Tag Manager

Implementing GTM involves setting up the container and embedding it into your website architecture.

### Step 1: Create a GTM Account and Container

1. Go to the [Google Tag Manager](https://www.google.com/search?q=https://tagmanager.google.com/) website and sign in with your Google account.
2. Click **Create Account**.
3. Setup your **Account Name** (usually your company name) and **Container Name** (usually your website URL).
4. Select **Web** as the Target Platform and click **Create**.

### Step 2: Install the GTM Code on Your Website

Once the container is created, GTM will provide you with two code snippets.

- **Snippet 1 (JavaScript):** Paste this as high up in the `<head>` of your page as possible.
- **Snippet 2 (noscript iframe):** Paste this immediately after the opening `<body>` tag (this serves as a fallback for users with JavaScript disabled).

#### Modern Frontend Implementation (e.g., Next.js App Router)

If you are working with a modern single-page application framework like Next.js, you shouldn't just paste raw scripts into a static HTML file. You can utilize the built-in Third-Party Libraries support.

For instance, in **Next.js (App Router)**, you can add it directly to your root `layout.tsx` using `@next/third-parties`:

```tsx
import { GoogleTagManager } from "@next/third-parties/google";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="GTM-XXXXXXX" />
      <body>{children}</body>
    </html>
  );
}
```

### Step 3: Add Google Analytics & Meta Pixel via GTM

Once GTM is embedded in your code, you never have to touch the codebase again for basic tracking. To add your tags:

1. Go to your GTM Dashboard and click **Tags** > **New**.
2. **For GA4:** Choose **Tag Configuration** > **Google Analytics** > **Google Tag**, and enter your GA4 Measurement ID (`G-XXXXXXXXXX`). Set the trigger to **Initialization - All Pages**.
3. **For Meta Pixel:** Choose **Tag Configuration** > **Custom HTML**, and paste your Meta Pixel base code. Set the trigger to **Initialization - All Pages** or **All Pages**.
4. Click **Preview** at the top right to test if your tags fire correctly using GTM Tag Assistant, and then click **Submit** to publish your changes live to your production site.

Would you like to walk through how to pass dynamic data (like product prices or e-commerce IDs) from your application into GTM using the Data Layer?

## Implementation

### Environment Variable

| File               | Variable             | Value          |
| ------------------ | -------------------- | -------------- |
| `.env.development` | `NEXT_PUBLIC_GTM_ID` | `GTM-WD6JPSJS` |
| `.env.production`  | `NEXT_PUBLIC_GTM_ID` | `GTM-WD6JPSJS` |
| `.env.local`       | `NEXT_PUBLIC_GTM_ID` | `GTM-WD6JPSJS` |

### Config Export

**`src/config/env.config.ts`**

```ts
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
```

### Layout Integration

**`src/app/layout.tsx`**

Two snippets are required by GTM — both are rendered conditionally so the app doesn't break if the env var is ever absent.

**1. Script tag (in `<head>`)** — injected via `GoogleTagManager` placed inside `<html>` but outside `<body>`:

```tsx
{
  GTM_ID && <GoogleTagManager gtmId={GTM_ID} />;
}
```

**2. Noscript fallback (first child of `<body>`)** — activates GTM in browsers with JavaScript disabled:

```tsx
{
  GTM_ID && (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
```

---

## Package Used

`@next/third-parties` (already a project dependency, version `^16.2.6`)  
Import: `import { GoogleTagManager } from "@next/third-parties/google"`

No extra package installation was needed.

---

## How to Verify It's Working

1. Run the dev server: `npm run dev`
2. Open the browser DevTools → Network tab → filter by `gtm.js`
3. A request to `https://www.googletagmanager.com/gtm.js?id=GTM-WD6JPSJS` should appear on page load
4. Alternatively install the **Google Tag Assistant** Chrome extension and confirm the container `GTM-WD6JPSJS` is detected

---

## GTM Dashboard Access

The client manages all tags, triggers, and variables from:  
`https://tagmanager.google.com` → Container `GTM-WD6JPSJS`

To add new tracking (e.g. a conversion event), the client creates a tag in GTM and publishes — no code change required on the frontend.

---

## Relationship to Google Analytics

GA4 (`G-JEVY2XHR4B` in production) is loaded separately via `<GoogleAnalytics>` in the same layout. GTM can also fire GA4 events, so the client should avoid duplicate GA4 configuration inside GTM to prevent double-counting.

---

## Conceptual Overview

### What is GTM?

GTM is a **tag management system** — a single container script added to the site once. After that, third-party tracking scripts (tags) are deployed, updated, and managed via the GTM web dashboard without touching the codebase.

### How it Works

```
Your Website
    └── GTM Container Snippet (one-time code addition)
            └── GTM Dashboard (web UI)
                    ├── Tags      → What to fire (GA4, Meta Pixel, etc.)
                    ├── Triggers  → When to fire (page load, button click, form submit)
                    └── Variables → Dynamic data (URL, element text, user ID)
```

**Flow:** User visits page → GTM loads → Trigger condition met → Tag fires → Data sent to GA4/Meta/etc.

---

## Role of Each Tool

| Tool                         | Role                                                                        |
| ---------------------------- | --------------------------------------------------------------------------- |
| **GTM**                      | The **delivery vehicle** — manages and deploys tags                         |
| **Google Analytics 4 (GA4)** | The **analytics tool** — tracks behavior, sessions, conversions             |
| **Meta Pixel**               | The **ad attribution tool** — tracks conversions for Facebook/Instagram ads |

GTM does not collect data itself. It fires GA4 and Meta Pixel on your behalf — cleanly, without scattering scripts across the codebase.

---

## Benefits

- **No-code tag deployment** — marketers add/update tags without developer involvement
- **Version control** — every GTM publish is versioned; one-click rollback available
- **Async loading** — tags load without blocking page render
- **Single source of truth** — all tracking scripts managed in one place
- **Preview/debug mode** — test tags before publishing to production
- **Fewer deploy cycles** — adding a new pixel requires zero code changes

---

## Adding Tags via GTM Dashboard

### GA4 Event Tag

1. GTM → **Tags → New**
2. Tag type: **Google Analytics: GA4 Configuration**
3. Enter Measurement ID (`G-JEVY2XHR4B`)
4. Trigger: **All Pages**
5. Save → **Publish**

> Do not add GA4 configuration inside GTM if `<GoogleAnalytics>` is already in the layout — it will double-count pageviews.

### Meta Pixel Tag

1. GTM → **Tags → New**
2. Tag type: **Custom HTML**
3. Paste the Meta Pixel base code from Meta Events Manager
4. Trigger: **All Pages**
5. Save → **Publish**

---

## Tracking Custom Events

Push events from React components to GTM's `dataLayer`:

```tsx
// e.g., on "Add to Cart" button click
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "add_to_cart",
  item_name: "Rose Face Serum",
  value: 29.99,
  currency: "BDT",
});
```

In GTM, create a **Custom Event trigger** on `event = add_to_cart`, then attach GA4 Event and/or Meta Pixel tags to it.

---

## Testing Checklist

| Check                    | Tool                                   |
| ------------------------ | -------------------------------------- |
| GTM container loads      | DevTools → Network → filter `gtm.js`   |
| Tags fire correctly      | GTM **Preview Mode**                   |
| GA4 events arrive        | GA4 → Realtime → DebugView             |
| Meta Pixel events arrive | **Meta Pixel Helper** Chrome extension |

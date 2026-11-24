# Meta Pixel — Frontend Technical Documentation

> **Scope:** how the Natura Care client (Next.js 15, App Router) reports shopper activity to **Meta (Facebook / Instagram)**: how the Pixel is loaded, which storefront actions become Meta events, what data each event carries, how product IDs line up with the Meta product catalog, who is and isn't tracked, and how to change, test or roll back the setup.
>
> **Audience:** frontend engineers joining or maintaining the project, and anyone who has to answer "why does Events Manager show X?".
>
> **Related:** [Project README](../README.md) (run, build, Docker) · [GTM client setup guide](./concepts/analytics-setup-guide-for-client.md) (the GTM container, step by step) · [GTM + GA4 concepts](./concepts/analytics-gtm-ga4.md) · [GTM integration notes](../claude-docs/google-tag-manager-integration.md) · [Product module](./product.md) · [Cart module](./cart.md) · [Order module](./order.md) · [User module](./user.md) (roles, middleware)

| | |
|---|---|
| **Delivery mechanism** | **Google Tag Manager** — the Meta Pixel is a set of tags inside the GTM container, not code in this repo |
| **App's responsibility** | Push typed ecommerce events into `window.dataLayer` via [`trackEvent()`](../src/lib/analytics/gtm.events.ts) |
| **Kill switch** | `NEXT_PUBLIC_GTM_ID` — unset ⇒ no GTM, no Pixel, `trackEvent()` is a no-op |
| **Prod Pixel / dataset** | `2510190342726231` (configured in GTM container `GTM-WD6JPSJS`) |
| **Catalog feed** | `GET {API}/n-care/api/v1/feeds/datafeed.csv` (backend, [`natura-care-server/src/modules/feed/`](../../natura-care-server/src/modules/feed/)) |
| **Tracked users** | Guests and `CUSTOMER`s on the storefront. `ADMIN` / `EMPLOYEE` are blocked from cart events but still produce `PageView`s ([§6.3](#63-who-is-tracked)) |
| **Legacy path** | Direct Pixel loader (`FacebookPixel.tsx` + `public/scripts/pixel.js`) — still in the repo, **disabled** ([§14](#14-legacy-direct-pixel--rollback)) |
| **Last reviewed** | 2026-10-24 |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
   - [3.1 Data flow](#31-data-flow)
   - [3.2 Why GTM instead of a direct Pixel](#32-why-gtm-instead-of-a-direct-pixel)
4. [File Architecture](#4-file-architecture)
5. [Environments & Configuration](#5-environments--configuration)
6. [Routes & Role-Based Access](#6-routes--role-based-access)
   - [6.1 Where each event can fire](#61-where-each-event-can-fire)
   - [6.2 Middleware rules that affect tracking](#62-middleware-rules-that-affect-tracking)
   - [6.3 Who is tracked](#63-who-is-tracked)
7. [Event Catalogue](#7-event-catalogue)
   - [7.1 dataLayer → Meta mapping](#71-datalayer--meta-mapping)
   - [7.2 Payload reference](#72-payload-reference)
8. [Workflows (the shopper journey)](#8-workflows-the-shopper-journey)
   - [8.1 Landing & navigation — `PageView`](#81-landing--navigation--pageview)
   - [8.2 Product page — `ViewContent`](#82-product-page--viewcontent)
   - [8.3 Add to cart — `AddToCart`](#83-add-to-cart--addtocart)
   - [8.4 Remove from cart — `RemoveFromCart`](#84-remove-from-cart--removefromcart)
   - [8.5 Checkout — `InitiateCheckout`](#85-checkout--initiatecheckout)
   - [8.6 Order placed — `Purchase`](#86-order-placed--purchase)
9. [Product Identity & the Meta Catalog](#9-product-identity--the-meta-catalog)
   - [9.1 The `content_id` contract](#91-the-content_id-contract)
   - [9.2 The catalog feed](#92-the-catalog-feed)
   - [9.3 How the admin section feeds Meta](#93-how-the-admin-section-feeds-meta)
10. [Consent](#10-consent)
11. [GTM Container Configuration](#11-gtm-container-configuration)
12. [Types](#12-types)
13. [Constants, Config, Helpers & Components](#13-constants-config-helpers--components)
    - [13.1 Config & constants](#131-config--constants)
    - [13.2 Helpers & hooks](#132-helpers--hooks)
    - [13.3 Reusable components](#133-reusable-components)
14. [Legacy Direct Pixel & Rollback](#14-legacy-direct-pixel--rollback)
15. [Testing & Verification](#15-testing--verification)
16. [Business Rules Summary](#16-business-rules-summary)
17. [Known Issues & Technical Debt](#17-known-issues--technical-debt)
18. [How-To Recipes](#18-how-to-recipes)
19. [Glossary](#19-glossary)

---

## 1. Overview

The Meta Pixel tells Meta what shoppers do on `naturacarebd.com` so the marketing team can **measure ad conversions, build retargeting audiences (e.g. "added to cart but didn't buy") and run catalog / Advantage+ ads** that show the exact product a shopper looked at.

The client **never talks to Meta directly**. It describes what happened in a vendor-neutral, GA4-shaped event (`view_item`, `add_to_cart`, …) and pushes it into `window.dataLayer`. The GTM container — configured in the Google Tag Manager web UI, outside this repo — turns those into Meta Pixel events (`ViewContent`, `AddToCart`, …) and also into GA4 events. One push, two destinations.

| Shopper action | dataLayer event | Meta event | Fired from |
|---|---|---|---|
| Opens any page / navigates | *(GTM page view)* | `PageView` | GTM "All Pages" trigger |
| Opens a product page | `view_item` | `ViewContent` | [`ProductDetails.tsx`](../src/modules/product/public/product-details/ProductDetails.tsx#L54-L75) |
| Adds to cart (grid, details page, wishlist) | `add_to_cart` | `AddToCart` | [`ProductCard.tsx`](../src/modules/product/shared/ProductCard.tsx#L70-L79), [`DetailsWithAction.tsx`](../src/modules/product/public/product-details/DetailsWithAction.tsx#L92-L101), [`WishlistCard.tsx`](../src/modules/wishlist/customer/WishlistCard.tsx#L31-L40) |
| Removes a line / clears cart | `remove_from_cart` | `RemoveFromCart` *(custom)* | [`CartItems.tsx`](../src/modules/cart/public/CartItems.tsx#L18-L30) |
| Opens checkout with items | `begin_checkout` | `InitiateCheckout` | [`CheckOut.tsx`](../src/modules/checkout/public/CheckOut.tsx#L108-L125) |
| Order placed successfully | `purchase` | `Purchase` | [`CheckOut.tsx`](../src/modules/checkout/public/CheckOut.tsx#L274-L287) |

Key design decisions:

- **GTM is the only third-party script the app ships.** Pixel ID, event mapping and new tags are changed in GTM and published — no code change, no rebuild ([§3.2](#32-why-gtm-instead-of-a-direct-pixel)).
- **One typed entry point.** Every event goes through `trackEvent()`, whose argument is a discriminated union (`GA4Event`). A misspelled event name or a missing field is a compile error ([§12](#12-types)).
- **Tracking is fire-and-forget.** `trackEvent()` never throws, never awaits and is a no-op on the server or when GTM is not configured. Tracking can never break add-to-cart or checkout.
- **Product IDs must match the catalog feed.** The ID the Pixel sends (`content_ids`) is `sku`, falling back to `PROD_<id>` — the same rule the backend feed uses ([§9](#9-product-identity--the-meta-catalog)).
- **Staff can't generate commerce events.** `ADMIN` / `EMPLOYEE` are stopped before the add-to-cart call and are redirected away from cart and checkout ([§6.3](#63-who-is-tracked)).
- **The old direct-Pixel code is kept for rollback**, commented out at every call site with a `LEGACY` marker ([§14](#14-legacy-direct-pixel--rollback)).

[↑ Back to top](#table-of-contents)

---

## 2. Tech Stack

| Concern | Technology | Notes |
|---|---|---|
| Framework | Next.js 15.5 (App Router), React 19 | All emitters are client components (`"use client"`). |
| Tag manager | `@next/third-parties/google` → `<GoogleTagManager>`, `sendGTMEvent()` | Official Next.js wrapper; loads `gtm.js` after hydration and owns `window.dataLayer`. |
| Pixel (via GTM) | GTM Community Template **"Meta Pixel"** with *Use GA4 dataLayer Integration* | Configured in the GTM UI ([§11](#11-gtm-container-configuration)). |
| Pixel (legacy) | `next/script` + hand-written base code in `public/scripts/pixel.js` | Disabled. |
| Types | TypeScript ambient declarations (`*.d.ts`) | `window.dataLayer`, `window.fbq`. |
| Catalog feed | NestJS + Prisma (backend) | CSV generated on each request. |
| Build-time config | `NEXT_PUBLIC_*` env vars baked into the bundle | Docker `--build-arg`s — see [README → Docker](../README.md#docker). |

[↑ Back to top](#table-of-contents)

---

## 3. Architecture

### 3.1 Data flow

```text
┌──────────────────────────── Browser (naturacarebd.com) ───────────────────────────┐
│                                                                                     │
│  RootLayout (src/app/layout.tsx)                                                    │
│    └─ isAnalyticsEnabled() ? <GoogleTagManager gtmId=…/> + <noscript> iframe        │
│                                                                                     │
│  Storefront component (ProductCard, CheckOut, …)                                    │
│    └─ trackEvent({ name: "add_to_cart", params: {…} })      src/lib/analytics       │
│         └─ guard: GTM configured? running in browser?                               │
│              └─ sendGTMEvent({ event: "add_to_cart", item_id, value, … })           │
│                   └─ window.dataLayer.push(…)                                       │
│                                                                                     │
│  GTM container (GTM-WD6JPSJS, loaded from googletagmanager.com)                     │
│    ├─ Trigger "Event - Add to Cart"  (Custom Event = add_to_cart)                   │
│    ├─ Tag "AddToCart"   → Meta Pixel template → fbq('track','AddToCart',{…})  ──────┼──► Meta Events Manager
│    └─ Tag GA4 event                                                         ──────┼──► Google Analytics 4
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────── natura-care-server ────────────┐
│ GET /n-care/api/v1/feeds/datafeed.csv      │  ◄── scheduled fetch by Meta Commerce Manager
│ (active products → id,title,price,link,…)  │  ──►  Meta product catalog
└────────────────────────────────────────────┘

Meta joins the two on content_ids (Pixel) == id (catalog) → dynamic / catalog ads.
```

### 3.2 Why GTM instead of a direct Pixel

The project started with a hand-rolled Pixel loader ([§14](#14-legacy-direct-pixel--rollback)) and moved to GTM. The trade-off:

| | Direct Pixel (legacy) | GTM (current) |
|---|---|---|
| Change Pixel ID / add an event mapping | Code change + Docker rebuild + deploy | Edit in GTM UI + **Publish** |
| Add another vendor (TikTok, Google Ads) | New loader + new calls everywhere | New tag on existing triggers |
| SPA page views | Manual `usePathname` effect | GTM History Change / "All Pages" trigger |
| Code in app | Two event vocabularies (Meta + GA4) | One (GA4-shaped), mapped by GTM |
| Risk | Developer owns everything | Marketing can break tracking without a deploy — **GTM versions are the audit trail** |

[↑ Back to top](#table-of-contents)

---

## 4. File Architecture

```text
natura-care-client/
├── public/scripts/
│   └── pixel.js                                   LEGACY  Meta base code (IIFE), reads data-pixel-id, inits + PageView
├── src/
│   ├── app/
│   │   └── layout.tsx                             Mounts <GoogleTagManager> + <noscript> iframe; <FacebookPixel/> commented out
│   ├── config/
│   │   ├── env.config.ts                          GTM_ID, FACEBOOK_PIXEL_ID (legacy) from NEXT_PUBLIC_* vars
│   │   └── gtm.config.ts                          getGtmId(), isAnalyticsEnabled()  ← global kill switch
│   ├── lib/analytics/
│   │   ├── index.ts                               Barrel: trackEvent, updateConsent, getStoredConsent, GA4Event, …
│   │   ├── gtm.events.ts                          trackEvent()  ← THE way to emit an event
│   │   ├── gtm-events.types.ts                    GA4Event discriminated union (the event contract)
│   │   ├── gtm.consent.ts                         updateConsent(), getStoredConsent()  (localStorage "cookie-consent")
│   │   ├── fpixel.ts                              LEGACY  pageview(), event() wrappers over window.fbq
│   │   └── ga-data.server.ts                      (not Pixel) GA4 Data API for the admin /analytics dashboard
│   ├── components/
│   │   ├── layout/scripts/FacebookPixel.tsx       LEGACY  next/script loader + SPA PageView on route change
│   │   └── feedback/consent/CookieConsentBanner.tsx   Accept / Decline banner — NOT mounted anywhere (§10)
│   ├── types/analytics/
│   │   ├── gtm.d.ts                               window.dataLayer
│   │   └── facebook.d.ts                          window.fbq / window._fbq (legacy path)
│   └── modules/                                   ── event emitters ──
│       ├── product/
│       │   ├── shared/ProductCard.tsx                         add_to_cart  (product grids & carousels)
│       │   └── public/product-details/
│       │       ├── ProductDetails.tsx                         view_item
│       │       ├── DetailsWithAction.tsx                      add_to_cart  (Add to cart + Buy now)
│       │       └── product-details.utils.ts                   productItemId()  ← content_id rule
│       ├── wishlist/customer/WishlistCard.tsx                 add_to_cart  (from /my-account/wishlist)
│       ├── cart/public/CartItems.tsx                          remove_from_cart
│       └── checkout/public/CheckOut.tsx                       begin_checkout, purchase
├── Dockerfile                                     ARG NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_FACEBOOK_PIXEL_ID, …
└── .env.development / .env.qa / .env.production   Per-environment IDs (§5)

natura-care-server/src/modules/feed/               Meta catalog CSV feed (§9.2)
├── feed.controller.ts                             GET feeds/datafeed.csv
└── feed.service.ts                                generateProductsCsv()
```

**Rule of thumb:** to change *what* is tracked, edit an emitter in `src/modules/**`; to change *the contract*, edit `gtm-events.types.ts`; to change *where it goes* (Meta, GA4, IDs), edit the GTM container — not the code.

[↑ Back to top](#table-of-contents)

---

## 5. Environments & Configuration

| Variable | Read in | Used for | development | qa | production |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_GTM_ID` | [`env.config.ts`](../src/config/env.config.ts#L32) | Loads GTM; enables `trackEvent()` | `GTM-WF8C962M` | *unset* → **no tracking** | `GTM-WD6JPSJS` |
| `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` | [`env.config.ts`](../src/config/env.config.ts#L31) | **Legacy path only.** Not read at runtime while GTM is active | `2203263677076135` | `480005823093712` | `2510190342726231` |

- **The live Pixel ID lives in the GTM container**, not in the bundle. Changing `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` has no effect today.
- **Development and production use different GTM containers and Pixels on purpose** — dev points at the team's own test accounts so test orders never reach the client's ad account. Don't "fix" the mismatch.
- **`NEXT_PUBLIC_*` values are baked in at build time.** Changing `NEXT_PUBLIC_GTM_ID` means rebuilding the Docker image with the right `--build-arg` ([README → Docker](../README.md#docker)); a restart is not enough.
- `yarn development` (production build against the local API) uses `.env.development`, so it reports to the **dev** container — safe for demos.

[↑ Back to top](#table-of-contents)

---

## 6. Routes & Role-Based Access

### 6.1 Where each event can fire

GTM is mounted in the **root** layout, so it is present on **every** route group: `(public)`, `(customer)`, `(admin)` and `(error-page)`.

| Route | Route group | Who can open it | Events |
|---|---|---|---|
| `/`, `/product`, `/blog`, `/discover-more/*`, … | `(public)` | Everyone | `PageView`; `AddToCart` from any `ProductCard` |
| `/product-details/[slug]` | `(public)` | Everyone | `PageView`, `ViewContent`, `AddToCart` |
| `/my-cart` | `(public)` | Guest, `CUSTOMER` | `PageView`, `RemoveFromCart` |
| `/check-out` | `(public)` | Guest, `CUSTOMER` | `PageView`, `InitiateCheckout`, `Purchase` |
| `/my-account/wishlist` | `(customer)` | `CUSTOMER` | `PageView`, `AddToCart` |
| `/my-account/*` (other) | `(customer)` | `CUSTOMER` | `PageView` |
| `/dashboard`, `/products`, `/order-list`, … | `(admin)` | `ADMIN`, `EMPLOYEE` (subset) | `PageView` ⚠ ([§17](#17-known-issues--technical-debt)) |
| `/login`, `/create-account` | `(public)/(auth)` | Signed-out users | `PageView` |

### 6.2 Middleware rules that affect tracking

From [`src/middleware.ts`](../src/middleware.ts):

| Rule | Effect on Meta data |
|---|---|
| `GUEST_CUSTOMER_ONLY_ROUTES = ["/my-cart", "/check-out"]` — a signed-in `ADMIN` / `EMPLOYEE` is redirected to their dashboard | Staff can never fire `InitiateCheckout`, `Purchase` or `RemoveFromCart`. |
| `CUSTOMER_ROUTES = ["/my-account"]` — customers only | Wishlist `AddToCart` is customer-only. |
| `ADMIN_ONLY_ROUTES` / `EMPLOYEE_ROUTES` | Staff dashboards are reachable, and GTM loads there too → staff `PageView`s. |
| Public routes are open to everyone, any role | Staff browsing the storefront fire `PageView` and `ViewContent`. |

### 6.3 Who is tracked

| Role | `PageView` | `ViewContent` | `AddToCart` | `RemoveFromCart` / `InitiateCheckout` / `Purchase` |
|---|---|---|---|---|
| Guest | ✅ | ✅ | ✅ | ✅ |
| `CUSTOMER` | ✅ | ✅ | ✅ | ✅ |
| `EMPLOYEE` | ✅ (storefront **and** dashboard) | ✅ | ❌ blocked in UI | ❌ redirected by middleware |
| `ADMIN` | ✅ (storefront **and** dashboard) | ✅ | ❌ blocked in UI | ❌ redirected by middleware |

The add-to-cart guard is the same in every emitter — the role check runs **before** `localCart.addItem()` and `trackEvent()`, so a blocked click produces neither a cart line nor an event:

```ts
const canAddToCart = !userInfo?.role || userInfo.role === "CUSTOMER";
if (!canAddToCart) {
  toast.info("Admins and employees cannot add items to cart", { duration: 500 });
  return; // ← no cart write, no AddToCart
}
```

The app sends **no user identity** to Meta (no email, phone or user ID — no Advanced Matching). Meta attributes events through its own `_fbp` / `_fbc` cookies only.

[↑ Back to top](#table-of-contents)

---

## 7. Event Catalogue

### 7.1 dataLayer → Meta mapping

| dataLayer `event` | GTM trigger | Meta tag / event | Meta type | Fires when |
|---|---|---|---|---|
| *(gtm.js)* | All Pages | `Base PageView` → `PageView` | Standard | GTM loads, and on client-side navigation per the container's page trigger |
| `view_item` | `Event - View Item` | `ViewContent` | Standard | Product details data has loaded |
| `add_to_cart` | `Event - Add to Cart` | `AddToCart` | Standard | A line is written to the local cart |
| `remove_from_cart` | `Event - Remove from Cart` | `RemoveFromCart` | **Custom** | A line is removed, or the cart is cleared (one event per line) |
| `begin_checkout` | `Event - Initiate Checkout` | `InitiateCheckout` | Standard | `/check-out` mounts with ≥ 1 item (once per mount) |
| `purchase` | `Event - Purchase` | `Purchase` | Standard | `POST` order succeeds and the invoice is shown |

### 7.2 Payload reference

`trackEvent()` **spreads `params` flat** onto the dataLayer object: `{ event: "add_to_cart", item_id, item_name, quantity, value, currency }`. There is no nested `ecommerce` object (see [§17](#17-known-issues--technical-debt), item 2).

| Event | Fields | `item_id` source | `value` source |
|---|---|---|---|
| `view_item` | `item_id`, `item_name`, `value`, `currency` | `productItemId(product)` → `sku` ‖ `PROD_<id>` | `product.price` (list price, parent product) |
| `add_to_cart` — grid card | `item_id`, `item_name`, `quantity: 1`, `value`, `currency` | `sku` ‖ `PROD_<id>` | `product.price` (list price) |
| `add_to_cart` — details page | same | `productItemId(product)` (**parent** id, even for a size) | `price × qty` — size-aware, discount-aware |
| `add_to_cart` — wishlist | same | `sku` ‖ `PROD_<id>` | `discountPrice ?? price` |
| `remove_from_cart` | `item_id`, `item_name`, `quantity`, `value`, `currency` | `PROD_<id>` **always** ⚠ | `linePricing(item).lineTotal` |
| `begin_checkout` | `value`, `currency`, `items[]{item_id, item_name, quantity, price}` | `String(item.id)` ⚠ | `subTotal` from `useLocalCart()` |
| `purchase` | `transaction_id`, `value`, `currency`, `items[]` | `item.sku` ‖ `PROD_<productId>` | `invoice.grandTotal` (server total incl. delivery, after coupon) |

`currency` is always the literal `"BDT"` — enforced by the type.

[↑ Back to top](#table-of-contents)

---

## 8. Workflows (the shopper journey)

### 8.1 Landing & navigation — `PageView`

1. `RootLayout` renders `<GoogleTagManager gtmId>` when `isAnalyticsEnabled()`; a `<noscript>` iframe covers no-JS visitors.
2. GTM loads after hydration and fires the **Base PageView** tag on "All Pages".
3. Client-side navigations (App Router doesn't reload the page) are counted by the container's page-view trigger — the app does nothing per route. *(The legacy loader had to do this manually with `usePathname`; see [§14](#14-legacy-direct-pixel--rollback).)*

### 8.2 Product page — `ViewContent`

```text
/product-details/[slug]
  └─ ProductDetails: useGet(product by slug)
       └─ useEffect([productDetailsData]) → data present?
            └─ trackEvent({ name: "view_item", params: { item_id: productItemId(p), item_name, value: p.price, currency } })
```

- Fires once per loaded product. React Query's structural sharing keeps the same object on a background refetch with unchanged data, so it does not re-fire on window focus.
- Navigating between products (related-products carousel) fires a new `view_item` for each.

### 8.3 Add to cart — `AddToCart`

Three entry points, one shape:

```text
click "Add to cart"
  ├─ role guard (§6.3)            → blocked? toast, stop
  ├─ (details page) stock / size checks
  ├─ localCart.addItem({ id, variantId?, size?, name, price, discountPrice?, image, quantity })
  ├─ trackEvent({ name: "add_to_cart", … })
  └─ toast + free-delivery nudge, "Added!" state
```

- **Buy now** on the details page calls the same `addToCart()` and then routes to checkout, so it fires `AddToCart` followed by `InitiateCheckout`.
- Adding an existing line again increments the quantity locally and fires another `AddToCart` with the *added* quantity, not the new total.

### 8.4 Remove from cart — `RemoveFromCart`

- **Remove one line:** `handleRemove(item)` → `trackRemove(item)` → one event.
- **Clear cart:** `handleClear()` → `cartItems.forEach(trackRemove)` → one event **per line**.
- **Undo:** the line is restored to `localStorage`, but no compensating `AddToCart` is sent — Meta still sees a removal.
- Lines the cart drops automatically (out of stock, archived — see [Cart §5.3](./cart.md#53-stock-rules)) do **not** fire `RemoveFromCart`. That is correct: the shopper didn't remove them.

### 8.5 Checkout — `InitiateCheckout`

```ts
const hasTrackedCheckout = useRef(false);
useEffect(() => {
  if (cartItems.length > 0 && !hasTrackedCheckout.current) {
    hasTrackedCheckout.current = true;
    trackEvent({ name: "begin_checkout", params: { value: subTotal, currency: "BDT", items } });
  }
}, [cartItems, subTotal]);
```

- The `ref` guarantees **once per mount**, even though `cartItems` arrives asynchronously from `localStorage` and the price re-check.
- An empty cart never fires it. Leaving and re-entering `/check-out` fires again (a new checkout attempt — expected by Meta).

### 8.6 Order placed — `Purchase`

```text
Confirm order dialog → placeOrder (usePost) → 2xx
  └─ onSuccess(invoice)
       ├─ setInvoiceData / open invoice modal, clear cart
       └─ trackEvent({ name: "purchase", params: {
            transaction_id: invoice.orderId || invoice.sid,
            value: Number(invoice.grandTotal), currency: "BDT",
            items: invoice.orderItems.map(i => ({ item_id: i.sku || `PROD_${i.productId}`, … })) } })
```

- Values come from the **server's invoice**, not the cart — the backend re-prices, applies the coupon and adds delivery, so `Purchase.value` matches what the customer owes (Cash on Delivery included).
- A failed order (validation, stock, network) fires nothing.
- `Purchase` is browser-only. If the tab closes before the API responds, or an ad blocker stops GTM, the sale is lost to Meta ([§17](#17-known-issues--technical-debt), item 6).

[↑ Back to top](#table-of-contents)

---

## 9. Product Identity & the Meta Catalog

### 9.1 The `content_id` contract

Catalog ads only work if the ID on a Pixel event equals the `id` column of the catalog. Both sides use the same rule:

```ts
// client — src/modules/product/public/product-details/product-details.utils.ts
export const productItemId = (product: Pick<IProduct, "sku" | "id">) =>
  product.sku ? product.sku : `PROD_${product.id}`;

// server — natura-care-server/src/modules/feed/feed.service.ts
const id = prod.sku ? prod.sku : `PROD_${prod.id}`;
```

| Event | Follows the contract? |
|---|---|
| `ViewContent`, `AddToCart` (all 3), `Purchase` | ✅ |
| `RemoveFromCart` | ⚠ always `PROD_<id>` — wrong for products with a SKU |
| `InitiateCheckout` | ⚠ bare numeric id (`"42"`) — never matches |

**Any new emitter must use `productItemId()`** (or, for data without `sku`, carry `sku` through first). Don't invent a new format.

### 9.2 The catalog feed

| | |
|---|---|
| Endpoint | `GET https://api.naturacarebd.com/n-care/api/v1/feeds/datafeed.csv` (public, no auth) |
| Consumer | Meta Commerce Manager → Catalog → Data source (scheduled fetch) |
| Rows | Products with `status = ACTIVE` — **parent products only, no size variants** |
| Columns | `id`, `title`, `description` (HTML-stripped, first 150 chars), `availability` (`in stock` if `quantity > 0`), `condition` (`new`), `price` (`"<price> BDT"`), `link` (`{FRONTEND_URL}/product-details/<slug>`), `image_link` (primary active image, absolute) |
| Caching | `Cache-Control: no-cache` — generated live on each request |

> The comment in the server's `main.ts` says feed routes are excluded from the global prefix; they are **not** — the feed lives under `/n-care/api/v1`. Use the URL above.

### 9.3 How the admin section feeds Meta

There is **no Meta / Pixel screen in the admin panel**. Pixel configuration is done in GTM and Meta Events Manager. The admin panel affects Meta indirectly, through product data:

| Admin action (route) | Effect on Meta |
|---|---|
| Create / edit product SKU (`/products`) | Changes the product's `content_id`. **Changing a SKU orphans past Pixel history for that product** in the catalog. |
| Archive / deactivate a product | Disappears from the feed on the next fetch; Pixel events for it no longer match. |
| Change price / discount | Feed `price` updates (list price only — no `sale_price` column yet). |
| Change primary image | Feed `image_link` updates — this is the image shown in catalog ads. |
| Stock movements (`/inventory`) | Feed `availability` flips at 0. |
| `/analytics` dashboard | Shows **GA4** data only (via `ga-data.server.ts`); it does not read Meta. |

[↑ Back to top](#table-of-contents)

---

## 10. Consent

| Piece | State |
|---|---|
| [`gtm.consent.ts`](../src/lib/analytics/gtm.consent.ts) | `updateConsent("granted" \| "denied")` pushes a Consent Mode update (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) and stores the choice in `localStorage["cookie-consent"]`. |
| [`CookieConsentBanner.tsx`](../src/components/feedback/consent/CookieConsentBanner.tsx) | Accept / Decline banner shown when nothing is stored. **Not rendered anywhere.** |
| GTM container | Has a `Consent - Default Granted` Custom HTML tag on All Pages. |

**Net effect today: consent is granted by default for everyone and there is no way to opt out.** Bangladesh has no GDPR-style cookie law in force for this site, so this is a business decision, not a bug — but the Meta Pixel template doesn't honour Google Consent Mode by itself anyway. To make "Decline" actually stop the Pixel, the Meta tags need a GTM consent check (*Additional consent: `ad_storage`*) or an exception trigger, in addition to mounting the banner. See [§18](#enable-the-cookie-banner).

[↑ Back to top](#table-of-contents)

---

## 11. GTM Container Configuration

The full click-by-click setup is in [analytics-setup-guide-for-client.md → Section 2](./concepts/analytics-setup-guide-for-client.md#section-2--meta-pixel). Summary of what must exist in the container for this code to work:

| Kind | Name | Config |
|---|---|---|
| Template | Meta Pixel | Community Template Gallery |
| Variables | `DL - item_id`, `DL - item_name`, `DL - value`, `DL - currency`, `DL - quantity`, `DL - transaction_id` | Data Layer Variable v2, same names as the payload keys |
| Triggers | `Event - View Item` / `Add to Cart` / `Remove from Cart` / `Initiate Checkout` / `Purchase` | Custom Event, names exactly as in [§7.1](#71-datalayer--meta-mapping) |
| Tags | `Base PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, `RemoveFromCart` | Meta Pixel template, Pixel ID `2510190342726231`, *Use GA4 dataLayer Integration* ✔ |

**Contract between code and container:** the dataLayer `event` names and payload keys in [`gtm-events.types.ts`](../src/lib/analytics/gtm-events.types.ts). Renaming either side without the other silently stops a Meta event — GTM won't error.

[↑ Back to top](#table-of-contents)

---

## 12. Types

**[`gtm-events.types.ts`](../src/lib/analytics/gtm-events.types.ts)** — the event contract. A discriminated union on `name`:

```ts
export type GA4Event =
  | { name: "view_item";        params: { item_id; item_name; value; currency: "BDT" } }
  | { name: "add_to_cart";      params: { item_id; item_name; quantity; value; currency: "BDT" } }
  | { name: "remove_from_cart"; params: { item_id; item_name; quantity; value; currency: "BDT" } }
  | { name: "begin_checkout";   params: { value; currency: "BDT"; items: Item[] } }
  | { name: "purchase";         params: { transaction_id; value; currency: "BDT"; items: Item[] } };
// Item = { item_id: string; item_name: string; quantity: number; price: number }
```

TypeScript narrows `params` by `name`, so `trackEvent({ name: "purchase", params: { value: 1, currency: "BDT" } })` fails to compile (missing `transaction_id`, `items`).

**Ambient window types** (zero runtime cost):

| File | Declares |
|---|---|
| [`types/analytics/gtm.d.ts`](../src/types/analytics/gtm.d.ts) | `window.dataLayer?: unknown[]` |
| [`types/analytics/facebook.d.ts`](../src/types/analytics/facebook.d.ts) | `window.fbq?`, `window._fbq?` as `FacebookPixelFn` (callable + `queue`, `loaded`, `version`, `push`) — legacy path |

[↑ Back to top](#table-of-contents)

---

## 13. Constants, Config, Helpers & Components

### 13.1 Config & constants

| Name | Location | Value / purpose |
|---|---|---|
| `GTM_ID` | [`config/env.config.ts`](../src/config/env.config.ts#L32) | `process.env.NEXT_PUBLIC_GTM_ID` |
| `FACEBOOK_PIXEL_ID` | [`config/env.config.ts`](../src/config/env.config.ts#L31) | `process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID` (legacy) |
| `getGtmId()` | [`config/gtm.config.ts`](../src/config/gtm.config.ts) | Returns `GTM_ID` |
| `isAnalyticsEnabled()` | [`config/gtm.config.ts`](../src/config/gtm.config.ts) | `Boolean(GTM_ID)` — **the global switch** for GTM, Pixel and `trackEvent()` |
| `CONSENT_STORAGE_KEY` | [`lib/analytics/gtm.consent.ts`](../src/lib/analytics/gtm.consent.ts) | `"cookie-consent"` (module-private) |
| `FB_PIXEL_ID` | [`lib/analytics/fpixel.ts`](../src/lib/analytics/fpixel.ts) | Alias of `FACEBOOK_PIXEL_ID` (legacy) |
| Currency | inline literal | `"BDT"` — enforced by `GA4Event` |

### 13.2 Helpers & hooks

There is **no React hook for tracking** — tracking is a plain function call from event handlers and effects.

| Helper | Signature | Behaviour |
|---|---|---|
| `trackEvent` | `(event: GA4Event) => void` | Returns early if `!isAnalyticsEnabled()` or on the server; otherwise `sendGTMEvent({ event: name, ...params })`. Import from `@/lib/analytics` or `@/lib/analytics/gtm.events`. |
| `productItemId` | `(p: Pick<IProduct,"sku"\|"id">) => string` | `sku` ‖ `PROD_<id>` — the catalog ID ([§9.1](#91-the-content_id-contract)). |
| `updateConsent` | `(state: "granted"\|"denied") => void` | Consent Mode update + persist. Browser-only. |
| `getStoredConsent` | `() => "granted"\|"denied"\|null` | Reads the persisted choice. Browser-only. |
| `pixel.pageview` / `pixel.event` | legacy | Guarded `window.fbq("track", …)` wrappers. **Do not use** while GTM delivers the Pixel — events would double-count. |

Hooks the emitters rely on (not tracking-specific):

| Hook | Used for |
|---|---|
| `useUser()` | Role for the add-to-cart guard |
| `useLocalCart()` | `cartItems`, `subTotal` for `begin_checkout` |
| `useGet()` / `usePost()` | Product fetch (`view_item`) and order placement (`purchase` in `onSuccess`) |
| `usePathname()` | Legacy SPA `PageView` in `FacebookPixel.tsx` |

### 13.3 Reusable components

| Component | Location | Status | Purpose |
|---|---|---|---|
| `<GoogleTagManager>` | `@next/third-parties/google` | **Active** (root layout) | Loads the container — and therefore the Pixel. |
| `ProductCard` | [`modules/product/shared/ProductCard.tsx`](../src/modules/product/shared/ProductCard.tsx) | Active | Used by `ProductGrid`, `CustomCarousel`, `CarouselWithTitle`. Any new grid using it gets `AddToCart` for free. |
| `CookieConsentBanner` | [`components/feedback/consent/`](../src/components/feedback/consent/CookieConsentBanner.tsx) | Built, not mounted | Consent UI. |
| `FacebookPixel` | [`components/layout/scripts/FacebookPixel.tsx`](../src/components/layout/scripts/FacebookPixel.tsx) | Legacy, not mounted | Direct Pixel loader. |

[↑ Back to top](#table-of-contents)

---

## 14. Legacy Direct Pixel & Rollback

Before GTM, the Pixel was loaded by the app itself:

```text
<FacebookPixel/> (root layout)
  └─ <Script id="fb-pixel" src="/scripts/pixel.js" strategy="afterInteractive" data-pixel-id={FB_PIXEL_ID}>
       pixel.js: create window.fbq stub (queue) → inject connect.facebook.net/en_US/fbevents.js
                 → read data-pixel-id → fbq("init", id) → fbq("track", "PageView")
  └─ useEffect([pathname, loaded]) → pixel.pageview()       ← SPA route changes
Call sites: pixel.event("ViewContent" | "AddToCart" | "Purchase", { content_ids, content_type: "product", value, currency })
```

Every call site still contains the old call, commented out with:

```ts
// * LEGACY: direct Meta Pixel call — kept for rollback safety, superseded by trackEvent() below
```

**Rollback procedure** (only if GTM delivery has to be abandoned):

1. In GTM, **pause or delete all Meta Pixel tags** and publish. Running both paths double-counts every event.
2. In [`layout.tsx`](../src/app/layout.tsx), uncomment the `FacebookPixel` import and `<FacebookPixel />`.
3. Uncomment the `pixel` import and `pixel.event(…)` blocks in `ProductDetails.tsx`, `DetailsWithAction.tsx`, `ProductCard.tsx`, `CheckOut.tsx`. Note the legacy path never had `InitiateCheckout` or `RemoveFromCart`.
4. Make sure `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` is passed as a `--build-arg` and rebuild the image.
5. Known legacy quirk: on first load `pixel.js` fires `PageView` and the `useEffect` fires another once `onLoad` sets `loaded` → **two `PageView`s on the landing page**. Fix before relying on it.

[↑ Back to top](#table-of-contents)

---

## 15. Testing & Verification

| Tool | What it proves |
|---|---|
| Browser console: `window.dataLayer` | The app pushed the event with the right keys (code side). |
| GTM **Preview** (Tag Assistant) | The trigger matched and the Meta tag fired (container side). |
| **Meta Pixel Helper** (Chrome extension) | The `fbq` call left the browser with which parameters — check `content_ids` and `value` here. |
| Events Manager → **Test Events** | Meta received it. |
| Events Manager → Catalog → **Diagnostics / Match rate** | Pixel `content_ids` match catalog `id`s. |

Quick manual script (against dev container `GTM-WF8C962M` with `yarn dev`, or prod with GTM Preview):

1. Open home → `PageView`.
2. Open a product with a SKU → `ViewContent`; Pixel Helper shows `content_ids: ["<SKU>"]`.
3. Add from a grid card, then from the details page with a size and qty 2 → two `AddToCart`, second `value = size price × 2`.
4. `/my-cart` → remove one line → `RemoveFromCart`; clear → one per remaining line.
5. `/check-out` → `InitiateCheckout` once; refresh → once more.
6. Place a COD test order → `Purchase` with `value = grand total`.
7. Sign in as `ADMIN` → add-to-cart shows the toast and fires nothing; `/my-cart` redirects.

> Test orders on production create real orders and real Meta conversions. Use the dev container, or cancel the order and expect the conversion to stay in Meta.

Full checklist: [setup guide → Section 6](./concepts/analytics-setup-guide-for-client.md#section-6--testing-guide).

[↑ Back to top](#table-of-contents)

---

## 16. Business Rules Summary

1. Meta receives storefront activity only through GTM; the app never calls `fbq` directly.
2. No `NEXT_PUBLIC_GTM_ID` ⇒ no tracking at all (QA has none).
3. Every event goes through `trackEvent()` with a `GA4Event`; currency is always BDT.
4. Product IDs sent to Meta are `sku`, else `PROD_<id>` — identical to the catalog feed.
5. `ADMIN` / `EMPLOYEE` cannot fire cart, checkout or purchase events.
6. `InitiateCheckout` fires once per checkout-page mount and only with a non-empty cart.
7. `Purchase` fires only after the server accepts the order, using the server's invoice totals.
8. Clearing the cart fires one `RemoveFromCart` per line; automatic stock removals fire none.
9. No personal data (email, phone, name, user ID) is sent to Meta.
10. Only `ACTIVE` parent products are in the Meta catalog.

[↑ Back to top](#table-of-contents)

---

## 17. Known Issues & Technical Debt

Ordered by impact on ad performance.

| # | Issue | Impact | Suggested fix |
|---|---|---|---|
| 1 | **Inconsistent `item_id`s.** `remove_from_cart` uses `PROD_<id>` even when a SKU exists ([`CartItems.tsx:23`](../src/modules/cart/public/CartItems.tsx#L23)); `begin_checkout` sends a bare `String(item.id)` ([`CheckOut.tsx:117`](../src/modules/checkout/public/CheckOut.tsx#L117)). | Those events never match the catalog → weaker retargeting for cart-abandoners. | Add `sku` to `ILocalCartItem` at add-to-cart time and use `productItemId()` in both places. |
| 2 | **Flat payloads vs. "Use GA4 dataLayer Integration".** The Meta template's GA4 integration reads the standard `ecommerce` object (`ecommerce.items`, `ecommerce.value`); `trackEvent()` pushes flat keys. The `DL - *` variables exist but the setup guide doesn't map them onto the Meta tags. | Meta events may arrive **without `content_ids` / `value`** — verify in Pixel Helper. | Either push `{ event, ecommerce: { …params, items } }` (preceded by `{ ecommerce: null }`), or map `DL - *` variables into each Meta tag's object properties. |
| 3 | **Value inconsistencies.** Grid `AddToCart` and `ViewContent` use list `price`, ignoring `discountPrice` and the selected size; the wishlist uses `discountPrice ?? price`; the details page uses the real line price. | ROAS / value-based bidding skewed upward on discounted items. | One helper (`productPricing()` already exists) for every emitter. |
| 4 | **Staff traffic is tracked.** GTM loads on `(admin)` routes and for staff browsing the storefront. | `PageView` / `ViewContent` audiences polluted by employees. | Exception trigger in GTM on admin path prefixes, and/or don't render GTM when `userInfo.role` is `ADMIN` / `EMPLOYEE`. |
| 5 | **Consent not enforceable.** Banner not mounted; container defaults to granted; the Meta template ignores Consent Mode unless told to. `updateConsent()` pushes a plain array, which GTM may not treat as a `gtag` consent command — verify in Tag Assistant's *Consent* tab before relying on it. | No opt-out. | See [§18](#enable-the-cookie-banner). |
| 6 | **Browser-only, no Conversions API.** No server-side `Purchase`, no `event_id` deduplication. | Ad blockers, iOS / ITP and closed tabs lose conversions (often 10–30%). | Send `Purchase` from the backend order service via Meta CAPI with `event_id = orderId`, and add the same `event_id` to the browser event. |
| 7 | **Undo after remove** doesn't send a compensating `AddToCart`. | Minor overcount of removals. | Acceptable; or fire `add_to_cart` from `restore()`. |
| 8 | **Catalog has no variants and no `sale_price`.** Sizes aren't separate catalog items; discounted prices aren't shown in ads. | Ads show list price; can't retarget a specific size. | Add `sale_price` and `item_group_id` + one row per variant to the feed. |
| 9 | **Legacy code & config still shipped.** `fpixel.ts`, `FacebookPixel.tsx`, `pixel.js`, `facebook.d.ts`, and `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` in the Dockerfile / README build commands are unused at runtime. | Confusion about which Pixel ID is live. | Remove once GTM delivery is considered stable; keep this doc's [§14](#14-legacy-direct-pixel--rollback) as the record. |
| 10 | **Server `main.ts` comment** claims feed routes skip the global prefix; they don't. | Misleading when configuring the catalog data source. | Fix the comment or actually exclude `feeds/(.*)` from the prefix (and update Meta's data source URL). |

[↑ Back to top](#table-of-contents)

---

## 18. How-To Recipes

### Track an existing event from a new place

```ts
import { trackEvent } from "@/lib/analytics";
import { productItemId } from "@/modules/product/public/product-details/product-details.utils";

trackEvent({
  name: "add_to_cart",
  params: {
    item_id: productItemId(product), // never hand-roll the id
    item_name: product.name,
    quantity,
    value: unitPrice * quantity,      // the price the shopper actually pays
    currency: "BDT",
  },
});
```

Call it **after** the business action succeeds (cart write, API 2xx), and behind the same role guard as the action. No GTM change is needed — the trigger already listens for `add_to_cart`.

### Add a new event (e.g. `add_to_wishlist` → Meta `AddToWishlist`)

1. **Contract:** add a member to `GA4Event` in [`gtm-events.types.ts`](../src/lib/analytics/gtm-events.types.ts). Prefer the official GA4 event name.
2. **Emit:** call `trackEvent()` from the success path (e.g. `useToggleWishlist` `onSuccess` when the result is "added").
3. **GTM:** new Custom Event trigger `add_to_wishlist` → new Meta Pixel tag, event `AddToWishlist` → Preview → Publish.
4. **Docs:** add a row to [§7.1](#71-datalayer--meta-mapping) and [§7.2](#72-payload-reference), and to the [setup guide](./concepts/analytics-setup-guide-for-client.md).

### Change the Pixel ID

GTM only: edit the Pixel ID in every Meta Pixel tag (or turn it into a Constant variable first), Preview, Publish. No rebuild.

### Exclude staff from the Pixel

GTM: create a Page Path trigger matching `^/(dashboard|analytics|home-content|products|inventory|order-list|category|admin-media-news|all-users|promotions|delivery-pricing|free-delivery-settings|contact|career-admin|blog-admin|support$|profile)` and add it as an **exception** on all Meta tags. Keep the list in sync with `ADMIN_ONLY_ROUTES` in [`middleware.ts`](../src/middleware.ts). Note `/support` (admin) vs `/support/*` (public policy pages).

### Enable the cookie banner

1. Render `<CookieConsentBanner />` in the root layout (inside `<body>`, guarded by `isAnalyticsEnabled()`).
2. Change the GTM default-consent tag to **denied** for `ad_storage` (and others), firing on *Consent Initialization – All Pages*; re-apply the stored choice there.
3. Make `updateConsent()` push via a real `gtag` function (`function gtag(){dataLayer.push(arguments)}`) rather than an array.
4. On every Meta tag: *Advanced Settings → Consent Settings → Require additional consent: `ad_storage`*.
5. Verify in Tag Assistant → Consent tab: Decline ⇒ Meta tags *blocked by consent*.

### Debug "Meta shows no AddToCart"

`window.dataLayer` has the push? → No: emitter not reached / role guard / `NEXT_PUBLIC_GTM_ID` missing in this build. → Yes: GTM Preview shows the tag fired? → No: trigger name mismatch or container not published. → Yes: Pixel Helper shows the request? → No: ad blocker. → Yes: Test Events shows it? → No: wrong Pixel ID in the tag.

[↑ Back to top](#table-of-contents)

---

## 19. Glossary

| Term | Meaning |
|---|---|
| **Meta Pixel / dataset** | Meta's browser tracking ID (`2510190342726231` in prod); Events Manager now calls it a *dataset*. |
| **`fbq`** | The global function the Pixel exposes (`fbq('track', 'Purchase', {…})`). |
| **Standard event** | A Meta-defined event name (`ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`) usable for optimisation. `RemoveFromCart` is *custom*. |
| **`content_ids`** | Product IDs on a Pixel event; must equal the catalog `id`. |
| **Catalog / data feed** | Product list Meta pulls from `datafeed.csv`, used for catalog (dynamic) ads. |
| **dataLayer** | `window.dataLayer` array; the app writes events here, GTM reads them. |
| **GTM container** | The published bundle of tags / triggers / variables (`GTM-WD6JPSJS` in prod). |
| **CAPI** | Meta Conversions API — server-to-server events, deduplicated against browser events via `event_id`. |
| **Consent Mode** | Google's mechanism for gating tags on `ad_storage` / `analytics_storage` consent. |

[↑ Back to top](#table-of-contents)

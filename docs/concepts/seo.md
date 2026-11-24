# SEO Review — Natura Care Client

**Stack:** Next.js App Router
**Reviewed:** June 2026

---

## Already Implemented

| Feature | Status | Where |
|---|---|---|
| Dynamic `robots.txt` | Good | `src/app/robots.ts` — blocks `/admin/`, `/dashboard/`, `/my-account/`, `/check-out/`, `/my-cart/`, `/order-details/`, `/otp-verification/`, `/api/`, `/_next/`, `/private/`; references sitemap |
| `sitemap.xml` | Exists but weak | `src/app/sitemap.ts` — static, only 7 URLs |
| JSON-LD structured data | Partial | Home page only (`src/app/(public)/page.tsx`) — Organization, WebSite+SearchAction, BreadcrumbList |
| Open Graph / Twitter cards | Partial | Root layout (`src/app/layout.tsx`) + home page have full OG/Twitter; static image only |
| `next/image` usage | Good | Used consistently (51 occurrences, 41 files), no raw `<img>` in live code |
| Clean URL structure | Good | Slug-based: `/product-details/[slug]`, `/career-details/[slug]`, `/media-news-details/[slug]`, `/discover-more/[slug]` |
| Canonical tags | Minimal | Only set on `/` (home) — `layout.tsx`, `page.tsx` |
| Custom 404 page | Exists | `src/app/not-found.tsx`, but no metadata override |

---

## Critical Issues

### 1. Product pages render entirely client-side
`src/app/(public)/product-details/[slug]/page.tsx` wraps a `"use client"` component that fetches product data via `useGet` + `useParams` *after* hydration. Zero `generateStaticParams`, no SSR, no ISR anywhere in the project — every product page is a blank shell until JS executes.

**Impact:**
- Slower/less reliable indexing for thousands of product pages
- No rich snippets (price, stock, reviews) since crawlers may not wait for client-side fetches
- Hurts Core Web Vitals (LCP) — hero product image loads after a client-side fetch waterfall

### 2. Zero `generateMetadata` usage anywhere in the codebase
Every product page has the literal same title/description:
- Title: `"Product Details | Natura Care Limited"`
- Description: `"Product Details at Natura Care"`

This is identical across **every single product**, regardless of which one. In Google search results, all product pages look the same — no product name, no price, no real description in what searchers actually see and click.

### 3. Sitemap excludes the entire product and category catalog
`sitemap.ts` contains 7 hardcoded URLs (home, about, contact, product listing page, media-news, login, register). Not one individual product or category URL is included. Google has no direct sitemap signal to discover or prioritize product pages — only internal links.

### 4. No Product structured data (JSON-LD) on product pages
JSON-LD only exists on the home page (Organization/WebSite/BreadcrumbList). No `Product` schema anywhere — meaning no price, availability, or rating rich results in Google Search for any product.

### 5. No `<h1>` anywhere in home, product detail, or product listing components
Confirmed via grep across all three component trees — zero matches. The only `<h1>` in the entire app is the decorative one on the 404 page. Search engines weight `<h1>` heavily for understanding page topic.

### 6. Image optimization is explicitly disabled
`next.config.ts`:
```ts
images: { unoptimized: true, ... }
```
Comment: "Bypass optimizer to avoid 500s when fetching from LAN/remote hosts."

This disables automatic WebP/AVIF conversion, responsive `srcset` generation, and Next.js lazy-loading optimization site-wide — full-size original images are shipped everywhere, hurting LCP and mobile load time.

---

## Secondary Issues

- **No `loading.tsx` or `error.tsx`** anywhere in `src/app` — missed streaming/perceived performance, ungraceful error states
- **Generic alt text fallback** — `ProductImages.tsx` defaults to `"Product"` when the API doesn't supply alt text, wasting image-search SEO opportunity across the whole catalog
- **No dynamic OG images per product** — sharing a product link on Facebook/WhatsApp shows the generic site logo, not the product photo (no `opengraph-image.tsx` anywhere)
- **`lang="en"` only** — despite the business targeting Bangladesh and JSON-LD mentioning Bengali as a contact language; no hreflang, no i18n setup
- **No `headers()` config** in `next.config.ts` — no explicit caching headers

---

## Recommendations (Priority Order)

1. **Convert product detail page to server-rendered with `generateMetadata`** — fetch product data server-side, generate per-product title/description/OG. Fixes issues #1 and #2, the most damaging ones.
2. **Make `sitemap.ts` dynamic** — fetch all active product slugs and category slugs from the API and include them.
3. **Add `Product` JSON-LD schema** to product detail pages (name, price, currency, availability, image) — high rich-snippet payoff for relatively low effort.
4. **Add real `<h1>` tags** — product name on detail pages, category/page title on listing pages.
5. **Re-enable `next/image` optimization** — fix the underlying remote-host config issue instead of disabling it wholesale; current setting is actively hurting Core Web Vitals.
6. Add `opengraph-image.tsx` per product for proper social share previews.
7. Add `loading.tsx` / `error.tsx` boundaries for key routes.
8. Decide on i18n strategy (Bengali) if targeting local search intent beyond English.

# Support Module (Store Policies) — Frontend Technical Documentation

> **Scope:** everything the Natura Care client (Next.js 15, App Router) does with **store policies**: the four public policy pages (Terms & Conditions, Shipping & Delivery, Returns & Exchanges, Privacy & Security) and the admin **Store Policies** screen, where admins write, preview and publish the content of those pages.
>
> **Audience:** frontend engineers joining or maintaining the project. QA and backend engineers can use it to see the client's side of the support-policy contract.
>
> **Related:** [Project README](../README.md) (run, build, Docker) · [Auth module](./auth.md) (sign-in, session, route guard) · [User module](./user.md) (roles) · [Contact Us module](./contact-us.md) (the "Contact us" button on every policy page, same middleware issue) · [Home module](./home.md) (same rich-text editor and audit fields) · Server source: [`support`](../../natura-care-server  


/src/modules/support/) module · [Coding conventions](../claude-docs/basic-instructions.md)

| | |
|---|---|
| **Module root** | [`src/modules/support/`](../src/modules/support/) |
| **Admin route** | `/support` (admin route group, page heading "Store Policies") |
| **Storefront routes** | `/support/term-conditions`, `/support/shipping-delivery`, `/support/returns-exchanges`, `/support/privacy-security` |
| **Other touchpoints** | Footer "Support" column (all four pages), footer bottom bar (Terms and Conditions, Privacy Policy), admin sidebar "Support" item |
| **Backend resource** | `/support/*` on `NEXT_PUBLIC_API_BASE_URL` (e.g. `https://api.naturacarebd.com/n-care/api/v1`) |
| **Access (API)** | Read: everyone, no token needed · Create, update: `ADMIN` only |
| **Last reviewed** | 2026-10-24 |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Domain Model: Policy Records & Types](#2-domain-model-policy-records--types)
3. [Tech Stack Used by This Module](#3-tech-stack-used-by-this-module)
4. [File Architecture](#4-file-architecture)
5. [Routes & Role-Based Access Control](#5-routes--role-based-access-control)
   - [5.1 Page routes (middleware)](#51-page-routes-middleware)
   - [5.2 API access (server guards)](#52-api-access-server-guards)
   - [5.3 Access matrix](#53-access-matrix)
6. [End-to-End Workflow](#6-end-to-end-workflow)
7. [Storefront — Policy Pages](#7-storefront--policy-pages)
   - [7.1 Page composition](#71-page-composition)
   - [7.2 Content states: loading, placeholder, live](#72-content-states-loading-placeholder-live)
   - [7.3 Section headings & table of contents](#73-section-headings--table-of-contents)
   - [7.4 Navigation: sidebar, mobile switcher, related policies](#74-navigation-sidebar-mobile-switcher-related-policies)
   - [7.5 Help block](#75-help-block)
8. [Admin Section — Store Policies Screen](#8-admin-section--store-policies-screen)
   - [8.1 Screen layout](#81-screen-layout)
   - [8.2 Data fetching](#82-data-fetching)
   - [8.3 Policy health checks](#83-policy-health-checks)
   - [8.4 Policy cards](#84-policy-cards)
9. [Admin Section — Policy Editor Modal](#9-admin-section--policy-editor-modal)
   - [9.1 Create vs edit](#91-create-vs-edit)
   - [9.2 Write & customer preview tabs](#92-write--customer-preview-tabs)
   - [9.3 Content stats](#93-content-stats)
   - [9.4 Save, cancel & unsaved changes](#94-save-cancel--unsaved-changes)
   - [9.5 Writing guide for admins](#95-writing-guide-for-admins)
10. [API Reference](#10-api-reference)
11. [Types](#11-types)
12. [Validation Schema](#12-validation-schema)
13. [Constants](#13-constants)
14. [Hooks](#14-hooks)
15. [Utilities](#15-utilities)
16. [Reusable Components](#16-reusable-components)
17. [Caching & Query Keys](#17-caching--query-keys)
18. [Error Handling & Toasts](#18-error-handling--toasts)
19. [SEO](#19-seo)
20. [Business Rules Summary](#20-business-rules-summary)
21. [Known Issues & Technical Debt](#21-known-issues--technical-debt)
22. [How-To Recipes](#22-how-to-recipes)
23. [QA Checklist](#23-qa-checklist)

---

## 1. Overview

The support module is a small content system for the store's four legal and service policies. Admins write each policy in a rich-text editor. Customers read it on its own page, which the footer links to from every page of the site.

| Actor | What they do | Where |
|---|---|---|
| **Guest** (not signed in) | Reads any policy, jumps between sections, switches to another policy, contacts support. | `/support/*` |
| **Customer** (signed in) | Same as a guest, **but is redirected to `/` today** ([TD-1](#21-known-issues--technical-debt)). | `/support/*` |
| **Admin** | Sees whether each policy is live, short or duplicated; sets up missing pages; edits and previews content; publishes. | `/support` |
| **Employee** | No access to the admin screen. Redirected away from the public pages too ([TD-1](#21-known-issues--technical-debt)). | — |

Key design decisions:

- **The four policies are fixed in code.** Which policies exist, their titles, URLs, icons and intro text live in `SUPPORT_POLICIES` ([`support.constants.ts`](../src/modules/support/constants/support.constants.ts)). The database stores only the **body** of each page. Adding a fifth policy is a code change on both sides (see [§22](#22-how-to-recipes)).
- **One record per policy type.** The admin screen sets up a page once (`POST`) and edits it after that (`PATCH`). The type of a record cannot be changed.
- **One shared renderer.** The storefront page and the admin "Customer preview" both render through `PolicyContent` after `preparePolicyHtml`, so the preview shows exactly what customers will see.
- **Bold lines become headings.** The editor has no heading button. A paragraph that is **only bold text** is turned into an `<h2>` with an anchor id, and those headings build the page's table of contents.
- **Placeholder text is never shown as a policy.** Below `POLICY_MIN_WORDS` (50 words) the storefront shows a "This policy is being updated" notice, and the admin screen flags the page as **Needs review**.

[↑ Back to top](#table-of-contents)

---

## 2. Domain Model: Policy Records & Types

A **support record** holds the content of one policy page.

| Field | Set by | Meaning |
|---|---|---|
| `id` | Server | Numeric id; used in the update URL. |
| `sid` | Server | UUID; not used by the client. |
| `type` | Admin (on create only) | One of the four `SupportPolicyType` values. Links the record to its page. |
| `status` | Server | `ACTIVE` by default. **Ignored by the client and the API filters** ([TD-5](#21-known-issues--technical-debt)). |
| `description` | Admin | The policy body as Quill HTML (`<p>`, `<strong>`, `<u>`, `<ol>`, `<ul>`, `<li>`, size classes). |
| `createdAt`, `updatedAt` | Server | ISO timestamps. `updatedAt` drives "Last updated" on both sides. |
| `createdBy`, `updatedBy` | Server | The admin who created / last edited the record: `{ id, name, phone, email }`. |

**Policy types** map one-to-one to storefront pages:

| `type` | Title | Route |
|---|---|---|
| `TERMS_CONDITION` | Terms & Conditions | `/support/term-conditions` |
| `SHIPPING_DELIVERY` | Shipping & Delivery | `/support/shipping-delivery` |
| `RETURN_EXCHANGE` | Returns & Exchanges | `/support/returns-exchanges` |
| `PRIVACY_POLICY` | Privacy & Security | `/support/privacy-security` |

**Policy health** is derived on the client, never stored (see [§8.3](#83-policy-health-checks)):

```
no record for the type                       →  missing  ("Not set up")
record with fewer than 50 words              →  warning  ("Needs review", placeholder text)
same plain text as another policy's record   →  warning  ("Needs review", duplicate)
otherwise                                    →  ok       ("Live")
```

[↑ Back to top](#table-of-contents)

---

## 3. Tech Stack Used by This Module

| Concern | Library / tool | Used for |
|---|---|---|
| Framework | Next.js 15 App Router | Route pages, `metadata`, `next/dynamic` code-splitting |
| Server state | TanStack Query (via shared `useGet`, `useGetAll`, `usePost`, `usePatch`) | Loading records, create and update |
| HTTP | Axios (`axiosInstance`, `postService`) | Bearer token attached by the interceptor; response unwrapped to the API envelope |
| Forms | React Hook Form + `@hookform/resolvers/zod` + Zod | Editor form, dirty tracking |
| Rich text | `react-quill-new` (through the shared `TextEditor`) | Policy body: size, bold, underline, ordered and bullet lists |
| Dialog | Radix Dialog (through `CustomModal2`) | Editor modal |
| Confirm dialog | `useConfirm` (app-wide `ConfirmContext`) | "Discard your unsaved changes?" |
| Scroll spy | Native `IntersectionObserver` | Highlighting the current section in the table of contents |
| Dates | `date-fns` (`formatDistanceToNow`), `Intl` (`toLocaleDateString`) | "3 days ago", "24 October 2026" |
| Toasts | `sonner` | API results, "No changes detected!" |
| Icons | `lucide-react` (module), `react-icons` (sidebar) | Policy icons, UI icons |
| Styling | Tailwind CSS with the project's colour tokens (`greenPrimary`, `neutralPrimary`, …) and `.rich-text-container` in `globals.css` | All screens |

[↑ Back to top](#table-of-contents)

---

## 4. File Architecture

```
src/
├── app/
│   ├── (public)/support/
│   │   ├── term-conditions/page.tsx      # metadata + dynamic(TermConditions)
│   │   ├── shipping-delivery/page.tsx    # metadata + dynamic(ShippingDelivery)
│   │   ├── returns-exchanges/page.tsx    # metadata + dynamic(ReturnsExchanges)
│   │   └── privacy-security/page.tsx     # metadata + dynamic(PrivacySecurity)
│   └── (admin)/support/page.tsx          # "use client" + dynamic(Support, { ssr: false })
│
├── modules/support/
│   ├── public/                           # ── Storefront ──
│   │   ├── PolicyPage.tsx                # The one policy page: hero, sidebar, TOC, content, help, related
│   │   ├── PolicyContent.tsx             # Typography wrapper for policy HTML (also used by the admin preview)
│   │   ├── TermConditions.tsx            # <PolicyPage type="TERMS_CONDITION" />
│   │   ├── ShippingDelivery.tsx          # <PolicyPage type="SHIPPING_DELIVERY" />
│   │   ├── ReturnsExchanges.tsx          # <PolicyPage type="RETURN_EXCHANGE" />
│   │   └── PrivacySecurity.tsx           # <PolicyPage type="PRIVACY_POLICY" />
│   │
│   ├── admin/                            # ── Admin ──
│   │   ├── Support.tsx                   # Container: query, health, banner, card grid, modal
│   │   ├── SupportPolicyCard.tsx         # One card per policy: badge, excerpt, stats, actions
│   │   └── EditSupport.tsx               # Editor modal: create / edit, write / preview, save
│   │
│   ├── constants/support.constants.ts    # SUPPORT_POLICIES, ISupportPolicyMeta, POLICY_MIN_WORDS
│   ├── hooks/useSupport.ts               # Storefront query: all records + one per type
│   ├── schemas/support.schema.ts         # supportSchema (Zod) + SupportType
│   ├── types/support.types.ts            # ISupport, SupportPolicyType, IAdmin
│   └── utils/support.utils.ts            # HTML → text, stats, heading anchors, health, dates
│
├── middleware.ts                         # /support/* public, /support admin-only (prefix collision, TD-1)
└── components/layout/
    ├── footer/Footer.tsx                 # "Support" column + bottom-bar policy links
    └── sidebar/AdminSidebar.tsx          # "Support" item (admins only)
```

Conventions this module follows (see [Coding conventions](../claude-docs/basic-instructions.md)):

- **`public/` vs `admin/` split** — the one deliberate crossing is `EditSupport` importing `public/PolicyContent`, so the preview and the live page cannot drift apart.
- **Thin route pages** — each `page.tsx` only sets `metadata` (public pages) and lazy-loads the module component with `next/dynamic` and the shared `LoadingPage` fallback.
- **Config-driven pages** — the four public components are one-line wrappers. Everything that differs per policy comes from `SUPPORT_POLICIES`, so the pages, the footer-style navigation, the admin cards and the editor header are all generated from one array.
- **Pure helpers in `utils/`** — HTML parsing, stats and health rules have no React in them and are shared by the storefront and the admin screens.
- **No API-constant file** — endpoints are inline strings ([TD-9](#21-known-issues--technical-debt)).

[↑ Back to top](#table-of-contents)

---

## 5. Routes & Role-Based Access Control

### 5.1 Page routes (middleware)

Page access is enforced in [`src/middleware.ts`](../src/middleware.ts) from the `accessToken` cookie (decoded with `jwt-decode`, role read from the JWT).

| Route | List in middleware | Who may open it |
|---|---|---|
| `/support/term-conditions`, `/support/shipping-delivery`, `/support/returns-exchanges`, `/support/privacy-security` | `PUBLIC_ROUTES` ([lines 26–29](../src/middleware.ts#L26-L29)), exact match | Everyone — **but see the caveat below** |
| `/support` | `ADMIN_ONLY_ROUTES` ([line 55](../src/middleware.ts#L55)), **not** in `EMPLOYEE_ROUTES` | `ADMIN` only. Guest → `/login`. Employee → `/dashboard`. Customer → `/`. |

> ⚠️ **Prefix collision.** Admin routes are matched with `pathname.startsWith(route)` ([line 115](../src/middleware.ts#L115)), and `"/support/term-conditions".startsWith("/support")` is `true`. So every policy page is treated as **both** public and admin-only. The role check lets the request through (the page is public), but the "hard block cross-access" check ([line 217](../src/middleware.ts#L217)) then redirects a **signed-in customer or employee** to `/`. Guests and admins are unaffected. This is [TD-1](#21-known-issues--technical-debt), the most important open issue in this module, and the same bug as `/contact-us` vs `/contact` in the [Contact Us module](./contact-us.md).

The admin sidebar shows "Support" only to admins: [`AdminSidebar.tsx:69`](../src/components/layout/sidebar/AdminSidebar.tsx#L69) has no `employee: true` flag, so the item is filtered out for employees.

### 5.2 API access (server guards)

| Endpoint | Guard | Behaviour |
|---|---|---|
| `GET /support/all-support` | none | Public. No token needed; a token is ignored. |
| `POST /support/create-support` | `JwtAuthGuard` + `RolesGuard('ADMIN')` | `401` without a valid token, `403` for non-admins. Creator taken from the token. |
| `PATCH /support/update-support/:id` | same | same. Editor taken from the token. |

The middleware is a UX guard only. The server guards are the real security boundary.

### 5.3 Access matrix

| Action | Guest | Customer | Employee | Admin |
|---|:---:|:---:|:---:|:---:|
| Open a `/support/*` policy page | ✅ | ⚠️ redirected to `/` (TD-1) | ⚠️ redirected to `/` (TD-1) | ✅ |
| Read policy content (API) | ✅ | ✅ | ✅ | ✅ |
| Open the `/support` admin screen | ❌ → `/login` | ❌ → `/` | ❌ → `/dashboard` | ✅ |
| Create / update a policy (API) | ❌ 401 | ❌ 403 | ❌ 403 | ✅ |

[↑ Back to top](#table-of-contents)

---

## 6. End-to-End Workflow

```
 ADMIN                                       SERVER                        VISITOR
 ─────                                       ──────                        ───────
 /support (Store Policies)
   │ GET /support/all-support?page=1&limit=20 ─▶ all records,
   │ ◀────────────────────────────────────────── newest first
   │ getPolicyHealth() per policy
   │   → Live / Needs review / Not set up
   │
   │ "Set up page"  (no record)
   │   EditSupport: write → Customer preview
   │   POST /support/create-support ──────────▶ createdBy = token user
   │     { type, description }                  status = ACTIVE
   │
   │ "Edit content" (record exists)
   │   PATCH /support/update-support/:id ─────▶ updatedBy = token user
   │     { description }
   │ ◀── toast, modal closes, list refetches
   │
   │                                                                     Footer → /support/<policy>
   │                                             GET /support/all-support ◀── useSupport()
   │                                             (no params = all records)
   │                                                ──────────────────────▶ pick record by type
   │                                                                        preparePolicyHtml():
   │                                                                          bold lines → <h2 id>
   │                                                                        ≥ 50 words → policy + TOC
   │                                                                        < 50 words → "being updated"
```

[↑ Back to top](#table-of-contents)

---

## 7. Storefront — Policy Pages

### 7.1 Page composition

Each `app/(public)/support/<policy>/page.tsx` is a Server Component. It exports `metadata` and renders its wrapper (for example `TermConditions`) through `next/dynamic` (with SSR; only the JS chunk is split). The wrapper renders [`PolicyPage`](../src/modules/support/public/PolicyPage.tsx) with its `type`.

`PolicyPage` reads its metadata with `SUPPORT_POLICIES.find((p) => p.type === type)` and renders, top to bottom:

```
┌──────────────────────────────────────────────────────────────────┐
│ Hero: "Shipping & Delivery"     Home / Shipping & Delivery       │
├──────────────────────────────────────────────────────────────────┤
│ [Terms] [Shipping] [Returns] [Privacy]   ← mobile switcher (< lg) │
├───────────────┬──────────────────────────────────────────────────┤
│ STORE POLICIES│ 🚚 Store policy                                   │
│  Terms        │ Shipping & Delivery                              │
│ ▸Shipping     │ How long orders take, where we deliver, …        │
│  Returns      │ 📅 Last updated 24 October 2026 · ⏱ 3 min read   │
│  Privacy      ├──────────────────────────────────────────────────┤
│               │ [On this page ▾]          ← mobile TOC (< lg)     │
│ ON THIS PAGE  │                                                  │
│ │Processing   │ Processing times                       (<h2>)    │
│ ┃Delivery area│ …                                                │
│ │Charges      │ Delivery areas                                   │
│ (sticky, ≥ lg)│ …                                                │
│               ├──────────────────────────────────────────────────┤
│               │ Still have a question?  [email] [phone] [Contact]│
│               ├──────────────────────────────────────────────────┤
│               │ Other store policies: 3 cards                    │
└───────────────┴──────────────────────────────────────────────────┘
```

The layout is one column on phones and `260px | content` from `lg`.

### 7.2 Content states: loading, placeholder, live

| State | Condition | What renders |
|---|---|---|
| Loading | `isSupportLoading` | Skeleton under the intro (meta line) and two skeleton paragraph groups in the body. No TOC. |
| Not set up | no record of this type | "This policy is being updated" notice with "Please check back soon." and a pointer to Customer Service. No "Last updated" line. |
| Placeholder | record exists, fewer than **50** words (`POLICY_MIN_WORDS`) | Same notice, but the placeholder text itself (e.g. "Our shipping policy will be added soon.") is shown in it as plain text. No "Last updated" line. |
| Live | record with ≥ 50 words | "Last updated *24 October 2026*" (`updatedAt`, falling back to `createdAt`, inside `<time dateTime>`), "*n* min read", then the content through `PolicyContent`. |

The hero, intro, navigation, help block and related policies render in every state. They come from constants, not from the API.

### 7.3 Section headings & table of contents

[`preparePolicyHtml`](../src/modules/support/utils/support.utils.ts#L52) prepares the stored HTML once per change (`useMemo` on `record.description`):

1. `&nbsp;` → a normal space. Quill sometimes stores pasted text with `&nbsp;` between every word, which would stop lines from wrapping.
2. Empty spacer paragraphs (`<p><br></p>`, `<p> </p>`) are removed; spacing comes from CSS.
3. Every paragraph that is **exactly** `<p><strong>Title</strong></p>` becomes `<h2 id="title">Title</h2>`, and `{ id, title }` is added to `sections`.

Anchor ids are the lower-cased title with every run of non `a-z0-9` characters replaced by `-`, trimmed of leading and trailing `-`. A title with no usable characters (for example Bengali text only) gets `section`. Duplicates get `-2`, `-3`, …:

```
"Delivery Charges"      → delivery-charges
"Returns & Refunds"     → returns-refunds
"Delivery Charges" (2nd)→ delivery-charges-2
"ডেলিভারি"               → section
```

The table of contents shows only when there are **at least two** sections (`showToc`):

- **Desktop (`lg`+)**: under the policy list in the sticky sidebar (`top-28`), titled "On this page".
- **Mobile**: a collapsible `<details>` card under the header, "On this page · *n* sections".

`useActiveSection` (local to `PolicyPage.tsx`) watches the headings with an `IntersectionObserver` (`rootMargin: "-120px 0px -65% 0px"`, so a heading becomes active just below the sticky navbar) and highlights that entry in green. Headings have `scroll-mt-32`, so clicking a TOC link does not hide the heading behind the navbar.

### 7.4 Navigation: sidebar, mobile switcher, related policies

All three are generated from `SUPPORT_POLICIES`:

| Element | Visible | Behaviour |
|---|---|---|
| "Store policies" list | `lg`+ (sidebar) | Icon + title; the current page is highlighted and has `aria-current="page"`. |
| Pill switcher | below `lg` | Horizontally scrolling pills, current one filled green, `aria-current="page"`. |
| "Other store policies" | always | Three cards (every policy except the current one) with icon, title, arrow and the `intro` text. |

### 7.5 Help block

"Still have a question?" card with three actions: `mailto:info@naturacarebd.com`, `tel:+8809644556677` and a **Contact us** button to `/contact-us`. The email and phone are the local constants `SUPPORT_EMAIL` and `SUPPORT_PHONE` in `PolicyPage.tsx` ([TD-11](#21-known-issues--technical-debt)).

[↑ Back to top](#table-of-contents)

---

## 8. Admin Section — Store Policies Screen

### 8.1 Screen layout

[`Support.tsx`](../src/modules/support/admin/Support.tsx), top to bottom:

```
┌──────────────────────────────────────────────────────────────────┐
│ Store Policies                                                   │
│ These pages are linked from the storefront footer. …             │
├──────────────────────────────────────────────────────────────────┤
│ ⚠ 2 of 4 policies need attention: Shipping & Delivery, Returns & │  ← amber banner
│   Exchanges. 2 are in good shape.                                │    (or green "All 4 policies
├────────────────────────────────┬─────────────────────────────────┤     are live and complete.")
│ 📄 Terms & Conditions  ● Live   │ 🚚 Shipping & Delivery          │
│ The rules customers agree to…  │    Needs review                 │
│ ┌────────────────────────────┐ │ ┌─────────────────────────────┐ │
│ │ excerpt (3 lines)          │ │ │ Our shipping policy will …  │ │
│ └────────────────────────────┘ │ └─────────────────────────────┘ │
│ WORDS 1,240 │ SECTIONS 9 │ 6min│ ⚠ Looks like placeholder text … │
│ 🕐 Updated 3 days ago by Samiha │ WORDS 7 │ SECTIONS 0 │ 1 min    │
│          [View page] [Edit]    │          [View page] [Edit]     │
└────────────────────────────────┴─────────────────────────────────┘
```

Cards are one column, two from `xl`. While loading, four 300 px skeleton cards show and the banner is hidden.

### 8.2 Data fetching

One query:

| Query | Hook | Endpoint | Params | Query key |
|---|---|---|---|---|
| All policy records | `useGetAll<{ data: ISupport[]; meta: IMeta }>` | `GET /support/all-support` | `{ page: 1, limit: 20 }` (`SUPPORT_POLICIES.length * 5`) | `["getAllSupport", "admin"]` |

There is one record per type, so a single page holds them all. The limit leaves room for stray duplicates ([TD-4](#21-known-issues--technical-debt)). The server sorts by `createdAt` descending, so `records.find((r) => r.type === meta.type)` picks the **newest** record of each type — the same one the storefront shows.

For each entry in `SUPPORT_POLICIES` the container builds `{ meta, record, health }`, then:

- `needsAttention` = policies whose health is not `ok`;
- `liveCount` = the rest.

### 8.3 Policy health checks

[`getPolicyHealth(meta, record, allRecords)`](../src/modules/support/utils/support.utils.ts#L103) runs the checks in order and returns the first that fails:

| # | Check | Level | Card badge | Message |
|---|---|---|---|---|
| 1 | No record for this type | `missing` | **Not set up** (red) | "Not set up yet. Customers see an empty page." |
| 2 | Fewer than 50 words of plain text | `warning` | **Needs review** (amber) | "Looks like placeholder text (*n* words). Add the full policy." |
| 3 | Plain text equals another type's record (case-insensitive) | `warning` | **Needs review** (amber) | "Same content as *Other Policy*. Each page should cover its own topic." |
| — | All checks pass | `ok` | **Live** (green, with a dot) | "Live on the storefront." (not shown on the card) |

Check 3 catches the common mistake of pasting the same text into every page. Both pages of a duplicate pair are flagged.

### 8.4 Policy cards

[`SupportPolicyCard.tsx`](../src/modules/support/admin/SupportPolicyCard.tsx):

| Area | With a record | Without a record |
|---|---|---|
| Header | Icon (tinted per policy), title, health badge, `summary` | same |
| Preview | Plain-text excerpt, clamped to 3 lines | Dashed box "This page has no content yet." |
| Health message | Shown when not `ok` (amber, or red for `missing`) | Red "Not set up yet…" |
| Stats | Words · Sections · Read time | — |
| Footer text | "Updated 3 days ago by *name*" (`updatedBy` ?? `createdBy`); full date on hover | "Not published yet" |
| Actions | **View page** (opens the storefront page in a new tab) · **Edit content** | **Set up page** only |

Both action buttons call `onEdit`, which opens the editor with `handleOpen("edit", { type, record })`.

[↑ Back to top](#table-of-contents)

---

## 9. Admin Section — Policy Editor Modal

`Support.tsx` renders [`EditSupport`](../src/modules/support/admin/EditSupport.tsx) inside `CustomModal2` (near full width on phones, up to `max-w-5xl`, `max-h-[90vh]`). The modal state comes from `useHandleModalState<ISupportEditTarget>()`; the target is `{ type, record? }`.

```
┌──────────────────────────────────────────────────────────────────┐
│ 🚚 Edit Shipping & Delivery                                  [X] │
│    Shown at /support/shipping-delivery ↗                         │
├──────────────────────────────────────────────────────────────────┤
│ ⓘ Processing times, delivery areas, charges and tracking. Use a  │
│   bold line on its own for each section heading, and lists …     │
│ [✎ Write | 👁 Customer preview]                                  │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Policy content *        [size] [B] [U] [1.] [•]              │ │
│ │ …                                                            │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ 1,240 words · 9 sections · ~6 min read                           │
├──────────────────────────────────────────────────────────────────┤
│ Last updated 3 days ago by Samiha · Created …    [Cancel] [Save] │
└──────────────────────────────────────────────────────────────────┘
```

### 9.1 Create vs edit

`isCreate = !record`.

| | Create | Edit |
|---|---|---|
| Title | "Set up *Policy*" | "Edit *Policy*" |
| Initial content | empty | `record.description` |
| Submit button | **Publish page** | **Save changes** |
| Request | `POST /support/create-support` `{ type, description }` | `PATCH /support/update-support/:id` `{ description }` |
| Unchanged submit | n/a | Toast "No changes detected!" and the modal closes, no request |
| Footer text | "Not published yet" | "Last updated … by … · Created *date* by *name*" |

The header link ("Shown at /support/…") opens the live page in a new tab.

### 9.2 Write & customer preview tabs

- **Write** — the shared `TextEditor` (Quill) bound to `description`, labelled "Policy content", required. Toolbar: size (small / normal / large / huge), bold, underline, ordered list, bullet list.
- **Customer preview** — the policy title as it appears on the page, then `PolicyContent` with `preparePolicyHtml(description).html`. Shows "Nothing to preview yet." while the editor has no words.

The editor stays **mounted but hidden** while previewing (`className="hidden"`), so Quill keeps its content, selection and undo history when switching tabs.

### 9.3 Content stats

Under the editor, live from `useWatch` + `getContentStats`:

- **words**, **sections** (bold-only paragraphs), **~*n* min read** (200 words a minute, at least 1);
- an amber hint "Short for a policy page. Aim for at least 50 words." when there are 1–49 words.

The same numbers appear on the card and drive the health badge, so the admin sees the effect before saving.

### 9.4 Save, cancel & unsaved changes

| Action | Behaviour |
|---|---|
| **Publish page / Save changes** | Runs `supportSchema`, sends the request; `SubmitButton` shows the pending state of either mutation. On a 2xx: toast, close the modal, `refetch()` the admin list. On an error: toast, the modal stays open with the content kept. |
| **Cancel** or **X** | If the form is dirty, asks `useConfirm` "Discard your unsaved changes?" (Discard / Keep editing, warning style). Otherwise closes. |
| Footer status | Amber "● Unsaved changes" while dirty; otherwise last-edit details. |
| Overlay click / `Esc` | Closes **without** the confirm ([TD-7](#21-known-issues--technical-debt)). |

### 9.5 Writing guide for admins

The page builds itself from the formatting, so content needs to follow these rules:

| Do | Result |
|---|---|
| Put each section heading on its own line, **bold only** | Becomes a heading and a table-of-contents entry |
| Use numbered lists for steps, bullet lists for conditions | Green markers, spacing between items |
| Write at least 50 words | Below that the page shows "This policy is being updated" |
| Give each policy its own text | Identical text on two policies is flagged on the admin screen |

| Avoid | Why |
|---|---|
| Making a heading bold **and** underlined, or changing its size | It is stored as `<strong><u>…` or with a size class, so it is **not** detected as a heading ([TD-8](#21-known-issues--technical-debt)) |
| Bold words inside a normal sentence for headings | Only a paragraph that is bold from start to end counts |
| Empty lines for spacing | They are removed; spacing comes from the page style |

[↑ Back to top](#table-of-contents)

---

## 10. API Reference

Base: `NEXT_PUBLIC_API_BASE_URL`. All responses use the standard envelope `{ statusCode, success, message, data, meta? }`. The server wraps every error in this controller as `400 Bad Request` with the error message.

### `GET /support/all-support` (public)

Called by `useSupport` (no params) and by the admin screen (`page=1&limit=20`).

| Param | Values | Default |
|---|---|---|
| `page`, `limit` | numbers (`limit` ≤ 100) | omit both to get **all** records |
| `sortOrder` | `asc` \| `desc` | `desc` (by `createdAt`) |

```json
// 200
{ "statusCode": 200, "success": true, "message": "Support retrieved successfully",
  "data": [
    { "id": 3, "sid": "7f0c…", "type": "SHIPPING_DELIVERY", "status": "ACTIVE",
      "description": "<p><strong>Processing times</strong></p><p>We pack orders within 24 hours…</p>",
      "createdAt": "2026-03-02T05:10:00.000Z", "updatedAt": "2026-10-21T09:30:00.000Z",
      "createdBy": { "id": 1, "name": "Samiha Quazi", "phone": "+8801750256844", "email": "samiha@…" },
      "updatedBy": { "id": 1, "name": "Samiha Quazi", "phone": "+8801750256844", "email": "samiha@…" } }
  ],
  "meta": { "totalItems": 4, "itemCount": 4, "itemsPerPage": 4, "totalPages": 1, "currentPage": 1 } }
```

> `createdBy` / `updatedBy` include the admin's **email and phone** on this public endpoint ([TD-2](#21-known-issues--technical-debt)).

### `POST /support/create-support` (admin)

```json
// request
{ "type": "RETURN_EXCHANGE", "description": "<p><strong>Eligibility</strong></p><p>…</p>" }

// 201
{ "statusCode": 201, "success": true, "message": "Support created successfully", "data": { /* ISupport */ } }
```

| Field | Rule |
|---|---|
| `type` | Required, one of the four `SupportType` values ("Invalid support type"). |
| `description` | Required, string, trimmed. No maximum length (`TEXT` column). No HTML sanitising ([TD-3](#21-known-issues--technical-debt)). |
| anything else | Rejected (`forbidNonWhitelisted`). |

The server does **not** check whether a record of that type already exists ([TD-4](#21-known-issues--technical-debt)).

### `PATCH /support/update-support/:id` (admin)

Body: `{ description }` (required, string, trimmed). `type` cannot be sent — it is rejected as a non-whitelisted property, so a record's type never changes. Unknown id → `400 "Support not found."`. Returns the updated `ISupport` with `updatedBy` set from the token.

[↑ Back to top](#table-of-contents)

---

## 11. Types

[`types/support.types.ts`](../src/modules/support/types/support.types.ts):

| Type | Purpose |
|---|---|
| `SupportPolicyType` | `"TERMS_CONDITION" \| "SHIPPING_DELIVERY" \| "RETURN_EXCHANGE" \| "PRIVACY_POLICY"` — mirrors the Prisma `SupportType` enum. |
| `ISupport` | A record as the API returns it (see [§2](#2-domain-model-policy-records--types)). `status` is typed `"ACTIVE" \| "INACTIVE"`; the server enum also has `ARCHIVED`. |
| `IAdmin` | `{ id, name, phone, email }` for `createdBy` / `updatedBy`. A copy of the `IAdmin` in `home-content.types.ts`. |

Types defined next to their code:

| Type | File | Purpose |
|---|---|---|
| `ISupportPolicyMeta` | `support.constants.ts` | One entry of `SUPPORT_POLICIES`: `type`, `title`, `href`, `summary`, `intro`, `icon`, `iconTone`. |
| `ISupportEditTarget` | `EditSupport.tsx` | Modal payload: `{ type, record? }`; no `record` means create. |
| `IPolicySection` | `support.utils.ts` | A TOC entry: `{ id, title }`. |
| `PolicyHealth` | `support.utils.ts` | `{ level: "missing" \| "warning" \| "ok"; message }`. |
| `SupportType` | `support.schema.ts` | Form values, `z.infer<typeof supportSchema>`. Not the same as the Prisma enum of the same name. |

Shared types used: `IModal` (`setOpen`, `refetch`, `onClose`, `data`) and `IMeta` from `@/types`.

[↑ Back to top](#table-of-contents)

---

## 12. Validation Schema

[`schemas/support.schema.ts`](../src/modules/support/schemas/support.schema.ts) — `supportSchema`:

```ts
description: z.string()
  .min(1, "Policy content is required")
  .refine((val) => val !== "<p><br></p>", "Policy content cannot be empty")
```

| Input | Client | Server | Result |
|---|---|---|---|
| Never typed in | ❌ "Policy content is required" | — | Field error |
| Typed then deleted (`<p><br></p>`) | ❌ "Policy content cannot be empty" | — | Field error |
| Only spaces (`<p>   </p>`) | ✅ passes | ✅ passes | Saved with 0 words; storefront shows the "being updated" notice |
| 7 words of placeholder | ✅ | ✅ | Saved; card shows **Needs review** |

The 50-word minimum is a **soft** rule: it is shown as a hint and a health warning, never enforced, so an admin can publish a short holding text on purpose.

[↑ Back to top](#table-of-contents)

---

## 13. Constants

[`constants/support.constants.ts`](../src/modules/support/constants/support.constants.ts):

| Constant | Value / purpose |
|---|---|
| `SUPPORT_POLICIES` | The four policies in display order, with `type`, `title` (the customer-facing heading), `href`, `summary` (admin card and editor hint), `intro` (customer intro and related-policy card), `icon` (`FileText`, `Truck`, `RefreshCcw`, `ShieldCheck`) and `iconTone` (cyan, orange, blue, violet). |
| `POLICY_MIN_WORDS` | `50` — below this a policy counts as placeholder text. |

Local constants:

| Constant | File | Value / purpose |
|---|---|---|
| `SUPPORT_EMAIL`, `SUPPORT_PHONE` | `PolicyPage.tsx` | `info@naturacarebd.com`, `+8809644556677` ([TD-11](#21-known-issues--technical-debt)) |
| `policyContentClass` | `PolicyContent.tsx` | Typography for policy HTML: `h2` spacing and `scroll-mt-32`, green list markers, paragraph spacing |
| `healthBadge` | `SupportPolicyCard.tsx` | Label and colours per health level |
| `HTML_ENTITIES` | `support.utils.ts` | Entities decoded when converting HTML to text |
| `modules`, `formats` | `components/form/TextEditor.tsx` | Shared Quill toolbar (size, bold, underline, lists) |
| Endpoints | inline strings | `/support/all-support`, `/support/create-support`, `/support/update-support/:id` |
| Footer links | `Footer.tsx` (`allSupports`) | The four labels and URLs, duplicated from `SUPPORT_POLICIES` |

[↑ Back to top](#table-of-contents)

---

## 14. Hooks

### Module hook

[`useSupport()`](../src/modules/support/hooks/useSupport.ts) — storefront only.

```ts
const { supports, termCondition, shippingDelivery, returnExchange, privacySecurity,
        isSupportLoading, refetchSupport } = useSupport();
```

- `useGet<ISupport[]>("/support/all-support", ["getAllSupport"])` with no params, so the server returns every record.
- `supports` defaults to `[]`. The four named records are found **by `type`**, not by array position (an older, commented-out version used indexes).
- `PolicyPage` uses `supports` and `isSupportLoading` only.

### Shared hooks the module uses

| Hook | Used in | Behaviour relevant here |
|---|---|---|
| `useGet<T>(endpoint, key)` | `useSupport` | Returns `response.data` (the array). Toasts on network error. |
| `useGetAll<T>(endpoint, key, params)` | `Support.tsx` | Returns the full envelope (`{ data, meta }`). Toasts on network error. |
| `usePost(endpoint, onSuccess, onError)` | `EditSupport.tsx` | Toasts the server message (one toast per message for a 4xx array). Logs `"toast message =>"` to the console. |
| `usePatch(onSuccess, onError)` | `EditSupport.tsx` | `mutate({ endpoint, data })`. Toasts "Support updated successfully" or the error. |
| `useHandleModalState<T>()` | `Support.tsx` | `modalData`, `isOpen("edit")`, `handleOpen`, `handleClose` (clears the data). |
| `useConfirm()` | `EditSupport.tsx` | Promise-based confirm dialog for discarding changes. |
| `useForm`, `useWatch` (RHF) | `EditSupport.tsx` | Form state, `isDirty` / `dirtyFields`, live stats. |

Local hook: `useActiveSection(sections)` in `PolicyPage.tsx` — scroll spy for the table of contents ([§7.3](#73-section-headings--table-of-contents)).

[↑ Back to top](#table-of-contents)

---

## 15. Utilities

[`utils/support.utils.ts`](../src/modules/support/utils/support.utils.ts):

| Function | Input → output |
|---|---|
| `htmlToText(html)` | `"<p><strong>Refunds</strong></p><p>Paid&nbsp;in 7 days</p>"` → `"Refunds Paid in 7 days"`. Block ends and `<br>` become spaces, tags are dropped, common entities decoded, whitespace collapsed. `""` for no input. |
| `getContentStats(html)` | → `{ text, words, sections, readMinutes }`. `sections` counts bold-only paragraphs; `readMinutes = max(1, round(words / 200))`. |
| `preparePolicyHtml(html)` | → `{ html, sections }` for the storefront ([§7.3](#73-section-headings--table-of-contents)). |
| `getPolicyHealth(meta, record, all)` | → `PolicyHealth` ([§8.3](#83-policy-health-checks)). |
| `formatLongDate(iso)` | → `"24 October 2026"` (`en-GB`); `"-"` for a missing or invalid date. |
| `formatTimeAgo(iso)` | → `"3 days ago"`; `"-"` for a missing or invalid date. |

From `lib/utils/date.utils.ts`: `formatDate(iso)` for the full date-and-time tooltips on the admin side.

[↑ Back to top](#table-of-contents)

---

## 16. Reusable Components

### Shared components the module uses

| Component | Path | Used for |
|---|---|---|
| `Hero` | `components/layout/hero/Hero` | Page banner with the policy title |
| `CustomBreadCrumb` | `components/primitives/CustomBreadCrumb` | "Home / *Policy*" inside the hero |
| `TextEditor` | `components/form/TextEditor` | Quill editor wired to RHF (`control`, `trigger`, `isRequired`) |
| `SubmitButton` | `components/form/SubmitButton` | Publish / Save with pending state |
| `CustomModal2` | `components/primitives/modal/CustomModal2` | Editor modal shell |
| `Skeleton` | `components/ui/skeleton` | Admin cards and storefront content while loading |
| `LoadingPage` | `components/feedback/loading/LoadingPage` | `next/dynamic` fallback on all five routes |

### Components the module defines

| Component | File | Reusable? |
|---|---|---|
| `PolicyPage({ type })` | `public/PolicyPage.tsx` | The whole storefront page; used by all four wrappers |
| `PolicyContent({ html })` | `public/PolicyContent.tsx` | Exported; storefront and admin preview. Renders with `dangerouslySetInnerHTML` |
| `SupportPolicyCard` | `admin/SupportPolicyCard.tsx` | Admin card; props `meta`, `record`, `health`, `onEdit` |
| `EditSupport` | `admin/EditSupport.tsx` | Editor modal body; follows the shared `IModal` props |
| `TableOfContents` | `public/PolicyPage.tsx` | Private; used twice (desktop sidebar, mobile `<details>`) |

[↑ Back to top](#table-of-contents)

---

## 17. Caching & Query Keys

| Key | Data | Used by | Refreshed by |
|---|---|---|---|
| `["getAllSupport"]` | Array of all records | Storefront (`useSupport`) | TanStack Query defaults (stale on mount / window focus) |
| `["getAllSupport", "admin"]` | Envelope, page 1 of 20 | Admin screen | `refetch()` after a successful create or update |

Points to know:

- The two keys are separate. After an admin saves, the storefront key in the **same browser tab** is not invalidated. In practice this rarely shows, because **View page** opens a new tab, which starts with an empty cache.
- All four policy pages share `["getAllSupport"]`, so moving between policies in one visit needs no new request.

[↑ Back to top](#table-of-contents)

---

## 18. Error Handling & Toasts

| Situation | What the user sees |
|---|---|
| Policy created | Toast "Support created successfully"; modal closes; card turns Live / Needs review |
| Policy updated | Toast "Support updated successfully"; modal closes |
| Save with no changes | Toast "No changes detected!"; modal closes; no request |
| Empty editor on submit | Field error under the editor |
| Server rejects the request (400) | Error toast with the message; modal stays open, content kept; `console.error("Create failed:" / "Update failed:")` |
| Session expired / not an admin | Toast with the 401 / 403 message |
| Records fail to load (admin) | Toast "Failed to fetch data."; every card shows **Not set up** and the banner says 4 of 4 need attention |
| Records fail to load (storefront) | Toast; the page shows the "This policy is being updated" notice |
| Close with unsaved changes (Cancel / X) | Confirm "Discard your unsaved changes?" |

> When the admin list fails to load, the screen cannot tell "failed" from "not set up". Do not click **Set up page** in that state; it would create a duplicate ([TD-4](#21-known-issues--technical-debt)).

[↑ Back to top](#table-of-contents)

---

## 19. SEO

| Page | `<title>` | Description |
|---|---|---|
| `/support/term-conditions` | `Terms & Conditions \| Natura Care Limited` | "The terms that apply when you browse our store and place an order with Natura Care Limited." |
| `/support/shipping-delivery` | `Shipping & Delivery \| Natura Care Limited` | page-specific |
| `/support/returns-exchanges` | `Returns & Exchanges \| Natura Care Limited` | page-specific |
| `/support/privacy-security` | `Privacy & Security \| Natura Care Limited` | "How Natura Care Limited collects, uses and protects your personal information." |
| `/support` (admin) | inherited from the admin layout | — (client page, no `metadata`) |

Gaps ([TD-6](#21-known-issues--technical-debt)):

- The policy body is fetched in the browser, so the server-rendered HTML contains the hero, intro and navigation but **not the policy text**.
- None of the four pages is listed in [`sitemap.ts`](../src/app/sitemap.ts). They are reachable through the footer links on every page.

Semantics that help search and assistive tech: one `<h1>` per page, `<h2>` per section with stable anchor ids, `<time dateTime>` for "Last updated", labelled `<nav>` landmarks ("Store policies", "On this page") and `aria-current="page"` on the current policy.

[↑ Back to top](#table-of-contents)

---

## 20. Business Rules Summary

1. There are exactly four policies; which ones, their titles and URLs are set in code (`SUPPORT_POLICIES`).
2. Each policy has one record. It is created once ("Set up page") and edited after that; its type never changes.
3. Only admins can create or edit policies. Employees cannot open the admin screen.
4. Anyone can read policies; no account is needed.
5. A policy with fewer than 50 words is treated as placeholder text: customers see "This policy is being updated", admins see **Needs review**.
6. Two policies with the same text are both flagged **Needs review**.
7. A paragraph that is only bold text is a section heading; two or more headings give the page a table of contents.
8. "Last updated" on the storefront is the record's `updatedAt` (or `createdAt` if never edited).
9. Every edit records the admin who made it (`updatedBy`), shown on the admin card and in the editor.
10. The admin preview uses the same renderer as the storefront, so what the admin previews is what customers see.

[↑ Back to top](#table-of-contents)

---

## 21. Known Issues & Technical Debt

| # | Issue | Impact | Suggested fix |
|---|---|---|---|
| TD-1 | **Signed-in customers and employees are redirected away from all four policy pages.** `/support` is in `ADMIN_ONLY_ROUTES`, which is matched with `startsWith`, so `/support/term-conditions` counts as an admin route and the hard-block check in `middleware.ts` sends them to `/`. | Customers cannot read Terms, Returns or Privacy while signed in, even from the footer or during checkout | Match admin routes on a segment boundary: `pathname === route \|\| pathname.startsWith(route + "/")`, or check `isPublicRoute` before the hard block. Fixes `/contact-us` too. |
| TD-2 | **The public `GET /support/all-support` returns the admin's email and phone** in `createdBy` / `updatedBy`. | Staff contact details are visible to anyone who opens the network tab | Follow the public/admin DTO split (as in category and product): a public response with `type`, `description`, `updatedAt` only; keep audit users for the admin call. |
| TD-3 | **Policy HTML is not sanitised** on the server and is rendered with `dangerouslySetInnerHTML`. Quill's own output is safe, but the API accepts any string from an admin token. | A stolen admin token, or a pasted script, can inject script into public pages | Sanitise on write with an allowlist (`p`, `br`, `strong`, `u`, `ol`, `ul`, `li`, `span[class^=ql-size-]`, `h2`), and/or DOMPurify in `PolicyContent`. |
| TD-4 | **No uniqueness on `type`.** `create-support` does not check for an existing record. A stale tab, a failed list load ([§18](#18-error-handling--toasts)) or a direct API call creates a second record. Both clients silently use the newest one. | Hidden duplicate rows; edits may go to a record nobody sees | `@@unique([type])` in Prisma and `409` on create (or make create an upsert). |
| TD-5 | `status` is ignored everywhere; there is no way to unpublish a policy, and an `INACTIVE` record is still shown. | Field suggests a feature that does not exist | Either filter `status: ACTIVE` on the public read and add a toggle, or drop the field. |
| TD-6 | Policy text is fetched client-side and the pages are not in the sitemap ([§19](#19-seo)). | Crawlers may index pages without their content | Fetch the record in the page's Server Component (with `INTERNAL_API_BASE_URL`), pass it to `PolicyPage`, revalidate on a timer; add the four URLs to `sitemap.ts`. |
| TD-7 | Closing the editor by clicking the overlay or pressing `Esc` skips the unsaved-changes confirm (`CustomModal2` calls `handleClose` directly). | Edits can be lost by a stray click | Route `onOpenChange(false)` through the same `handleCancel` logic, or block outside clicks on this modal. |
| TD-8 | Heading detection only matches the exact `<p><strong>Title</strong></p>`. A bold heading that is also underlined, resized or contains a link is not a heading. | TOC entries silently missing | Accept nested inline tags in the regex, or add Quill's `header` format to the toolbar for this module and map `<h2>` directly. |
| TD-9 | Endpoints are inline strings; the admin screen calls `useGetAll` directly instead of a module hook; a save calls `refetch()` instead of invalidating `["getAllSupport"]`. | Endpoint changes in several places; storefront cache not refreshed in the same tab | Add `src/constants/api/support.api.constants.ts`, move the admin query into `useSupport` (or `useAdminSupport`), and `invalidateQueries({ queryKey: ["getAllSupport"] })` on save. |
| TD-10 | Leftovers: the commented-out index-based `useSupport`, unused named returns (`termCondition`, …), `console.error` in mutation handlers, `IAdmin` duplicated from home types, `!` assertion on `meta` in `PolicyPage`. | Noise; risk of reusing the index-based version | Delete the dead code; move `IAdmin` to `@/types`. |
| TD-11 | Support email and phone are hard-coded in `PolicyPage.tsx` (and again in the contact page and footer); footer policy links duplicate `SUPPORT_POLICIES`. | Values can drift apart | One shared `STORE_CONTACT` constant; build the footer "Support" column from `SUPPORT_POLICIES`. |
| TD-12 | All server errors in the controller become `400`; an unknown id returns `400 "Support not found."` rather than `404`. | Harder to tell errors apart in the client | Let `NotFoundException` and the guards' exceptions pass through. |

[↑ Back to top](#table-of-contents)

---

## 22. How-To Recipes

### Change a policy's text

No code change. Admin → **Support** → **Edit content** on the card → edit → check **Customer preview** → **Save changes**.

### Change a policy's title, intro, icon or URL

1. Edit the entry in `SUPPORT_POLICIES` ([`support.constants.ts`](../src/modules/support/constants/support.constants.ts)).
2. Update the matching `metadata.title` / `description` in `app/(public)/support/<policy>/page.tsx`.
3. Update `allSupports` and the bottom-bar links in [`Footer.tsx`](../src/components/layout/footer/Footer.tsx) (until TD-11 is done).
4. For a URL change: rename the route folder, update `PUBLIC_ROUTES` in `middleware.ts`, and add a redirect from the old URL in `next.config.ts`.

### Add a fifth policy (e.g. "Cookie Policy")

1. **Server:** add `COOKIE_POLICY` to the `SupportType` enum in `prisma/schema/support.prisma` and migrate.
2. Add `"COOKIE_POLICY"` to `SupportPolicyType`.
3. Add an entry to `SUPPORT_POLICIES` (title, `href: "/support/cookie-policy"`, summary, intro, icon, tone).
4. Add `public/CookiePolicy.tsx` (`<PolicyPage type="COOKIE_POLICY" />`) and `app/(public)/support/cookie-policy/page.tsx` with `metadata` (copy an existing one).
5. Add the route to `PUBLIC_ROUTES` and a link to the footer.
6. The admin screen picks it up automatically and shows it as **Not set up**.

### Change the "placeholder" threshold

Change `POLICY_MIN_WORDS`. It drives the storefront notice, the admin health badge and the editor hint together.

### Give employees access to the admin screen

1. Server: `@Roles('ADMIN', 'EMPLOYEE')` on create and update.
2. Client: add `"/support"` to `EMPLOYEE_ROUTES` in `middleware.ts` and `employee: true` to the sidebar item. Because of the prefix match, this also unblocks the public policy pages for employees, but not for customers. Fix TD-1 as well.

[↑ Back to top](#table-of-contents)

---

## 23. QA Checklist

**Storefront**

- [ ] Guest opens each footer link: the right title, intro, icon and breadcrumb show; the current policy is highlighted in the sidebar (desktop) and the pill switcher (mobile).
- [ ] Signed-in customer opens a policy page → page loads (fails today: TD-1).
- [ ] Live policy: "Last updated" shows the edit date in the "24 October 2026" form; read time is shown.
- [ ] Policy with fewer than 50 words: "This policy is being updated" with the placeholder text inside; no "Last updated".
- [ ] Policy with no record: the same notice with "Please check back soon."
- [ ] Two or more bold-only lines: TOC appears; clicking an entry scrolls the heading into view below the navbar; the active entry follows the scroll.
- [ ] One or zero headings: no TOC.
- [ ] Mobile: TOC is a collapsible "On this page · *n* sections"; pills scroll sideways; no horizontal page scroll.
- [ ] Help block: email opens the mail app, phone opens the dialer, **Contact us** goes to `/contact-us`.
- [ ] "Other store policies" shows the other three, never the current one.
- [ ] Text pasted with `&nbsp;` between words wraps normally.

**Admin**

- [ ] Guest opening `/support` → `/login`; employee → `/dashboard`; customer → `/`; admin → Store Policies. Employees have no "Support" sidebar item.
- [ ] Banner counts match the badges; "All 4 policies are live and complete." when all are Live.
- [ ] A policy with no record shows **Not set up** and only **Set up page**.
- [ ] A 7-word policy shows **Needs review** with "Looks like placeholder text (7 words)".
- [ ] Copy one policy's text into another: both show "Same content as …".
- [ ] Card stats (words, sections, read time) match the editor's numbers.
- [ ] **View page** opens the storefront page in a new tab.
- [ ] Set up: empty submit → field error; valid → "Support created successfully", card updates.
- [ ] Edit without changes → "No changes detected!", no request in the network tab.
- [ ] Edit, then Cancel or X → discard confirm; "Keep editing" keeps the text.
- [ ] Customer preview matches the storefront page for the same content, and switching back to Write keeps the editor content.
- [ ] Footer shows "Unsaved changes" while dirty and "Last updated … by *name*" after saving.

[↑ Back to top](#table-of-contents)

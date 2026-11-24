# Home Module — Frontend Technical Documentation

> **Scope:** everything the Natura Care client (Next.js 15, App Router) does with the **home page**: the admin **Home Content** screen (Top Title, Hero Slider, OVC, Product Articles, Platform Redirect), the storefront home page (`/`) that renders that content next to featured products and static brand blocks, and the site-wide **promotion bar** that also reads home content.
>
> **Audience:** frontend engineers joining or maintaining the project. QA and backend engineers can use it to see the client's side of the home content contract.
>
> **Related:** [Project README](../README.md) (run, build, Docker) · [Auth module](./auth.md) (sign-in, session, route guard) · [User module](./user.md) (roles, `useCurrentUser`) · [Product module](./product.md) ("Our Must-Haves", product card) · [Category module](./category.md) (same admin-screen conventions) · [SEO concepts](./concepts/seo.md) · [Server home content docs](../../natura-care-server/docs/home-content.md) (API contract, DB schema, ordering rules) · [Coding conventions](../claude-docs/basic-instructions.md)

| | |
|---|---|
| **Module root** | [`src/modules/home/`](../src/modules/home/) |
| **Admin route** | `/home-content` (admin route group), tab in `?tab=<section>` |
| **Storefront routes** | `/` (home page) · promotion bar on every storefront and account page |
| **Backend resource** | `/home-content/*` on `NEXT_PUBLIC_API_BASE_URL` (e.g. `https://api.naturacarebd.com/n-care/api/v1`) |
| **Write access (API)** | `ADMIN` only. `GET /home-content/display-data` is public. |
| **Last reviewed** | 2026-10-24 |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Domain Model: Five Sections](#2-domain-model-five-sections)
   - [2.1 The sections](#21-the-sections)
   - [2.2 Status and display limits](#22-status-and-display-limits)
   - [2.3 Display order (position)](#23-display-order-position)
   - [2.4 OVC media kinds](#24-ovc-media-kinds)
3. [Tech Stack Used by This Module](#3-tech-stack-used-by-this-module)
4. [File Architecture](#4-file-architecture)
5. [Routes & Role-Based Access Control](#5-routes--role-based-access-control)
6. [End-to-End Workflow](#6-end-to-end-workflow)
7. [Admin Section — Screen Layout](#7-admin-section--screen-layout)
8. [Admin Section — Shared Table & Form Patterns](#8-admin-section--shared-table--form-patterns)
9. [Admin Section — Top Title](#9-admin-section--top-title)
10. [Admin Section — Hero Slider](#10-admin-section--hero-slider)
11. [Admin Section — OVC](#11-admin-section--ovc)
12. [Admin Section — Product Articles](#12-admin-section--product-articles)
13. [Admin Section — Platform Redirect](#13-admin-section--platform-redirect)
14. [Storefront — Home Page Composition](#14-storefront--home-page-composition)
15. [Storefront — Section by Section](#15-storefront--section-by-section)
16. [Storefront — Promotion Bar](#16-storefront--promotion-bar)
17. [SEO](#17-seo)
18. [API Reference](#18-api-reference)
19. [Query Keys & Caching](#19-query-keys--caching)
20. [Types](#20-types)
21. [Validation Schemas](#21-validation-schemas)
22. [Constants](#22-constants)
23. [Hooks](#23-hooks)
24. [Utilities](#24-utilities)
25. [Reusable Components](#25-reusable-components)
26. [Error Handling & User Feedback](#26-error-handling--user-feedback)
27. [Business Rules Summary](#27-business-rules-summary)
28. [Known Issues & Technical Debt](#28-known-issues--technical-debt)
29. [How-To Recipes](#29-how-to-recipes)
30. [QA Checklist](#30-qa-checklist)

---

## 1. Overview

The home page is mostly **admin-managed content**. The backend keeps one table (`home_contents`) with five kinds of row, and the client works with it in two places:

| Audience | Where | What they do |
|---|---|---|
| **Admin** | `/home-content` | Keeps the five sections: edits the announcement text, adds and orders hero banners, uploads the video commercial, writes product story cards, and links the social media tiles. |
| **Visitor** (guest, customer, staff) | `/` and the top bar of every storefront page | Sees the active items of each section, in the admin's order, up to the number each section shows. |

Not everything on the home page comes from home content:

| Home page block | Source |
|---|---|
| Promotion bar (top of every page) | Home content `PROMOTION_BAR` + current promotion + free-delivery settings |
| Hero carousel | Home content `HERO_SLIDER` |
| Our Must-Haves | Products API: featured, active products ([Product module](./product.md)) |
| Feature video | Home content `OVC` |
| Customer reviews | Static constant `reviewData` |
| Product spotlight | Home content `PRODUCT_ARTICLE` |
| Shop benefits | Static constant `shopBenefitsData` |
| Stay Close to Natura | Home content `PLATFORM_REDIRECT` |

The storefront makes **one** request for all home content (`GET /home-content/display-data`); every component that needs it calls the same hook, and React Query shares the result.

[↑ Back to top](#table-of-contents)

---

## 2. Domain Model: Five Sections

### 2.1 The sections

| API `type` | Admin tab (`?tab=`) | Storefront component | What it is | Admin can |
|---|---|---|---|---|
| `PROMOTION_BAR` | Top Title (`promotionBar`) | [`PromotionBar`](../src/components/layout/promo-bar/PromotionBar.tsx) | One line of announcement text | Edit only |
| `HERO_SLIDER` | Hero Slider (`heroSlider`) | [`HomeHero`](../src/modules/home/public/HomeHero.tsx) | Wide banner images in an autoplay carousel, each optionally clickable | Add, edit, delete |
| `OVC` | OVC (`ovc`) | [`FeatureVideo`](../src/modules/home/public/FeatureVideo.tsx) | The *online video commercial*: one video file, video link, GIF or image | Add, edit (link/position/status only), delete |
| `PRODUCT_ARTICLE` | Product Articles (`productArticles`) | [`ProductSpotlight`](../src/modules/home/public/ProductSpotlight.tsx) | Image + heading + rich-text story | Add, edit, delete |
| `PLATFORM_REDIRECT` | Platform Redirect (`platformRedirect`) | [`FollowUs`](../src/modules/home/public/FollowUs.tsx) | Social media tile: image + platform icon + link | Edit only |

There is **no add or delete in the UI** for Top Title and Platform Redirect. Those rows are created through the API (Swagger at `/api-doc`, Postman or curl). This is deliberate for now: the site has one announcement and a fixed set of four platforms.

### 2.2 Status and display limits

Every item is `ACTIVE` or `INACTIVE`. There is no archive.

- **Active** items appear on the storefront, up to the section's limit.
- **Inactive** items stay in the admin list but are never sent to the storefront.

| Section | Home page shows |
|---|---|
| Top Title | first **1** active |
| Hero Slider | first **5** active |
| OVC | first **1** active |
| Product Articles | first **3** active |
| Platform Redirect | first **4** active |

"First" means by position. The server applies the limit (`HOME_PAGE_SECTIONS` in the server's `home-content.service.ts`); the client copy in `HOME_CONTENT_SECTIONS[].homeLimit` is used only to warn the admin (see [§7](#7-admin-section--screen-layout)). **The two must match.**

An admin may keep more items than the page shows, for example a sixth slide prepared for next week. It appears as soon as it moves into the top five or another slide is made inactive.

### 2.3 Display order (position)

Each section has its own numbering starting at 1, with no gaps. The **server** maintains it; the admin only says where an item goes:

| Action | Effect on the other items in the same section |
|---|---|
| Add (the UI never sends a position) | Added at the end |
| Edit position *a* → *b* | Items in between shift by one to make room |
| Position beyond the end | Placed last |
| Delete | Later items move up one |

The admin form field is called **Position** (`order` in the form, `sortOrder` on the wire, `#n` in the table). Lower numbers show first.

### 2.4 OVC media kinds

An OVC holds exactly **one** media item. The API stores an image and a GIF in the same `image` column, and an uploaded video and a pasted link in the same `videoUrl` column, so the client infers the kind:

| `image` | `videoUrl` | `title` | Kind | Storefront renders |
|---|---|---|---|---|
| ends in `.gif` | — | — | GIF | `<Image unoptimized>` |
| other image | — | — | Image | `<Image>` |
| — | set | set (original file name) | Uploaded video | `<video autoPlay muted loop playsInline>` |
| — | set | — | Video link | `<iframe src={getEmbedUrl(url)}>` |

The same rule lives in `mediaOf()` ([`EditOvc.tsx`](../src/modules/home/admin/ovc/EditOvc.tsx)) and in the branches of `FeatureVideo`. The media **cannot be replaced** after creation: delete the OVC and add a new one.

[↑ Back to top](#table-of-contents)

---

## 3. Tech Stack Used by This Module

| Concern | Library | Used for |
|---|---|---|
| Framework | Next.js 15 (App Router), React 19 | Route groups, `metadata`, `next/dynamic`, `next/image`, `next/link` |
| Server state | `@tanstack/react-query` v5 via `useGet` / `useGetAll` | Home display data, admin lists, tab counts |
| HTTP | `axios` ([`axiosInstance`](../src/lib/axios/axiosInstance.ts)) | Bearer token, 401 → refresh → retry, envelope unwrapping |
| Forms | `react-hook-form` + `@hookform/resolvers/zod` + `zod` v4 | All add/edit forms, dirty-field tracking |
| Tables | `@tanstack/react-table` via [`CustomTable`](../src/components/data-display/table/CustomTable.tsx) | Admin lists |
| Carousels | `embla-carousel-react` + `embla-carousel-autoplay` (shadcn [`carousel`](../src/components/ui/carousel.tsx)) | Hero, spotlight, reviews, Must-Haves |
| Rich text | `react-quill-new` via [`TextEditor`](../src/components/form/TextEditor.tsx) | Product article description |
| UI primitives | Radix UI / shadcn (`dialog`, `tabs`, `skeleton`, `select`) | Modals, tabs, loading states |
| Icons | `lucide-react`, `react-icons` | Section icons, platform icons |
| Toasts | `sonner` | Success / error / "No changes detected!" |
| Styling | Tailwind CSS v4 | Brand tokens (`greenPrimary-*`, `neutralPrimary-*`) |

[↑ Back to top](#table-of-contents)

---

## 4. File Architecture

The project uses a **feature-module** layout. `src/app` holds routing only; logic and UI live in `src/modules/<feature>/`, split by audience (`admin/`, `public/`) and by kind (`hooks/`, `types/`, `schemas/`, `constants/`).

```text
natura-care-client/
├── src/
│   ├── middleware.ts                              # Route guard; /home-content is in ADMIN_ONLY_ROUTES (not EMPLOYEE_ROUTES); "/" is public
│   │
│   ├── app/
│   │   ├── layout.tsx                             # Root: GTM, QueryProvider → NextAuthProvider → ConfirmProvider, Toaster
│   │   ├── (public)/
│   │   │   ├── layout.tsx                         # Storefront shell: PromotionBar + Navbar (fixed), Footer
│   │   │   ├── page.tsx                           # "/": metadata, 3 JSON-LD blocks, dynamic(() => import(modules/home/public/Home))
│   │   │   └── discover-more/[slug]/page.tsx      # Renders ProductDetails (orphan route, see §28)
│   │   ├── (customer)/layout.tsx                  # Also mounts PromotionBar (reads home content)
│   │   └── (admin)/
│   │       ├── layout.tsx                         # AdminNavbar + AdminSidebar shell
│   │       └── home-content/page.tsx              # metadata + dynamic(() => import(modules/home/admin/HomeContent))
│   │
│   ├── modules/home/
│   │   ├── admin/
│   │   │   ├── HomeContent.tsx                    # Page: URL-driven tabs, count badges, SectionHint, "View home page"
│   │   │   ├── home-content.cells.tsx             # Shared table cells: Status, Position, Link, Updated, Thumbnail, Actions
│   │   │   ├── home-form.parts.tsx                # Shared form parts: FormSection, FormActions, AuditMeta, inactive lock
│   │   │   ├── top-title/
│   │   │   │   ├── TopTitle.tsx                   # List (PROMOTION_BAR) + edit modal
│   │   │   │   ├── top-title.columns.tsx          # Announcement · Status · Last Updated · Action
│   │   │   │   └── EditTopTitle.tsx               # PATCH: title, status
│   │   │   ├── hero-slider/
│   │   │   │   ├── HeroSlider.tsx                 # List (HERO_SLIDER) + add/edit modals + delete
│   │   │   │   ├── hero-slider.columns.tsx        # Slide · Opens · Position · Status · Last Updated · Action
│   │   │   │   ├── AddHeroSlider.tsx              # POST: imageFile, redirectUrl
│   │   │   │   └── EditHeroSlider.tsx             # PATCH: imageFile, redirectUrl, sortOrder, status
│   │   │   ├── ovc/
│   │   │   │   ├── OVC.tsx                        # List (OVC) + add/edit modals + delete
│   │   │   │   ├── ovc.columns.tsx                # Media · Opens · Position · Status · Last Updated · Action
│   │   │   │   ├── AddOvc.tsx                     # POST: one of videoFile / videoUrl / gifFile / imageFile + redirectUrl
│   │   │   │   └── EditOvc.tsx                    # PATCH: redirectUrl, sortOrder, status (media read-only preview)
│   │   │   ├── product-article/
│   │   │   │   ├── ProductArticle.tsx             # List (PRODUCT_ARTICLE) + add/edit modals + delete
│   │   │   │   ├── product-article.columns.tsx    # Article · Position · Status · Last Updated · Action
│   │   │   │   ├── AddProductArticle.tsx          # POST: title, description (HTML), imageFile
│   │   │   │   └── EditProductArticle.tsx         # PATCH: title, description, imageFile, sortOrder, status
│   │   │   └── platform-redirect/
│   │   │       ├── PlatformRedirect.tsx           # List (PLATFORM_REDIRECT) + edit modal
│   │   │       ├── platform-redirect.columns.tsx  # PLATFORMS map; Platform · Opens · Position · Status · Last Updated · Action
│   │   │       └── EditPlatformRedirect.tsx       # PATCH: redirectUrl, imageFile, sortOrder, status; live preview
│   │   ├── public/
│   │   │   ├── Home.tsx                           # Composes the home page sections in order
│   │   │   ├── HomeHero.tsx                       # Hero carousel (HERO_SLIDER)
│   │   │   ├── OurMustHaves.tsx                   # Featured products by category tab (products API)
│   │   │   ├── FeatureVideo.tsx                   # OVC renderer
│   │   │   ├── Review.tsx                         # Static customer reviews carousel
│   │   │   ├── ProductSpotlight.tsx               # Product article carousel (PRODUCT_ARTICLE)
│   │   │   ├── ShopBenefits.tsx + SimpleCard.tsx  # Static benefit icons
│   │   │   ├── FollowUs.tsx                       # Social tiles (PLATFORM_REDIRECT)
│   │   │   ├── NewArrival.tsx                     # Unused (commented out in Home.tsx)
│   │   │   └── DiscoverMore.tsx                   # Unused placeholder
│   │   ├── hooks/
│   │   │   ├── useHomeContent.ts                  # GET /display-data → five arrays
│   │   │   └── useHomeContentCounts.ts            # Total + active count per section (tab badges)
│   │   ├── schemas/                               # zod: top-title, hero-slider, ovc (+ ovcEditSchema), product-article, platform-redirect
│   │   ├── types/home-content.types.ts            # IHomeContent, IAdmin
│   │   └── constants/
│   │       ├── home-admin.constants.tsx           # HOME_CONTENT_SECTIONS (tabs, limits, hints), homeContentStatus
│   │       ├── home-modal.constants.ts            # HOME_MODAL_DIALOG_CLASS / _WIDTH
│   │       └── home.constants.ts                  # Storefront static data: tabList, reviewData, shopBenefitsData (+ dead mock data)
│   │
│   ├── components/
│   │   ├── layout/promo-bar/PromotionBar.tsx      # Site-wide bar: Top Title + promotion + free delivery
│   │   ├── layout/sidebar/AdminSidebar.tsx        # "Home" menu item (no employee flag → admins only)
│   │   ├── data-display/carousel/                 # CustomCarousel (products), CustomAutoCarousel (reviews)
│   │   ├── data-display/table/CustomTable.tsx
│   │   ├── form/                                  # InputField, SingleSelectSearch, TextEditor, SubmitButton, file-upload/SingleMediaInput
│   │   └── primitives/                            # modal/CustomModal2, ModalHeader, ModalFooter, tab/CustomTab(GroupPrimary), button/AddButton, CancelButton, CustomTooltip
│   │
│   ├── hooks/
│   │   ├── api/                                   # useGet, useGetAll, useFormPost, useFormPatch, useDelete
│   │   ├── table/useHandleModalState.ts
│   │   └── useConfirm.ts                          # Promise-based confirm dialog (ConfirmProvider)
│   └── lib/utils/                                 # url.utils (getEmbedUrl), date.utils (formatDateDDMMYYYY)
```

**Page convention.** The route file only sets `metadata` and lazy-loads the module with a full-page loader:

```tsx
// src/app/(admin)/home-content/page.tsx
export const metadata: Metadata = { title: "Home Content | Natura Care Limited", ... };
const DynamicHomeContent = dynamic(() => import("@/modules/home/admin/HomeContent"), {
  loading: () => <LoadingPage />,
});
export default function HomeContentPage() {
  return <DynamicHomeContent />;
}
```

[↑ Back to top](#table-of-contents)

---

## 5. Routes & Role-Based Access Control

### Routes

| Route | Group | Entry component | Purpose |
|---|---|---|---|
| `/` | `(public)` | [`Home.tsx`](../src/modules/home/public/Home.tsx) | Storefront home page |
| `/home-content` | `(admin)` | [`HomeContent.tsx`](../src/modules/home/admin/HomeContent.tsx) | Manage the five sections |
| `/home-content?tab=heroSlider` | `(admin)` | same | Deep link to a tab (`promotionBar` is the default and drops the param) |
| every `(public)` and `(customer)` page | — | [`PromotionBar.tsx`](../src/components/layout/promo-bar/PromotionBar.tsx) | Shows the Top Title |

### Who can do what

Access is enforced in three layers. The client layers are for UX; **the API is the real gate**.

| Role | `/` (home page) | `/home-content` (middleware) | Sidebar "Home" item | Home content API |
|---|---|---|---|---|
| Guest | ✅ | Redirect → `/login` | — | `display-data` only |
| `CUSTOMER` | ✅ | Redirect → `/` | — | `display-data` only |
| `EMPLOYEE` | ✅ | Redirect → `/dashboard` (not in `EMPLOYEE_ROUTES`) | Hidden (`employee` flag not set) | `display-data` only; writes → 403 |
| `ADMIN` | ✅ | ✅ | Shown | Full: list, create, update, delete |

How each layer decides:

1. **Middleware** ([`src/middleware.ts`](../src/middleware.ts)) decodes the `accessToken` cookie and reads `role`. `/home-content` is in `ADMIN_ONLY_ROUTES` and is **not** in `EMPLOYEE_ROUTES`, so only `ADMIN` passes. `/` is in `PUBLIC_ROUTES`.
2. **Sidebar** ([`AdminSidebar.tsx`](../src/components/layout/sidebar/AdminSidebar.tsx)) shows only items with `employee: true` to employees, via `useCurrentUser().isUserEmployee`. "Home" has no flag.
3. **API**: every write and the admin list use `@Roles(Role.ADMIN)`. `GET /display-data` uses `IdentifyViewerGuard`: anyone can call it, admins get extra audit fields, and a token that is *sent but expired* returns 401 so the axios interceptor refreshes it (see [Auth module](./auth.md)).

> When adding a new admin-only route, update **both** `ADMIN_ONLY_ROUTES` in the middleware and the sidebar `menuItems`. Add `employee: true` and the route to `EMPLOYEE_ROUTES` only if staff should see it.

[↑ Back to top](#table-of-contents)

---

## 6. End-to-End Workflow

```text
 ADMIN (/home-content)                         API (/home-content)                    VISITOR (/)
 ─────────────────────                         ───────────────────                    ───────────
 Open tab ?tab=heroSlider
   └─ useGetAll ─────────────────────────────▶ GET all-home-content/HERO_SLIDER
                                                 (all statuses, page/limit, sortOrder)
 Add slide (image + optional link)
   └─ useFormPost (multipart) ───────────────▶ POST create-home-content
                                                 validates per type, saves file,
                                                 appends at end of section
   ◀─ toast + refetch() + counts re-query

 Edit slide (only dirty fields + type)
   └─ useFormPatch (multipart) ──────────────▶ PATCH update/:id
                                                 shifts positions if sortOrder sent,
                                                 replaces image (old file deleted)

 Delete slide → confirm dialog
   └─ useDelete ─────────────────────────────▶ DELETE delete/:id
                                                 hard delete, later items move up

                                               GET display-data  ◀──────────────────── useHomeContent()
                                                 ACTIVE only, per-section limit,         (one request, shared by
                                                 sorted by position                       PromotionBar, HomeHero,
                                                 → [{ name, data[] } × 5]                 FeatureVideo, Spotlight,
                                                                                          FollowUs)
```

**What the admin sees after saving.** The list refreshes in place. The storefront picks up the change on its next fetch of `display-data` (next page load, or when the visitor's tab regains focus). The "View home page" button opens `/` in a new tab, which always fetches fresh data.

[↑ Back to top](#table-of-contents)

---

## 7. Admin Section — Screen Layout

[`HomeContent.tsx`](../src/modules/home/admin/HomeContent.tsx) renders one [`CustomTabGroupPrimary`](../src/components/primitives/tab/CustomTabGroupPrimary.tsx) with five tabs, built from `HOME_CONTENT_SECTIONS`.

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [📣 Top Title 1] [🖼 Hero Slider 6] [🎬 OVC 2] [📰 Product Articles 3] [↗ Platform 4] │  [View home page ↗]
├──────────────────────────────────────────────────────────────────────────────────┤
│ 🖼 Hero Slider                                          ● 6 active, but the home   │
│    The large rotating banners at the top of the home page.   page shows up to 5…  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Hero Slider                                                     [+ Add Hero Slider]│
│ ┌ Slide ───────────┬ Opens ──────────┬ Position ┬ Status ─┬ Last Updated ┬ Action ┐│
│ │ [img] Slide 1    │ naturacarebd.com│   #1     │ ● Active│ 11-10-2026   │ ✎ 🗑   ││
│ │       banner.webp│ /product        │          │         │ Updated by … │        ││
│ └──────────────────┴─────────────────┴──────────┴─────────┴──────────────┴────────┘│
└──────────────────────────────────────────────────────────────────────────────────┘
```

| Element | Behaviour |
|---|---|
| **Tab in the URL** | The active tab is `?tab=<value>`. A refresh or shared link opens the same tab. An unknown value falls back to Top Title. Switching uses `router.replace` (no back-button history) with `scroll: false`. The default tab removes the param. |
| **Count badge** | `counts[type].total` from `useHomeContentCounts` (all statuses). Hidden while loading or if that count failed. |
| **Section hint** (`SectionHint`) | Icon, label and one-line hint saying where the section appears, plus a status pill: |
| | • green `"3 active · the home page shows up to 5"` when within the limit |
| | • amber `"Nothing is active, so this section is hidden on the home page"` |
| | • amber `"6 active, but the home page shows up to 5: only the first 5 by order appear"` |
| **View home page** | Opens `/` in a new tab. |
| **Suspense** | `useSearchParams` needs a Suspense boundary in the App Router; the fallback is five pulsing tab placeholders. |

[↑ Back to top](#table-of-contents)

---

## 8. Admin Section — Shared Table & Form Patterns

All five tabs are built the same way. Learn it once here; §9–§13 list only what differs.

### 8.1 List component

```tsx
const { modalData, isOpen, handleOpen, handleClose } = useHandleModalState<IHomeContent>();
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

const { data, isLoading, refetch } = useGetAll<{ data: IHomeContent[]; meta: IMeta }>(
  `/home-content/all-home-content/HERO_SLIDER`,
  ["getAllHeroContent", String(currentPage), String(pageSize), searchTerm, sortOrder],
  { page: currentPage, limit: pageSize, search: searchTerm || undefined, sortOrder },
);
```

- Paginated server-side, 10 rows per page by default, sorted by position ascending.
- The search bar is hidden (`showSearchbar={false}`); the API supports `search` but the sections are small.
- Columns are factories: `HeroSliderColumns(onEdit, onDelete)` returns `ColumnDef<IHomeContent>[]`. Sorting is disabled per column.

### 8.2 Shared cells ([`home-content.cells.tsx`](../src/modules/home/admin/home-content.cells.tsx))

| Cell | Shows |
|---|---|
| `StatusCell` | Green "Active" / red "Inactive" ring badge with a dot; tooltip "Shown on / Hidden from the home page" |
| `PositionCell` | `#n` chip, or "—" when the item has no position (legacy rows) |
| `LinkCell` | Host on top, path below, opens in a new tab; "—" with "No link: the item is not clickable" |
| `UpdatedCell` | Date + "Updated by X" (falls back to "Created by X") |
| `Thumbnail` | Fixed frame; `wide` for banners, square for icons; GIFs unoptimised |
| `ActionsCell` | Edit button, and Delete when `onDelete` is passed |
| `EmptyCell`, `BADGE_BASE` | Muted "—", shared badge classes |

### 8.3 Modals

Every add/edit form opens in [`CustomModal2`](../src/components/primitives/modal/CustomModal2.tsx) with `HOME_MODAL_DIALOG_CLASS` and `HOME_MODAL_DIALOG_WIDTH`:

- The dialog itself is the **only** scroll area (max 85vh / 80vh). Forms must not add their own `max-height` or `overflow`, or a second scrollbar appears.
- Width: full minus 12px gutters on phones, `max-w-2xl` on tablets, `max(42rem, 60vw)` on desktop.
- [`ModalHeader`](../src/components/primitives/modal/ModalHeader.tsx) is sticky (icon, eyebrow, title, description); `FormActions` pins Cancel + Submit to the bottom via [`ModalFooter`](../src/components/primitives/modal/ModalFooter.tsx).

### 8.4 Form building blocks ([`home-form.parts.tsx`](../src/modules/home/admin/home-form.parts.tsx))

| Export | Purpose |
|---|---|
| `HOME_FORM_WRAPPER` | Padding the sticky header and footer are built around (`p-4 sm:p-6`) |
| `FormSection`, `FormDivider` | Titled groups of fields with a one-line description |
| `FormActions` | Cancel + Submit, pinned; must be the last child of the `<form>` |
| `AuditMeta` | "Created by Samiha on 11-10-2026 · Last updated by … on …" |
| `inactiveAwareResolver(schema)` | Validates the full schema, or **only `status`** while Inactive is selected |
| `LockableFieldset` | `<fieldset disabled>` + fade for the fields an inactive item may not change |
| `InactiveLockNotice` | Amber note: "This slide is inactive, so its link, position and image are locked…" |

### 8.5 Add workflow

1. `useForm` with `zodResolver(schema)`.
2. On submit, build `FormData` with `type` plus the section's fields. Empty optional links are **not** sent.
3. `useFormPost("/home-content/create-home-content")` sends it as multipart.
4. On a 2xx: `reset()`, `refetch()`, close. The success toast comes from the hook.

New items always go to the **end** of the section; the add forms have no position field.

### 8.6 Edit workflow (dirty fields only)

1. `useForm` with `inactiveAwareResolver(schema)` and defaults from the row (`order ← sortOrder`, `media ← image`, `url ← redirectUrl`).
2. **Inactive lock.** `useWatch` on `status`. When it becomes `INACTIVE`, an effect calls `resetField()` on every other field (discarding unsaved edits) and `LockableFieldset` disables them. Rationale: a hidden item only needs its status changed, and a stored value that fails today's rules (e.g. an old link without `https://`) must not block hiding it.
3. On submit:
   - Nothing changed (`!isDirty`) → `toast.info("No changes detected!")`, close, no request.
   - Otherwise send `type` (always) + each field in `dirtyFields`. While inactive, only `status`.
   - An emptied link is sent as `""` so the server removes it.
   - A new image is sent only when the field holds a `File` (not the existing URL string).
4. `useFormPatch` → `PATCH /home-content/update/:id`. On a 2xx: close and `refetch()`.

### 8.7 Delete workflow

```tsx
const { mutateAsync } = useDelete("getAllHeroContent");
const { confirmDelete } = useConfirm();

confirmDelete({
  itemName: "slide",
  description: `This slide will be removed from the home page. This action cannot be undone.`,
  onConfirm: () => mutateAsync(`/home-content/delete/${data.id}`),
});
```

The confirm dialog shows a spinner while the request runs and stays open on failure so the admin can retry. Delete is a **hard delete** on the server (row and files). To take something down temporarily, set it Inactive instead.

### 8.8 Tab counts stay in sync

The tab panels refresh with their own `refetch()`, not a shared query key. `useHomeContentCounts` therefore subscribes to the React Query **mutation cache** and re-runs whenever any mutation succeeds. The hook only lives on this page, so the subscription is cheap.

[↑ Back to top](#table-of-contents)

---

## 9. Admin Section — Top Title

| | |
|---|---|
| Files | [`TopTitle.tsx`](../src/modules/home/admin/top-title/TopTitle.tsx), [`EditTopTitle.tsx`](../src/modules/home/admin/top-title/EditTopTitle.tsx), [`top-title.columns.tsx`](../src/modules/home/admin/top-title/top-title.columns.tsx) |
| API type | `PROMOTION_BAR` |
| Actions | Edit only (no add, no delete) |
| Columns | Announcement · Status · Last Updated · Action |

**Edit form:** Visibility (Status) → Announcement (Text, required, 3–255 characters). Placeholder: "Free delivery on orders over 1500 BDT".

**Where it shows:** in the promotion bar, see [§16](#16-storefront--promotion-bar). With no active Top Title, the bar falls back to "Embrace the essence of nature with Natura Care".

[↑ Back to top](#table-of-contents)

---

## 10. Admin Section — Hero Slider

| | |
|---|---|
| Files | [`HeroSlider.tsx`](../src/modules/home/admin/hero-slider/HeroSlider.tsx), [`AddHeroSlider.tsx`](../src/modules/home/admin/hero-slider/AddHeroSlider.tsx), [`EditHeroSlider.tsx`](../src/modules/home/admin/hero-slider/EditHeroSlider.tsx), [`hero-slider.columns.tsx`](../src/modules/home/admin/hero-slider/hero-slider.columns.tsx) |
| API type | `HERO_SLIDER` |
| Actions | Add, edit, delete |
| Columns | Slide (thumbnail, "Slide n", file name) · Opens · Position · Status · Last Updated · Action |

**Add form:** Link (optional, must start with `http(s)://`, max 255) → Slide image (required, `image/*`, 5 MB, about 1920 × 600 px recommended).
Sent: `type=HERO_SLIDER`, `imageFile`, `redirectUrl` (only if not empty).

**Edit form:** Visibility → Link + Position → Slide image. Uploading a new image replaces the old one (the server deletes the old file).
Sent: `type` + dirty `status`, `redirectUrl`, `sortOrder`, `imageFile`.

**Storefront:** the first 5 active slides, see [§15.1](#151-hero-carousel-homehero).

[↑ Back to top](#table-of-contents)

---

## 11. Admin Section — OVC

| | |
|---|---|
| Files | [`OVC.tsx`](../src/modules/home/admin/ovc/OVC.tsx), [`AddOvc.tsx`](../src/modules/home/admin/ovc/AddOvc.tsx), [`EditOvc.tsx`](../src/modules/home/admin/ovc/EditOvc.tsx), [`ovc.columns.tsx`](../src/modules/home/admin/ovc/ovc.columns.tsx) |
| API type | `OVC` |
| Actions | Add, edit (link, position, status), delete |
| Columns | Media (kind + preview) · Opens · Position · Status · Last Updated · Action |

**Add form.** A segmented picker chooses **one** media kind; only that input is rendered:

| Kind | Input | Accepts | Max size | Sent as |
|---|---|---|---|---|
| Video file (default) | `SingleMediaInput` | `video/*` (server: MP4, MOV, AVI) | 150 MB | `videoFile` |
| Video link | `InputField` | URL (YouTube or hosted video) | — | `videoUrl` |
| GIF | `SingleMediaInput` | `image/gif` | 10 MB | `gifFile` |
| Image | `SingleMediaInput` | `image/*` (server: JPEG, PNG, WebP) | 5 MB | `imageFile` |

Switching kind clears the other three values and their errors, so two media can never be sent together (the server rejects that). `ovcSchema.superRefine` also enforces "at least one" and "only one"; the error is attached to `videoFile` and shown next to the picker when another kind is on screen.

Then Link (optional). Sent: `type=OVC`, the one media field, `redirectUrl` if not empty.

**Edit form** (`ovcEditSchema`): Visibility → Link + Position → a read-only **media preview** (outside the lock, so it is always viewable). The media cannot be changed: "To swap the media, delete this OVC and add a new one."

**Storefront:** only the first active OVC, see [§15.3](#153-feature-video-featurevideo).

[↑ Back to top](#table-of-contents)

---

## 12. Admin Section — Product Articles

| | |
|---|---|
| Files | [`ProductArticle.tsx`](../src/modules/home/admin/product-article/ProductArticle.tsx), [`AddProductArticle.tsx`](../src/modules/home/admin/product-article/AddProductArticle.tsx), [`EditProductArticle.tsx`](../src/modules/home/admin/product-article/EditProductArticle.tsx), [`product-article.columns.tsx`](../src/modules/home/admin/product-article/product-article.columns.tsx) |
| API type | `PRODUCT_ARTICLE` |
| Actions | Add, edit, delete |
| Columns | Article (thumbnail + title) · Position · Status · Last Updated · Action |

**Add form:** Content (Title 3–255; Description via the rich-text `TextEditor`, min 10 characters) → Image (required, `image/*`, 5 MB).
Sent: `type=PRODUCT_ARTICLE`, `title`, `description` (HTML), `imageFile`.

`TextEditor` stores `""` when the editor holds no visible text, so an "empty" Quill value (`<p><br></p>`) does not pass the required check.

**Edit form:** Visibility → Content → Position → Image. Sent: `type` + dirty `status`, `title`, `description`, `sortOrder`, `imageFile`.

**Storefront:** first 3 active, rendered as HTML, see [§15.5](#155-product-spotlight-productspotlight).

[↑ Back to top](#table-of-contents)

---

## 13. Admin Section — Platform Redirect

| | |
|---|---|
| Files | [`PlatformRedirect.tsx`](../src/modules/home/admin/platform-redirect/PlatformRedirect.tsx), [`EditPlatformRedirect.tsx`](../src/modules/home/admin/platform-redirect/EditPlatformRedirect.tsx), [`platform-redirect.columns.tsx`](../src/modules/home/admin/platform-redirect/platform-redirect.columns.tsx) |
| API type | `PLATFORM_REDIRECT` |
| Actions | Edit only |
| Columns | Platform (brand badge + uploaded image) · Opens · Position · Status · Last Updated · Action |

`PLATFORMS` (in the columns file) maps `FACEBOOK | INSTAGRAM | YOUTUBE | LINKEDIN` to a label, a `react-icons` icon and brand-coloured badge classes. The edit form reuses it.

**Edit form:**

1. **Live preview** of the tile: icon (a newly picked file is previewed from a `blob:` URL, revoked on change) and the destination host.
2. **Platform** — `platformName` and `platformType` shown as read-only fields with a lock ("Set when the platform was added and cannot be changed").
3. **Visibility** — Status.
4. **Link and position** — Link is **required** here (an icon with no link goes nowhere; the server rejects an empty link for this type).
5. **Icon** — `image/*`, 5 MB.

Sent: `type` + dirty `status`, `redirectUrl`, `sortOrder`, `imageFile`.

[↑ Back to top](#table-of-contents)

---

## 14. Storefront — Home Page Composition

```text
(public)/layout.tsx
├── PromotionBar               ← home content PROMOTION_BAR + promotion + free delivery   (desktop only)
├── Navbar
├── (public)/page.tsx          ← metadata + JSON-LD (server component)
│   └── Home.tsx  (client, lazy-loaded with LoadingPage)
│       ├── HomeHero           ← HERO_SLIDER
│       └── <main container>
│           ├── OurMustHaves   ← GET /products/active?featured=true&limit=100
│           ├── FeatureVideo   ← OVC
│           ├── Review         ← static reviewData
│           ├── ProductSpotlight ← PRODUCT_ARTICLE
│           ├── ShopBenefits   ← static shopBenefitsData
│           └── FollowUs       ← PLATFORM_REDIRECT
└── Footer
```

Rendering model:

- `page.tsx` is a **server component**. It emits the metadata and structured data, then lazy-loads `Home` with `next/dynamic`.
- Every section is a **client component** and fetches through React Query. The first HTML therefore holds skeletons, not content.
- Each section owns its loading and empty state:

| Section | While loading | No data |
|---|---|---|
| HomeHero | One full-size skeleton slide | Empty carousel frame (see [§28](#28-known-issues--technical-debt)) |
| OurMustHaves | Carousel skeleton | Empty carousel |
| FeatureVideo | Video-sized skeleton | Section hidden |
| ProductSpotlight | Two-column skeleton | Section hidden |
| FollowUs | 4 square skeletons | Heading with an empty grid |
| Review, ShopBenefits | — (static) | — |

[↑ Back to top](#table-of-contents)

---

## 15. Storefront — Section by Section

### 15.1 Hero carousel (`HomeHero`)

- Data: `heroSliders` from `useHomeContent()` (≤ 5, in position order).
- Embla carousel with `Autoplay({ delay: 3000, stopOnInteraction: false })`; pauses on hover, resumes on leave.
- Fixed aspect ratio `1736 / 554`, `object-cover`. The first slide is `priority` (LCP image).
- Prev/next arrows from `sm` up; dot indicators when there is more than one slide.
- Each slide is a `<Link href={redirectUrl || "/"} target="_blank">`.

### 15.2 Our Must-Haves (`OurMustHaves`)

Not home content. Uses `useProduct()` ([product module](./product.md)):

- `GET /products/active?featured=true&limit=100`, key `["getFeaturedProducts"]`.
- Grouped client-side into Hair / Skin / Body / Others by `categoryName`, or `categoryParentId` `1` / `2` / `3`.
- Tabs from `tabList` in `home.constants.ts` (All, Hair Care, Skin Care, Body Care, Other); each tab renders `CustomCarousel` of product cards.

To feature a product, mark it **Featured** in the admin product form.

### 15.3 Feature video (`FeatureVideo`)

- Data: `ovc[0]`. Nothing active → the section is not rendered.
- Renders by media kind ([§2.4](#24-ovc-media-kinds)): image/GIF → `<Image>`; uploaded video → `<video autoPlay muted loop playsInline>` (muted is required for autoplay); link → `<iframe src={getEmbedUrl(url)}>`.
- Wrapped in `<Link href={redirectUrl || "/"} target="_blank">`.

### 15.4 Customer reviews (`Review`)

Static. `reviewData` (9 reviews: name, star rating, text) in `CustomAutoCarousel` with a 4 s delay. Changing reviews needs a code change and a deploy.

### 15.5 Product spotlight (`ProductSpotlight`)

- Data: `productArticles` (≤ 3). Nothing active → hidden.
- Autoplay carousel (3 s). Each slide: text half (title + description HTML, clamped to 8 lines) and image half; stacks image-first on mobile.
- The background is chosen **by index**, not by the admin: slide 1 green, slide 2 cream/brown text, slide 3+ sage. Reordering articles changes their colours.
- The description is rendered with `dangerouslySetInnerHTML` (HTML from the admin's rich-text editor).

### 15.6 Shop benefits (`ShopBenefits`)

Static. Five `SimpleCard`s from `shopBenefitsData` (icon + title). Grid of 2 below `lg`, 5 from `lg`; an odd last card spans both columns on small screens.

### 15.7 Stay Close to Natura (`FollowUs`)

- Data: `platformRedirects` (≤ 4). Grid of 2 below `md`, 4 from `md`.
- The **uploaded image fills the whole square tile** (`object-cover`); a round white badge with the `react-icons` platform icon sits on top. An unknown `platformType` falls back to the LinkedIn icon.
- The whole tile links to `redirectUrl` in a new tab.

[↑ Back to top](#table-of-contents)

---

## 16. Storefront — Promotion Bar

[`PromotionBar.tsx`](../src/components/layout/promo-bar/PromotionBar.tsx) sits above the navbar in the `(public)` and `(customer)` layouts. It combines three sources:

| Source | Hook |
|---|---|
| Top Title (`PROMOTION_BAR`) | `useHomeContent().promotionBar[0]?.title` |
| Current / upcoming promotion | `useCurrentPromotion()` ([promotion module](../src/modules/promotion/)) |
| Free-delivery threshold | `useFreeDelivery()` |

| State | Bar content |
|---|---|
| Either source loading | Skeleton pills (fixed 48 px height, so the fixed navbar never jumps) |
| **No promotion** | Top Title (or fallback "Embrace the essence of nature with Natura Care") · "Free delivery over ৳X" |
| **Promotion running or upcoming** | Top Title (only from `xl`, truncated) · free delivery · discount badge + countdown · copyable coupon · "All deals (n)" when there is more than one promotion |

Countdown: "Ends in 3 days" normally; a live `HH:MM:SS` in the last 24 hours. Copying the coupon shows "Copied!" for 2 s and announces it to screen readers.

> The bar is **desktop only** (`max-lg:hidden`). Below 1024 px the Top Title is not shown anywhere.

[↑ Back to top](#table-of-contents)

---

## 17. SEO

Set in [`src/app/(public)/page.tsx`](../src/app/(public)/page.tsx):

| Item | Value |
|---|---|
| `title` | "Home - Natura Care Limited Bangladesh" (root template adds " \| Natura Care Limited") |
| `description`, `keywords` | Natural personal care, hair/skin care Bangladesh, Padma Group… |
| Open Graph / Twitter | `summary_large_image`, `/images/brand/logo-hero-og.png` (1200 × 630) |
| `alternates.canonical` | `/` |
| JSON-LD | `Organization` (founder/parent: Padma Group of Converters), `WebSite` with a `SearchAction`, `BreadcrumbList` (Home) |
| Sitemap | `/` with priority 1, `daily` ([`sitemap.ts`](../src/app/sitemap.ts)) |
| robots | `/` allowed; admin and account paths disallowed ([`robots.ts`](../src/app/robots.ts)) |

The admin page has its own `metadata` ("Home Content | Natura Care Limited"). Admin URLs are also blocked by the middleware, so they are never indexed. See [SEO concepts](./concepts/seo.md).

[↑ Back to top](#table-of-contents)

---

## 18. API Reference

Base: `NEXT_PUBLIC_API_BASE_URL` (browser) / `INTERNAL_API_BASE_URL` (server-side in Docker). Full contract: [server docs](../../natura-care-server/docs/home-content.md).

| Method | Path | Auth | Used by | Body / params | Returns |
|---|---|---|---|---|---|
| `GET` | `/home-content/display-data` | Public (role-aware) | `useHomeContent` | — | `[{ name, data: IHomeContent[] }]` × 5, active only, limited |
| `GET` | `/home-content/all-home-content/:type` | `ADMIN` | Every admin tab, `useHomeContentCounts` | `page`, `limit`, `search`, `sortOrder`, `status` | `{ data: IHomeContent[], meta }` |
| `POST` | `/home-content/create-home-content` | `ADMIN` | Add Hero / OVC / Article | multipart: `type` + section fields | created item |
| `PATCH` | `/home-content/update/:id` | `ADMIN` | Every edit form | multipart: `type` + changed fields | updated item |
| `DELETE` | `/home-content/delete/:id` | `ADMIN` | Hero / OVC / Article delete | — | `data: null` |

**`display-data` section names** (what `useHomeContent` looks up):

| `name` | Type | Hook field |
|---|---|---|
| `promotionBar` | `PROMOTION_BAR` | `promotionBar` |
| `heroSliders` | `HERO_SLIDER` | `heroSliders` |
| `ovc` | `OVC` | `ovc` |
| `productArticles` | `PRODUCT_ARTICLE` | `productArticles` |
| `platformRedirects` | `PLATFORM_REDIRECT` | `platformRedirects` |

**Fields each type accepts:**

| Field | PROMOTION_BAR | HERO_SLIDER | OVC | PRODUCT_ARTICLE | PLATFORM_REDIRECT |
|---|:-:|:-:|:-:|:-:|:-:|
| `title` | **R** | — | (server-set) | **R** | — |
| `description` | — | — | — | **R** | — |
| `imageFile` | — | **R** | one of | **R** | **R** |
| `gifFile` / `videoFile` / `videoUrl` | — | — | one of (create only) | — | — |
| `redirectUrl` | — | optional | optional | — | **R** |
| `platformName` / `platformType` | — | — | — | — | **R** (create) |
| `status`, `sortOrder` | ✓ | ✓ | ✓ | ✓ | ✓ |

**R** = required on create. Sending a field the type doesn't use returns 400 (e.g. `"Hero slider does not use: title."`). On update only `imageFile` is accepted as a file.

[↑ Back to top](#table-of-contents)

---

## 19. Query Keys & Caching

| Key | Hook / component | Invalidated by |
|---|---|---|
| `["getHomeContentDisplay"]` | `useHomeContent` (storefront, promotion bar) | Nothing; refetches on mount / window focus (React Query defaults) |
| `["getAllTopTitle", page, size, search, sort]` | `TopTitle` | local `refetch()` after edit |
| `["getAllHeroContent", …]` | `HeroSlider` | `refetch()`; `useDelete("getAllHeroContent")` |
| `["getAllOvcContent", …]` | `OVC` | `refetch()`; `useDelete("getAllOvcContent")` |
| `["getAllProductArticle", …]` | `ProductArticle` | `refetch()`; `useDelete("getAllProductArticle")` |
| `["getAllSocialMediaContent", …]` | `PlatformRedirect` | `refetch()` |
| `["homeContentCounts"]` | `useHomeContentCounts` (`staleTime: 30s`) | Any successful mutation (mutation-cache subscription) |
| `["getFeaturedProducts"]` | `useProduct` (Must-Haves) | Product module |

`useDelete(key)` invalidates by **prefix**, so `"getAllHeroContent"` matches every page/size variant of the list.

**Shared request.** `PromotionBar`, `HomeHero`, `FeatureVideo`, `ProductSpotlight` and `FollowUs` all call `useHomeContent()`. They share one cache entry, so the home page makes a single `display-data` request, and other pages make it once for the promotion bar.

**Retries.** `QueryProvider` retries failed queries up to twice for network/5xx errors and never for 4xx. Mutations never retry.

[↑ Back to top](#table-of-contents)

---

## 20. Types

[`src/modules/home/types/home-content.types.ts`](../src/modules/home/types/home-content.types.ts)

```ts
export interface IAdmin {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface IHomeContent {
  id: number;
  sid: string;                                         // admin shape only
  type: "PROMOTION_BAR" | "HERO_SLIDER" | "OVC" | "PRODUCT_ARTICLE" | "PLATFORM_REDIRECT";
  status: "ACTIVE" | "INACTIVE";                       // admin shape only
  sortOrder: number;                                   // position; may be null on legacy rows
  title?: string;                                      // PROMOTION_BAR text, article heading, OVC video file name
  image?: string;                                      // full URL: hero / article / icon / OVC image or GIF
  videoUrl?: string;                                   // OVC uploaded video URL or external link
  platformName?: string;
  redirectUrl?: string;
  platformType?: "FACEBOOK" | "YOUTUBE" | "INSTAGRAM" | "LINKEDIN";
  description?: string;                                // article HTML
  createdAt: string;                                   // admin shape only
  updatedAt?: string;
  createdBy: IAdmin;                                   // admin shape only (null if the user was deleted)
  updatedBy?: IAdmin;
}
```

The storefront receives the **public** shape (no `sid`, `status`, timestamps or audit users), but the client uses the same interface for both. Never rely on admin-only fields in `public/` components.

Other types used here:

| Type | From | Used for |
|---|---|---|
| `IHomeContentSection` | `home-admin.constants.tsx` | Tab config (value, label, type, icon, homeLimit, hint) |
| `IHomeContentCount` | `useHomeContentCounts.ts` | `{ total, active }` per section |
| `IModal` | `@/types` | Props of every add/edit form: `setOpen`, `refetch`, `onClose`, `data`, `isLoading` |
| `IMeta`, `IPaginationMeta` | `@/types` | List metadata |
| `ITabList`, `ITabContent`, `ITabListPrimary` | `@/types` | Tabs |
| `ISimpleCard` | `@/types` | Shop benefit card |
| `IProduct` | product module | Must-Haves |

[↑ Back to top](#table-of-contents)

---

## 21. Validation Schemas

All in [`src/modules/home/schemas/`](../src/modules/home/schemas/). Limits match the server.

| Schema | Fields & rules |
|---|---|
| `topTitleSchema` | `title`: trimmed, 3–255 · `status`: `ACTIVE`/`INACTIVE` (required) |
| `heroSliderSchema` | `media`: `string` (existing URL) or `File`, required · `redirectUrl`: optional, `""` or `^https?://\S+\.\S+`, max 255 · `status` · `order`: positive |
| `ovcSchema` (add) | `videoFile` / `gifFile` / `imageFile`: `File` or existing media or `null` · `videoUrl`: URL or `""` · `redirectUrl`: URL or `""` · `superRefine`: **exactly one** media |
| `ovcEditSchema` | `redirectUrl`: `""` or http(s), max 255 · `status` · `order` |
| `productArticleSchema` | `title`: 3–255 · `description`: min 10 · `media`: required · `status` · `order` |
| `platformRedirectSchema` | `url`: **required**, starts with http(s), valid URL, max 255 · `media`: required · `status` · `order` |

Edit forms wrap their schema in `inactiveAwareResolver`, so while Inactive is selected only `status` is validated.

[↑ Back to top](#table-of-contents)

---

## 22. Constants

| Constant | File | Purpose |
|---|---|---|
| `HOME_CONTENT_SECTIONS` | [`home-admin.constants.tsx`](../src/modules/home/constants/home-admin.constants.tsx) | **Single source** for the admin tabs: order, label, API type, icon, `homeLimit`, hint. `homeLimit` must match the server. |
| `DEFAULT_HOME_CONTENT_TAB` | same | `"promotionBar"` |
| `homeContentTabList`, `homeDashboardTabContent` | same | Tab labels and the panel component per tab |
| `homeContentStatus` | same | Options for the Status select: Active / Inactive |
| `HOME_MODAL_DIALOG_CLASS`, `HOME_MODAL_DIALOG_WIDTH` | [`home-modal.constants.ts`](../src/modules/home/constants/home-modal.constants.ts) | Modal height/scroll and width (kept separate to avoid a circular import) |
| `PLATFORMS` | [`platform-redirect.columns.tsx`](../src/modules/home/admin/platform-redirect/platform-redirect.columns.tsx) | Platform → label, icon, badge colours |
| `tabList` | [`home.constants.ts`](../src/modules/home/constants/home.constants.ts) | Must-Haves category tabs |
| `reviewData` | same | Static customer reviews |
| `shopBenefitsData` | same | Static shop benefits |
| `products`, `heroData`, `productSpotlightData`, `followUsData` | same | **Unused** mock data from before the API existed |

[↑ Back to top](#table-of-contents)

---

## 23. Hooks

### Module hooks

| Hook | Returns | Notes |
|---|---|---|
| [`useHomeContent()`](../src/modules/home/hooks/useHomeContent.ts) | `promotionBar`, `heroSliders`, `ovc`, `productArticles`, `platformRedirects`, `homeContentData`, `isHomeContentLoading`, `homeContentRefetch` | `GET /display-data`. `getSectionData(name)` finds a section by `name` and falls back to `[]`, so components never need null checks. |
| [`useHomeContentCounts()`](../src/modules/home/hooks/useHomeContentCounts.ts) | `counts: { [type]: { total, active } }`, `isCountsLoading` | 10 tiny calls (`limit=1`, read `meta.totalItems`): total + active for each section. A failed section only hides its badge. |

### Shared hooks used here

| Hook | File | Role in this module |
|---|---|---|
| `useGet` | [`hooks/api/useGet.ts`](../src/hooks/api/useGet.ts) | Returns `response.data` (the display-data array); toasts on error |
| `useGetAll` | same | Returns the whole envelope `{ data, meta }` for paginated lists |
| `useFormPost` | [`hooks/api/useFormPost.ts`](../src/hooks/api/useFormPost.ts) | Multipart create; toasts success/errors (array messages one by one) |
| `useFormPatch` | [`hooks/api/useFormPatch.ts`](../src/hooks/api/useFormPatch.ts) | Multipart update; "Update successful!" toast |
| `useDelete` | [`hooks/api/useDelete.ts`](../src/hooks/api/useDelete.ts) | Delete + "Deleted successfully." + invalidate root key |
| `useHandleModalState` | [`hooks/table/useHandleModalState.ts`](../src/hooks/table/useHandleModalState.ts) | One `activeModal` (`view`/`edit`/`delete`) + its row |
| `useConfirm` | [`hooks/useConfirm.ts`](../src/hooks/useConfirm.ts) | `confirmDelete({ itemName, description, onConfirm })` |
| `useProduct` | product module | Featured products for Must-Haves |
| `useCurrentPromotion`, `useFreeDelivery` | promotion / free-delivery modules | Promotion bar |
| `useCurrentUser` | user module | Sidebar role filtering |

[↑ Back to top](#table-of-contents)

---

## 24. Utilities

| Utility | File | Used for |
|---|---|---|
| `getEmbedUrl(url)` | [`lib/utils/url.utils.ts`](../src/lib/utils/url.utils.ts) | Turns `youtube.com/watch?v=ID` / `youtu.be/ID` into `youtube.com/embed/ID`; other URLs unchanged |
| `formatDateDDMMYYYY` | [`lib/utils/date.utils.ts`](../src/lib/utils/date.utils.ts) | Table "Last Updated" and `AuditMeta` |
| `inactiveAwareResolver` | `home-form.parts.tsx` | See [§8.4](#84-form-building-blocks-home-formpartstsx) |
| `mediaOf(item)` | `EditOvc.tsx` | OVC media kind ([§2.4](#24-ovc-media-kinds)) |
| `hostOf`, `pathOf` | `home-content.cells.tsx`, `EditPlatformRedirect.tsx` | Split a URL for display |
| `fileNameOf` | `hero-slider.columns.tsx` | Decoded file name from an image URL |
| `formatTk` | cart module | "৳1,500" in the promotion bar |
| `cn` | [`lib/utils.ts`](../src/lib/utils.ts) | Class merging |

[↑ Back to top](#table-of-contents)

---

## 25. Reusable Components

### Shared components this module uses

| Component | Path | Used for |
|---|---|---|
| `CustomTabGroupPrimary` | `components/primitives/tab/` | Admin tabs with icons, counts, `rightSlot`, controlled value |
| `CustomTab` | `components/primitives/tab/` | Must-Haves category tabs |
| `CustomTable` | `components/data-display/table/` | Every admin list (pagination, page size, skeleton) |
| `CustomModal2` | `components/primitives/modal/` | Every add/edit dialog |
| `ModalHeader`, `ModalFooter` | `components/primitives/modal/` | Sticky header / pinned actions |
| `ConfirmModal` (via `ConfirmProvider`) | `components/primitives/modal/` | Delete confirmation |
| `AddButton`, `CancelButton`, `SubmitButton` | `components/primitives/button/`, `components/form/` | Actions |
| `CustomTooltip` | `components/primitives/` | Edit/Delete icon buttons |
| `InputField` | `components/form/` | Text, URL and number (Position) inputs |
| `SingleSelectSearch` | `components/form/` | Status select |
| `SingleMediaInput` | `components/form/file-upload/` | Image / GIF / video upload with preview, type and size checks |
| `TextEditor` | `components/form/` | Article description (Quill) |
| `fieldBox`, `fieldLabel` | `components/form/formStyles.ts` | Read-only fields that look like inputs |
| `Carousel` (shadcn) | `components/ui/carousel.tsx` | Hero, spotlight |
| `CustomCarousel` | `components/data-display/carousel/` | Must-Haves product cards |
| `CustomAutoCarousel` | `components/data-display/carousel/` | Reviews |
| `Skeleton` | `components/ui/skeleton.tsx` | Every loading state |
| `LoadingPage` | `components/feedback/loading/` | Lazy-load fallback for both pages |

### Module components others could reuse

| Component | Notes |
|---|---|
| `StatusCell`, `PositionCell`, `LinkCell`, `UpdatedCell`, `Thumbnail`, `ActionsCell` | Generic enough for any admin table with status/position/audit columns |
| `FormSection`, `FormDivider`, `FormActions`, `AuditMeta` | Sectioned modal forms |
| `inactiveAwareResolver`, `LockableFieldset`, `InactiveLockNotice` | The "inactive locks everything but status" pattern |
| `SimpleCard` | Icon + title + subtitle card |

[↑ Back to top](#table-of-contents)

---

## 26. Error Handling & User Feedback

| Situation | What the user sees | Where it's handled |
|---|---|---|
| Create/update succeeds | Green toast with the server message | `useFormPost` / `useFormPatch` |
| Server validation error (400) | Red toast(s); array messages shown one per toast | same |
| Edit submitted with no changes | Info toast "No changes detected!", modal closes | each edit form |
| Delete fails | Red toast; confirm dialog stays open to retry | `useDelete` + `ConfirmProvider` |
| Session expired (401) | Silent refresh and retry; if refresh fails, signed out | `axiosInstance` |
| Not an admin (403) | "You do not have permission to access this resource" | `axiosInstance` |
| Network down | Redirect to `/network-error` | `axiosInstance` |
| 5xx | Redirect to `/error` | `axiosInstance` |
| `display-data` fails | Error toast; sections render empty/hidden | `useGet` |
| A tab count fails | That badge is hidden; the page still works | `useHomeContentCounts` |
| File too big / wrong type | Inline error in the upload box | `SingleMediaInput` |

[↑ Back to top](#table-of-contents)

---

## 27. Business Rules Summary

1. Only `ADMIN` can view or change home content. Employees and customers are redirected away from `/home-content`.
2. Five sections, one table. Each section shows its first 1 / 5 / 1 / 3 / 4 **active** items by position.
3. Inactive items are never sent to the storefront, to anyone.
4. Positions are per section, start at 1, have no gaps, and are kept by the server. New items go to the end.
5. Top Title and Platform Redirect cannot be added or deleted from the UI.
6. An OVC has exactly one media item, which cannot be replaced after creation.
7. A Platform Redirect must always have a link; Hero and OVC links are optional.
8. While an item is set to Inactive in an edit form, every other field is locked and only `status` is sent.
9. Edits send only the fields that changed, plus `type`; an emptied link is sent as `""` to remove it.
10. Delete is permanent (row and files). Use Inactive to hide something temporarily.
11. Uploads: images (JPEG/PNG/WebP) 5 MB, GIF 10 MB, video (MP4/MOV/AVI) 150 MB.
12. `homeLimit` in `HOME_CONTENT_SECTIONS` must equal the server's `HOME_PAGE_SECTIONS` limits.

[↑ Back to top](#table-of-contents)

---

## 28. Known Issues & Technical Debt

| # | Issue | Impact | Suggested fix |
|---|---|---|---|
| 1 | **Unlinked items still link.** Hero slides and the OVC use `href={redirectUrl \|\| "/"}` with `target="_blank"`. A slide the admin left "not clickable" opens the home page in a new tab. | Confusing UX; contradicts the admin hint | Render a plain `<div>` when `redirectUrl` is empty |
| 2 | **Empty hero.** With no active slides, `HomeHero` still renders the 1736:554 frame and arrows. | Large blank band at the top of the page | Return `null` (or a static fallback banner) when `heroSliders` is empty |
| 3 | **Client-only home content.** All sections fetch in the browser; the server HTML holds skeletons. | Hero (LCP) loads late; content isn't in the initial HTML for crawlers | Fetch `display-data` in `page.tsx` and pass it down, or prefetch with React Query hydration |
| 4 | **Top Title hidden on mobile.** `PromotionBar` is `max-lg:hidden`; during a promotion the title only shows from `xl`. | Announcements never reach phone users | Add a compact mobile bar |
| 5 | **`getEmbedUrl` edge cases.** `youtu.be/ID?si=…` keeps the query in the ID; `/shorts/ID` and `/embed/ID` aren't handled. | Broken embed for shared links | Parse with `URL` and read `v` / last path segment without the query |
| 6 | **Uploaded video MIME type.** `<source type="video/mp4">` is used for every upload, but MOV and AVI are accepted. | AVI (and some MOV) won't play in browsers | Accept MP4/WebM only, or omit `type` |
| 7 | **Iframe inside a link.** The OVC iframe is wrapped in `<Link>`; clicks go to the player, not the link. | Redirect link has no effect for video links | Don't wrap iframes; show a separate CTA instead |
| 8 | **Unsanitised article HTML.** `ProductSpotlight` renders `description` with `dangerouslySetInnerHTML`. | Only admins write it, but a compromised admin could inject script | Sanitise on save (server) and/or render with DOMPurify |
| 9 | **Spotlight colours follow position.** Background/text colours are hard-coded by slide index. | Reordering articles changes their look; a 4th style isn't possible | Store a theme per article, or accept it as design |
| 10 | **Platform tile vs icon guidance.** The admin form asks for "a square logo (at least 128 × 128 px)", but `FollowUs` stretches the image to fill a ~300–400 px tile. | Blurry tiles | Update the hint (e.g. 800 × 800 photo) or render the image as an icon |
| 11 | **Static reviews and benefits.** `reviewData` and `shopBenefitsData` are hard-coded. | Marketing changes need a deploy | Move to home content (new types) or a CMS |
| 12 | **Dead code.** `NewArrival.tsx`, `DiscoverMore.tsx` ("hi"), and the `products`, `heroData`, `productSpotlightData`, `followUsData` constants are unused. | Noise for new developers | Delete them |
| 13 | **Orphan route `/discover-more/[slug]`.** Renders `ProductDetails` with "Product Details" metadata; nothing links to it since spotlight moved to the API. | Duplicate product URLs if ever crawled | Remove the route, or redirect to `/product-details/[slug]` |
| 14 | **Unused `SearchAction` in JSON-LD.** Points to `/search?q=`, which doesn't exist. | Invalid sitelinks search box | Point it at `/product?search=` or remove it |
| 15 | **Duplicated limits.** `homeLimit` is copied from the server. | Warnings drift if one side changes | Return the limits from the API |
| 16 | **Local refetch instead of query invalidation.** Panels call `refetch()`; counts rely on a mutation-cache listener; the storefront key `getHomeContentDisplay` is never invalidated. | An admin with the storefront open in the same tab sees stale content until refocus | Invalidate `getHomeContentDisplay` and the list root keys on success |
| 17 | **Naming.** The component in `OVC.tsx` is exported as `HeroSlider`; `usePaginationQuery` exists but every tab re-implements page state. | Confusing stack traces and duplication | Rename to `OVC`; use `usePaginationQuery` |
| 18 | **One `IHomeContent` for both shapes.** Admin-only fields are typed as always present. | Easy to read `status` in a public component and get `undefined` | Split `IPublicHomeContent` / `IAdminHomeContent` |
| 19 | **No add form for Top Title / Platform Redirect.** | New platforms need API access | Add forms, or document the Swagger steps (see §29) |

[↑ Back to top](#table-of-contents)

---

## 29. How-To Recipes

### Change the announcement text

Admin → Home → **Top Title** → Edit → change Text → Save changes. It appears in the desktop promotion bar on the next page load.

### Schedule a hero slide for later

Add the slide, then edit it and set Status to **Inactive**. When it's time, set it Active and give it Position 1.

### Replace the video commercial

OVC → **Add OVC** with the new media (it goes last) → edit it to Position 1 → delete or deactivate the old one. Only the first active OVC shows.

### Add a new social platform (no UI)

Use Swagger (`/api-doc`) or Postman as an admin:

```text
POST /home-content/create-home-content   (multipart/form-data, Bearer <admin token>)
type=PLATFORM_REDIRECT
platformName=TikTok
platformType=<one of FACEBOOK | YOUTUBE | INSTAGRAM | LINKEDIN>
redirectUrl=https://www.tiktok.com/@naturacare
imageFile=<tile.jpg>
```

A new platform type also needs: the server enum, `IHomeContent["platformType"]`, `PLATFORMS` in `platform-redirect.columns.tsx`, and `renderIcon` in `FollowUs.tsx`.

### Change how many items a section shows

1. Server: `HOME_PAGE_SECTIONS` in `natura-care-server/src/modules/home-content/home-content.service.ts`.
2. Client: `homeLimit` in `HOME_CONTENT_SECTIONS`.
3. Update the form descriptions that quote the number ("up to 5").

### Add a sixth home content section

1. Server: add the enum value, create/update rules and a `HOME_PAGE_SECTIONS` entry.
2. Types: extend `IHomeContent["type"]`.
3. `useHomeContent`: add the section `name` and return its array.
4. Admin: create `admin/<section>/` with `<Section>.tsx`, `<section>.columns.tsx`, add/edit forms built from `home-form.parts` and `home-content.cells`, and a schema in `schemas/`.
5. Register it in `HOME_CONTENT_SECTIONS` and `homeDashboardTabContent`.
6. Storefront: add the component under `public/` and place it in `Home.tsx`.

### Feature a product in "Our Must-Haves"

Not home content: Admin → Products → edit → mark **Featured**, keep it Active. See [Product module](./product.md).

[↑ Back to top](#table-of-contents)

---

## 30. QA Checklist

**Access**
- [ ] Guest opening `/home-content` is sent to `/login`; customer to `/`; employee to `/dashboard`.
- [ ] Employee sidebar has no "Home" item; admin sidebar does.

**Admin screen**
- [ ] `?tab=ovc` opens the OVC tab; refresh keeps it; an unknown `?tab=` opens Top Title.
- [ ] Tab badges show totals and update after add/edit/delete.
- [ ] Hint turns amber with 0 active, and with more active than the limit.
- [ ] Edit with no changes shows "No changes detected!" and sends no request.
- [ ] Setting Inactive locks and resets the other fields; saving sends only `status`.
- [ ] Hero: link without `https://` is rejected; empty link is allowed and clears the link on edit.
- [ ] OVC: switching media kind clears the previous choice; only one media is sent; 150 MB video limit enforced.
- [ ] Article: empty editor fails validation; formatting survives a save.
- [ ] Platform: empty link is rejected; name and type are read-only; new icon previews before saving.
- [ ] Delete asks for confirmation, shows a spinner, and the remaining positions renumber.

**Storefront**
- [ ] Only active items appear, in position order, up to 1 / 5 / 1 / 3 / 4.
- [ ] Hero autoplays every 3 s, pauses on hover; dots and arrows work.
- [ ] OVC renders correctly for each media kind (MP4, YouTube link, GIF, image).
- [ ] Spotlight hidden when no article is active; FeatureVideo hidden when no OVC is active.
- [ ] Promotion bar shows the Top Title (no promotion) or promotion + coupon copy; hidden below 1024 px.
- [ ] Only one `display-data` request on the home page (Network tab).

[↑ Back to top](#table-of-contents)

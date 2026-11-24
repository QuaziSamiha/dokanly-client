# Contact Us Module — Frontend Technical Documentation

> **Scope:** everything the Natura Care client (Next.js 15, App Router) does with **contact messages**: the public Contact Us page (store details, map and message form) and the admin **Messages** inbox, where staff read messages, call or WhatsApp the sender back, mark messages as replied and keep internal notes.
>
> **Audience:** frontend engineers joining or maintaining the project. QA and backend engineers can use it to see the client's side of the contact-message contract.
>
> **Related:** [Project README](../README.md) (run, build, Docker) · [Auth module](./auth.md) (sign-in, session, route guard) · [User module](./user.md) (roles, customer account) · [Career module](./career.md) (same admin-screen conventions) · Server source: [`contact-message`](../../natura-care-server/src/modules/contact-message/) module · [Coding conventions](../claude-docs/basic-instructions.md)

| | |
|---|---|
| **Module root** | [`src/modules/contact/`](../src/modules/contact/) |
| **Admin route** | `/contact` (admin route group, page title "Messages") |
| **Storefront route** | `/contact-us` |
| **Other touchpoints** | Navbar "Contact Us" link, footer "Contact us" link and contact block, customer sidebar "Need help?" card, policy pages, admin sidebar "Contact" item, `sitemap.xml` |
| **Backend resource** | `/contact-messages/*` on `NEXT_PUBLIC_API_BASE_URL` (e.g. `https://api.naturacarebd.com/n-care/api/v1`) |
| **Access (API)** | Send: guests and customers (admins and employees get `403`) · Read, stats, update: `ADMIN` only |
| **Last reviewed** | 2026-10-24 |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Domain Model: Messages, Senders & Reply Status](#2-domain-model-messages-senders--reply-status)
3. [Tech Stack Used by This Module](#3-tech-stack-used-by-this-module)
4. [File Architecture](#4-file-architecture)
5. [Routes & Role-Based Access Control](#5-routes--role-based-access-control)
   - [5.1 Page routes (middleware)](#51-page-routes-middleware)
   - [5.2 API access (server guards)](#52-api-access-server-guards)
   - [5.3 Access matrix](#53-access-matrix)
6. [End-to-End Workflow](#6-end-to-end-workflow)
7. [Storefront — Contact Us Page (`/contact-us`)](#7-storefront--contact-us-page-contact-us)
   - [7.1 Page composition](#71-page-composition)
   - [7.2 Store details & map](#72-store-details--map)
   - [7.3 Contact form](#73-contact-form)
   - [7.4 Guest vs signed-in customer](#74-guest-vs-signed-in-customer)
8. [Admin Section — Messages Inbox (`/contact`)](#8-admin-section--messages-inbox-contact)
   - [8.1 Screen layout](#81-screen-layout)
   - [8.2 Data fetching](#82-data-fetching)
   - [8.3 Stats cards](#83-stats-cards)
   - [8.4 Filters, search, sorting & pagination](#84-filters-search-sorting--pagination)
   - [8.5 Table columns & responsive behaviour](#85-table-columns--responsive-behaviour)
   - [8.6 Quick "mark as replied" from the table](#86-quick-mark-as-replied-from-the-table)
9. [Admin Section — Message Details Modal](#9-admin-section--message-details-modal)
   - [9.1 Sections](#91-sections)
   - [9.2 Reply actions: Call, WhatsApp, Email, Copy](#92-reply-actions-call-whatsapp-email-copy)
   - [9.3 Reply status](#93-reply-status)
   - [9.4 Internal notes](#94-internal-notes)
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

The contact module is Natura Care's own support inbox. Visitors send a question from the website, and staff answer it by phone, WhatsApp or email, outside the app. The app only records **whether** someone has replied, plus private notes about the conversation.

| Actor | What they do | Where |
|---|---|---|
| **Guest** (not signed in) | Reads the store's phone, email and address; sends a message with name, phone and text. | `/contact-us` |
| **Customer** (signed in) | Same as a guest. The server links the message to their account, so the admin sees their account email and phone. | `/contact-us` |
| **Admin** | Reads messages, filters and searches the inbox, calls or WhatsApps the sender, marks messages replied or pending, writes internal notes. | `/contact` |
| **Employee** | No access to the inbox, and cannot send messages. | — |

Key design decisions:

- **Replies happen outside the app.** There is no reply composer and no email is sent by the server. The inbox gives one-tap `tel:`, `wa.me` and `mailto:` links, and the admin then marks the message as replied.
- **What the sender wrote is read-only.** The admin can change only `replied` and `notes` (`PATCH /contact-messages/:id`). The original message is kept exactly as received.
- **No account needed to send.** The endpoint is public. A token is optional and only used to link the message to a customer.
- **Staff cannot send messages.** The server rejects a message from a signed-in admin or employee with `403`, so the inbox only ever contains real customer and guest messages.
- **"Today" means Bangladesh time.** The server computes the *Received Today* and *last 7 days* counts in UTC+6, whatever the server's own time zone is.

[↑ Back to top](#table-of-contents)

---

## 2. Domain Model: Messages, Senders & Reply Status

A **contact message** is one submission from the Contact Us form.

| Field | Set by | Meaning |
|---|---|---|
| `id` | Server | Numeric id; used in the PATCH URL and shown as `#27` in the modal. |
| `sid` | Server | UUID-like reference; the modal shows its first 8 characters next to the id. |
| `firstName`, `lastName` | Sender | `lastName` is optional (`null` when not given). |
| `phone` | Sender | Call-back number, spaces removed by the server (e.g. `+8801750256844`). |
| `message` | Sender | The text, trimmed, line breaks kept. |
| `email` | — | Exists on the record but the form does not send it and the create endpoint rejects it. In practice it is `null`; the reply email comes from the linked account. |
| `userId`, `user` | Server | Set from the token when a **customer** sends the message; `null` for a guest. |
| `replied` | Admin | `false` on creation. Toggled by the admin. |
| `notes` | Admin | Internal notes, max 2,000 characters, never shown to the sender. |
| `createdAt`, `updatedAt` | Server | ISO timestamps. |

**Sender type** is derived, not stored:

```
userId !== null  →  "Customer"
userId === null  →  "Guest"
```

**Reply status** is a plain boolean:

```
          admin clicks "Mark as replied"
 Pending ─────────────────────────────────▶ Replied
 (replied = false)                          (replied = true)
         ◀─────────────────────────────────
          admin clicks "Mark as pending"
```

The API filters use the words `pending` / `replied` (status) and `guest` / `customer` (sender); the client maps its `"all"` tab to "no filter".

[↑ Back to top](#table-of-contents)

---

## 3. Tech Stack Used by This Module

| Concern | Library / tool | Used for |
|---|---|---|
| Framework | Next.js 15 App Router | Route pages, `metadata`, `next/dynamic` code-splitting |
| Server state | TanStack Query (via shared `useGet`, `useGetAll`, `usePost`, `usePatch`) | Inbox list, stats, create and update |
| HTTP | Axios (`axiosInstance`, `postService`) | Cookies sent with `withCredentials`, Bearer token attached by the interceptor |
| Forms | React Hook Form + `@hookform/resolvers/zod` + Zod | Contact form |
| Phone input | `react-phone-number-input` (through `PhoneInputField`) | International phone, default country BD |
| Table | TanStack Table (through `CustomTable`) | Inbox table, server-side pagination |
| Dialog | Radix Dialog (through `CustomModal2`) | Message details modal |
| Dates | `date-fns` | "5 minutes ago", "12 Oct 2026, 2:45 PM" |
| Toasts | `sonner` | API results, copy-to-clipboard feedback |
| Icons | `lucide-react`, `react-icons` | UI icons, WhatsApp logo |
| Styling | Tailwind CSS with the project's colour tokens (`greenPrimary`, `neutralPrimary`, `warningPrimary`, `success`, …) | All screens |

[↑ Back to top](#table-of-contents)

---

## 4. File Architecture

```
src/
├── app/
│   ├── (public)/contact-us/page.tsx        # Storefront route: metadata + dynamic(ContactUs)
│   ├── (admin)/contact/page.tsx            # Admin route: metadata + dynamic(Contact)
│   └── sitemap.ts                          # Lists /contact-us
│
├── modules/contact/
│   ├── public/                             # ── Storefront ──
│   │   ├── ContactUs.tsx                   # Page shell: Hero, intro text, Map + ContactForm grid
│   │   ├── Map.tsx                         # Google Maps iframe + phone, email, address
│   │   └── ContactForm.tsx                 # RHF + Zod form → POST /contact-messages/create-message
│   │
│   ├── admin/                              # ── Admin inbox ──
│   │   ├── Contact.tsx                     # Inbox container: state, queries, filters, table, modal
│   │   ├── ContactStats.tsx                # 4 stat cards (3 of them act as status filters)
│   │   ├── contact.columns.tsx             # Table columns + StatusPill, SenderBadge, IconAction
│   │   ├── ViewMessage.tsx                 # Details modal: reply actions, status, notes
│   │   └── contact.utils.ts                # Name, initials, avatar colour, dates, tel/WhatsApp links
│   │
│   ├── schemas/contact.schema.ts           # messageSchema (Zod) + MessageFormType
│   └── types/contact.types.ts              # IContactMessage, IContactMessageStats, filter unions
│
├── middleware.ts                           # /contact-us public, /contact admin-only
└── components/layout/
    ├── navbar/Navbar.tsx                   # "Contact Us" link
    ├── footer/Footer.tsx                   # "Contact us" link + contact block
    └── sidebar/
        ├── AdminSidebar.tsx                # "Contact" item (admins only)
        └── CustomerSidebar.tsx             # "Need help?" card → /contact-us
```

Conventions this module follows (see [Coding conventions](../claude-docs/basic-instructions.md)):

- **`public/` vs `admin/` split** — storefront and dashboard code never import each other, except that the admin modal reuses the pills from `contact.columns.tsx`.
- **Thin route pages** — `page.tsx` only sets `metadata` and lazy-loads the module's root component with `next/dynamic` and the shared `LoadingPage` fallback.
- **Column factory** — `getMessageColumns(handlers…)` returns `ColumnDef[]`, so the container owns all state and the columns stay pure.
- **No module-level hooks or API-constant file** — the module calls the shared API hooks directly with inline endpoint strings (see [TD-4](#21-known-issues--technical-debt)).

[↑ Back to top](#table-of-contents)

---

## 5. Routes & Role-Based Access Control

### 5.1 Page routes (middleware)

Page access is enforced in [`src/middleware.ts`](../src/middleware.ts) from the `accessToken` cookie (decoded with `jwt-decode`, role read from the JWT).

| Route | List in middleware | Who may open it |
|---|---|---|
| `/contact-us` | `PUBLIC_ROUTES` ([line 10](../src/middleware.ts#L10)) | Everyone — **but see the caveat below** |
| `/contact` | `ADMIN_ONLY_ROUTES` ([line 52](../src/middleware.ts#L52)), **not** in `EMPLOYEE_ROUTES` | `ADMIN` only. Guest → `/login`. Employee → `/dashboard`. Customer → `/`. |

> ⚠️ **Prefix collision.** Admin routes are matched with `pathname.startsWith(route)` ([line 115](../src/middleware.ts#L115)), and `"/contact-us".startsWith("/contact")` is `true`. So `/contact-us` is treated as **both** public and admin-only. The "hard block cross-access" check ([line 216](../src/middleware.ts#L216)) then redirects a **signed-in customer or employee** from `/contact-us` to `/`. Guests and admins are unaffected. This is [TD-1](#21-known-issues--technical-debt), the most important open issue in this module.

The admin sidebar shows "Contact" only to admins: [`AdminSidebar.tsx:68`](../src/components/layout/sidebar/AdminSidebar.tsx#L68) has no `employee: true` flag, so the item is filtered out for employees.

### 5.2 API access (server guards)

| Endpoint | Guard | Behaviour |
|---|---|---|
| `POST /contact-messages/create-message` | `NoAdminEmployeeGuard` | Token optional. No token, an expired or a malformed token → saved as a **guest** message. Valid customer token → linked to the customer. Admin or employee token → `403 "This resource is not available for admin or employee!"`. |
| `GET /contact-messages` | `JwtAuthGuard` + `RolesGuard(ADMIN)` | `401` without a valid token, `403` for non-admins. |
| `GET /contact-messages/stats` | same | same |
| `PATCH /contact-messages/:id` | same | same |

The middleware is a UX guard only. The server guards are the real security boundary.

### 5.3 Access matrix

| Action | Guest | Customer | Employee | Admin |
|---|:---:|:---:|:---:|:---:|
| Open `/contact-us` | ✅ | ⚠️ redirected (TD-1) | ⚠️ redirected (TD-1) | ✅ |
| Send a message | ✅ (guest) | ✅ (linked) | ❌ 403 | ❌ 403 |
| Open `/contact` inbox | ❌ → `/login` | ❌ → `/` | ❌ → `/dashboard` | ✅ |
| List / stats / update | ❌ 401 | ❌ 403 | ❌ 403 | ✅ |

[↑ Back to top](#table-of-contents)

---

## 6. End-to-End Workflow

```
 VISITOR (guest / customer)                 SERVER                         ADMIN
 ──────────────────────────                 ──────                         ─────
 /contact-us
   │ fills First name, Last name,
   │ Phone, Message
   │ Zod validates (client)
   ▼
 POST /contact-messages/create-message ──▶ class-validator (strict rules)
   { firstName, lastName, phone, message }  NoAdminEmployeeGuard
                                            userId = token ? customer : null
                                            replied = false
   ◀── 201 "Message sent successfully" ───  returns public echo (no internals)
   │ toast + form reset
                                                                          /contact
                                            GET /contact-messages ◀────── list (page, limit,
                                            GET /contact-messages/stats ◀─ search, sortOrder,
                                                                           status, sender)
                                                                            │ opens a message
                                                                            ▼
                                                                          ViewMessage modal
                                                                            │ Call / WhatsApp /
                                                                            │ Email (outside app)
                                                                            ▼
                                            PATCH /contact-messages/:id ◀─ { replied: true }
                                            PATCH /contact-messages/:id ◀─ { notes: "…" }
                                            returns admin DTO ───────────▶ modal updates,
                                                                           list + stats refetch
```

[↑ Back to top](#table-of-contents)

---

## 7. Storefront — Contact Us Page (`/contact-us`)

### 7.1 Page composition

[`app/(public)/contact-us/page.tsx`](../src/app/(public)/contact-us/page.tsx) is a Server Component. It exports `metadata` and renders `ContactUs` through `next/dynamic` (with SSR; only the JS chunk is split).

[`ContactUs.tsx`](../src/modules/contact/public/ContactUs.tsx) renders:

1. `Hero` with the heading "Contact Us".
2. "Contact Information" heading and an intro paragraph promising a reply **within 24–48 hours**.
3. A grid (one column, two from `lg`) with `Map` on the left and `ContactForm` on the right, stretched to equal height.

### 7.2 Store details & map

[`Map.tsx`](../src/modules/contact/public/Map.tsx) is a static component (no data fetching):

| Item | Value | Link |
|---|---|---|
| Map | Google Maps embed of "Natura Care Limited", `loading="lazy"`, `referrerPolicy="no-referrer-when-downgrade"` | iframe |
| Phone | `+8809644556677` | `tel:` |
| Email | `info@naturacarebd.com` | `mailto:` |
| Address | Padma Center 32/1, Dilu Road, New Eskaton, Dhaka-1000, Bangladesh | `<address>` |

The same phone, email and address are also hard-coded in [`Footer.tsx`](../src/components/layout/footer/Footer.tsx) ([TD-5](#21-known-issues--technical-debt)).

### 7.3 Contact form

[`ContactForm.tsx`](../src/modules/contact/public/ContactForm.tsx) — React Hook Form with `zodResolver(messageSchema)`.

| Field | Component | Required mark | Notes |
|---|---|:---:|---|
| First Name | `InputField` | ✅ | |
| Last Name | `InputField` | | |
| Phone Number | `PhoneInputField` | — | `international`, `defaultCountry="BD"`, so the value is E.164 (`+8801…`), which the server accepts. Not marked required, although the **server requires it** ([TD-2](#21-known-issues--technical-debt)). |
| Message | `TextAreaField` (6 rows) | ✅ | |

Submit flow:

1. `handleSubmit` runs the Zod schema; field errors show under each field.
2. `onSubmit` builds `{ firstName, lastName, phone, message }` and calls `sendMessage` (`usePost("/contact-messages/create-message")`).
3. `SubmitButton` shows a pending state while `isPending`.
4. The shared `usePost` toasts the server message (success, or each validation message for a 4xx).
5. On a 2xx the form is `reset()` to empty values. On an error the input is kept so the visitor can fix it.

### 7.4 Guest vs signed-in customer

The form is the same for both. The difference is invisible to the visitor: Axios sends the access token when there is one, and the server sets `userId` from it. A customer's message then shows the **Customer** badge and the "Customer Account" panel in the admin modal.

[↑ Back to top](#table-of-contents)

---

## 8. Admin Section — Messages Inbox (`/contact`)

### 8.1 Screen layout

[`Contact.tsx`](../src/modules/contact/admin/Contact.tsx), top to bottom:

```
┌──────────────────────────────────────────────────────────────────┐
│ Messages  [3 pending]                                 [⟳ Refresh] │
│ Questions sent from the Contact Us page. Reply by phone or …     │
├──────────────┬──────────────┬──────────────┬─────────────────────┤
│ All Messages │ Awaiting     │ Replied      │ Received Today      │  ← ContactStats
│ 42           │ Reply  3     │ 39           │ 2                   │
│ 30 cust · 12 │ Needs a resp │ 93% reply r. │ 9 in the last 7 days│
├──────────────┴──────────────┴──────────────┴─────────────────────┤
│ [All 42 | Awaiting reply 3 | Replied 39]  [All senders|Customers|Guests]
├──────────────────────────────────────────────────────────────────┤
│ 🔍 Search name, phone or message...                              │  ← CustomTable
│ Sender | Phone | Message | Received ↕ | Status | Actions         │
│ …                                                                │
│ pagination                                                       │
└──────────────────────────────────────────────────────────────────┘
```

The page header badge ("3 pending") shows only while `stats.pending > 0`.

### 8.2 Data fetching

Two independent queries:

| Query | Hook | Endpoint | Query key |
|---|---|---|---|
| Messages page | `useGetAll<{ data; meta }>` | `GET /contact-messages` | `["getAllMessages", page, limit, search, sortOrder, status, sender]` |
| Inbox counts | `useGet<IContactMessageStats>` | `GET /contact-messages/stats` | `["getContactMessageStats"]` |

Query params sent to the list endpoint:

```ts
{
  page: currentPage,
  limit: pageSize,
  search: searchTerm || undefined,
  sortOrder,                                  // "desc" by default (newest first)
  status: status === "all" ? undefined : status,
  sender: sender === "all" ? undefined : sender,
}
```

`refreshAll()` refetches both queries. It runs from the **Refresh** button (which spins while `isFetching`), after a status toggle, and after any save in the modal.

### 8.3 Stats cards

[`ContactStats.tsx`](../src/modules/contact/admin/ContactStats.tsx) renders four cards from `IContactMessageStats`. Skeletons show while loading.

| Card | Value | Hint | Clickable filter |
|---|---|---|---|
| All Messages | `total` | "`customers` customers · `guests` guests" | status = `all` |
| Awaiting Reply | `pending` | "Needs a response", or "Inbox zero, nice!" at 0 | status = `pending` |
| Replied | `replied` | "`n`% reply rate" (`round(replied / total × 100)`, 0 when empty) | status = `replied` |
| Received Today | `today` | "`last7Days` in the last 7 days" | — (plain card) |

The three status cards are `<button aria-pressed>` and get a coloured ring when active. They are a second way to drive the same status filter as the tabs.

### 8.4 Filters, search, sorting & pagination

| Control | State | Sent as | Notes |
|---|---|---|---|
| Status tabs (`All` / `Awaiting reply` / `Replied`) | `status` | `status=pending\|replied` | Tabs show counts from the stats query. |
| Sender tabs (`All senders` / `Customers` / `Guests`) | `sender` | `sender=customer\|guest` | No counts. |
| Search box | `searchTerm` | `search` | Debounced 500 ms inside `CustomTable`. The server matches first name, last name, phone, email and message text, ignoring case. |
| "Received" column header | `sortOrder` | `sortOrder=asc\|desc` | The only sortable column. The server sorts by `createdAt`. |
| Pagination / page size | `currentPage`, `pageSize` (10) | `page`, `limit` | `pageCount` and `totalItems` come from `meta`. |

**Changing a filter starts over** ([`changeFilter`, line 170](../src/modules/contact/admin/Contact.tsx#L170)): it applies the new value, sets the page to 1 and clears the search. `CustomTable` is also given `key={`${status}-${sender}`}`, so it remounts and its own page index and search input reset with it.

The `Segmented` tab control is defined locally in `Contact.tsx` (`role="tablist"`, `aria-selected`, horizontal scroll on phones).

### 8.5 Table columns & responsive behaviour

Defined in [`contact.columns.tsx`](../src/modules/contact/admin/contact.columns.tsx) by `getMessageColumns(handleView, handleToggleReplied, updatingId)`:

| Column | Content | Visible from |
|---|---|---|
| Sender | Avatar with initials (stable colour per name), orange dot if not replied, name (bold if pending), `SenderBadge`. Clicking it opens the modal. | always |
| Phone | `tel:` link | `md` |
| Message | 2-line clamp; dimmer once replied | `sm` |
| Received | "5 minutes ago" over the full date; sortable | `sm` |
| Status | `StatusPill` (Pending / Replied) | always |
| Actions | View details (eye) · Mark as replied / Mark as pending | always |

On phones, the hidden columns move **inside the Sender cell**: the phone shows below `md`, and the message preview and time show below `sm`. This uses `meta.className` (`hidden md:table-cell`), which `CustomTable` applies to both `<th>` and `<td>`.

### 8.6 Quick "mark as replied" from the table

[`handleToggleReplied`](../src/modules/contact/admin/Contact.tsx#L147):

1. Sets `updatingId` to the row's id, which disables that row's button so it cannot be double-clicked.
2. `PATCH /contact-messages/:id` with `{ replied: !message.replied }`.
3. `usePatch` toasts "Message updated successfully".
4. On a 2xx, `refreshAll()`. `onSettled` clears `updatingId` either way.

There is no optimistic update; the row changes when the refetch returns.

[↑ Back to top](#table-of-contents)

---

## 9. Admin Section — Message Details Modal

Opened by clicking the sender or the eye icon. `Contact.tsx` renders [`ViewMessage`](../src/modules/contact/admin/ViewMessage.tsx) inside `CustomModal2` with a responsive width (near full width on phones, `max-w-4xl` on large screens) and `max-h-[90vh]` scrolling.

`ViewMessage` gets `key={selected?.id}`, so opening a different message remounts it and resets its local state. It keeps a **local copy** of the message and replaces it with the PATCH response, so the modal shows the saved state without waiting for the list refetch.

### 9.1 Sections

| Section | Content |
|---|---|
| Hero | Large avatar, name, `StatusPill`, `SenderBadge`, "Received 5 minutes ago · 12 Oct 2026, 2:45 PM", quick-action buttons |
| Message | Full text (`whitespace-pre-line`, scrolls past 18rem), character count, Copy |
| Contact Details | Phone (`tel:` + copy), Email (or "Not given"), Reference `#id · sid[0..8]` (copies the full `sid`) |
| Customer Account | For a customer: account name, email, phone. For a guest: "Sent as a guest — use the phone number to get back to them." |
| Reply Status | Explanation text + toggle button |
| Internal Notes | Textarea, counter, Discard / Save notes |
| Footer | "Last updated …" and Close (`CancelButton`) |

Sections fade and slide in (`animate-in … motion-reduce:animate-none`, so users who prefer reduced motion get none).

### 9.2 Reply actions: Call, WhatsApp, Email, Copy

| Button | Shown when | Link |
|---|---|---|
| Call | always | `tel:` + the phone with spaces and brackets removed (`telLink`) |
| WhatsApp | the phone is a **Bangladeshi mobile number** | `https://wa.me/8801XXXXXXXXX?text=Hi <firstName>, this is Natura Care replying to your message.` |
| Email | `message.email` or the linked `user.email` exists | `mailto:` with subject "Re: your message to Natura Care" |
| Copy phone | always | Clipboard + toast "Phone number copied" (or an error toast if the clipboard is blocked) |

WhatsApp eligibility ([`whatsappNumber`](../src/modules/contact/admin/contact.utils.ts#L45)): strip non-digits, then match `^(?:88)?(01[3-9]\d{8})$`. `01750256844` and `+8801750256844` both become `8801750256844`. Landlines (for example `+880 2 …`) and foreign numbers get no WhatsApp button.

### 9.3 Reply status

The button reads **Mark as replied** (green) when pending and **Mark as pending** (amber) when replied. It sends `{ replied: !message.replied }` and is disabled while any update from the modal is in flight (`isPending`).

### 9.4 Internal notes

- Initialised from `message.notes ?? ""`. Max **2,000** characters (`NOTES_MAX`, same as the server's `CONTACT_MESSAGE_LIMITS.NOTES_MAX`), enforced by `maxLength`.
- The counter turns amber above 90 %.
- `notesChanged = notes.trim() !== (message.notes ?? "")`. **Save notes** is enabled only when something changed; **Discard** appears only then.
- Save sends `{ notes: notes.trim() || null }`, so an emptied textarea **clears** the notes.
- Labelled "Only admins can see these". They are never returned to the sender.

[↑ Back to top](#table-of-contents)

---

## 10. API Reference

Base: `NEXT_PUBLIC_API_BASE_URL`. All responses use the standard envelope `{ statusCode, success, message, data, meta? }`.

### `POST /contact-messages/create-message`

Called by `ContactForm` through `usePost`.

```json
// request
{ "firstName": "Samiha", "lastName": "Quazi", "phone": "+8801750256844",
  "message": "Hi, I ordered the Onion Hair Oil last week. Is it safe on colour-treated hair?" }

// 201
{ "statusCode": 201, "success": true, "message": "Message sent successfully",
  "data": { "id": 27, "firstName": "Samiha", "lastName": "Quazi", "phone": "+8801750256844",
            "message": "Hi, I ordered …", "createdAt": "2026-10-12T08:45:00.000Z" } }
```

Server rules (stricter than the client, see [§12](#12-validation-schema)):

| Field | Rule |
|---|---|
| `firstName` | Required, 2–100 chars, letters in any script plus spaces `.` `'` `-`, must start with a letter. Inner spaces collapsed. |
| `lastName` | Optional; `""` or `null` stored as `null`. If given: same rules as `firstName`. |
| `phone` | **Required**, 10–20 chars after removing spaces. Formats: `+8801750256844`, `01750256844`, `(+880)2223362613`, `(+880)2-223362613`. |
| `message` | Required, **10**–5,000 chars, trimmed, line breaks kept, no control characters. |
| anything else | Rejected (`id`, `email`, `replied`, `notes`, `userId` …). |

### `GET /contact-messages` (admin)

| Param | Values | Default |
|---|---|---|
| `page`, `limit` | numbers | omit both to get **all** |
| `search` | text | — |
| `sortOrder` | `asc` \| `desc` | `desc` (by `createdAt`) |
| `status` | `pending` \| `replied` | both |
| `sender` | `guest` \| `customer` | both |

Returns `data: IContactMessage[]` and `meta: IPaginationMeta`.

### `GET /contact-messages/stats` (admin)

Returns `IContactMessageStats`. `today` starts at midnight Bangladesh time; `last7Days` covers today plus the 6 days before.

### `PATCH /contact-messages/:id` (admin)

Body: `{ replied?: boolean, notes?: string | null }`. At least one field is required (`400 "Send replied, notes or both"`). Unknown id → `404 "Contact message not found"`. Returns the updated `IContactMessage`.

[↑ Back to top](#table-of-contents)

---

## 11. Types

[`types/contact.types.ts`](../src/modules/contact/types/contact.types.ts):

| Type | Purpose |
|---|---|
| `IContactMessageUser` | The linked customer account: `id`, `name`, `email`, `phone \| null`. |
| `IContactMessage` | A message as the admin endpoints return it (see [§2](#2-domain-model-messages-senders--reply-status)). `user` is optional and only present for customers. |
| `IContactMessageStats` | `total`, `pending`, `replied`, `today`, `last7Days`, `guests`, `customers`. |
| `ContactStatusFilter` | `"all" \| "pending" \| "replied"` — UI state; `"all"` is not sent. |
| `ContactSenderFilter` | `"all" \| "customer" \| "guest"` — UI state; `"all"` is not sent. |

Shared types used: `IPaginationMeta`, `ResponseSuccessType`, `ApiResponse<T>` and `IModal` (`data`, `onClose`, `refetch`) from `@/types`.

[↑ Back to top](#table-of-contents)

---

## 12. Validation Schema

[`schemas/contact.schema.ts`](../src/modules/contact/schemas/contact.schema.ts) — `messageSchema`, with `MessageFormType = z.infer<typeof messageSchema>`.

The client schema is **looser than the server**, so some invalid input passes the form and is rejected by the API with a toast:

| Field | Client (Zod) | Server | Gap |
|---|---|---|---|
| `firstName` | trim, 1–100 | 2–100, letters only | `"A"` or `"John2"` pass the client |
| `lastName` | optional, any | optional, 2–100, letters only | `"Q"` passes the client |
| `phone` | optional (phone validation commented out) | **required**, format-checked | an empty phone passes the client |
| `message` | trim, min 1 | 10–5,000, no control characters | `"Hi"` passes the client |

Because the server's errors are toasted rather than shown under the fields, aligning the schema is [TD-2](#21-known-issues--technical-debt).

[↑ Back to top](#table-of-contents)

---

## 13. Constants

The module has no constants file. Its constants are local to the component that uses them:

| Constant | File | Value / purpose |
|---|---|---|
| `STATUS_TABS` | `Contact.tsx` | Status tab labels: All, Awaiting reply, Replied |
| `SENDER_TABS` | `Contact.tsx` | Sender tab labels: All senders, Customers, Guests |
| `VIEW_MODAL_WIDTH` | `Contact.tsx` | Responsive modal width classes |
| `NOTES_MAX` | `ViewMessage.tsx` | `2000` — mirrors the server's `NOTES_MAX` |
| `ENTER` | `ViewMessage.tsx` | Section enter-animation classes |
| `ACTION_BASE` | `ViewMessage.tsx` | Shared button classes for the quick actions |
| `AVATAR_COLORS` | `contact.utils.ts` | 5 avatar colour pairs |
| `mapUrl` | `Map.tsx` | Google Maps embed URL |
| Store phone / email / address | `Map.tsx`, `Footer.tsx` | Hard-coded in both ([TD-5](#21-known-issues--technical-debt)) |
| Endpoints | inline strings | `/contact-messages`, `/contact-messages/stats`, `/contact-messages/:id`, `/contact-messages/create-message` |

[↑ Back to top](#table-of-contents)

---

## 14. Hooks

The module defines no hooks of its own. It uses the shared API hooks in [`src/hooks/api/`](../src/hooks/api/):

| Hook | Used in | Behaviour relevant here |
|---|---|---|
| `useGetAll<T>(endpoint, key, params)` | `Contact.tsx` (list) | Returns the full Axios-unwrapped envelope (`{ data, meta }`). Toasts on network error. |
| `useGet<T>(endpoint, key)` | `Contact.tsx` (stats) | Returns `response.data` (the stats object). Toasts on network error. |
| `usePost(endpoint, onSuccess)` | `ContactForm.tsx` | Toasts success; for 4xx toasts each message in an array; logs `"toast message =>"` to the console. |
| `usePatch<T>()` | `Contact.tsx`, `ViewMessage.tsx` | `mutate({ endpoint, data }, { onSuccess, onSettled })`. Toasts "Update successful!" or the server message. |

React state hooks in `Contact.tsx`: `currentPage`, `pageSize`, `searchTerm`, `sortOrder`, `status`, `sender`, `selected`, `isViewOpen`, `updatingId`. `refreshAll` is wrapped in `useCallback`.

[↑ Back to top](#table-of-contents)

---

## 15. Utilities

[`admin/contact.utils.ts`](../src/modules/contact/admin/contact.utils.ts):

| Function | Input → output |
|---|---|
| `senderName(m)` | `"Samiha" + "Quazi"` → `"Samiha Quazi"`; skips a missing last name |
| `initials(m)` | → `"SQ"`; `"?"` when both names are empty |
| `avatarColor(seed)` | Hash of the name → one of `AVATAR_COLORS`; the same sender always gets the same colour |
| `timeAgo(iso)` | → `"5 minutes ago"`; `"—"` for a missing or invalid date |
| `fullDate(iso)` | → `"12 Oct 2026, 2:45 PM"`; `"—"` for a missing or invalid date |
| `whatsappNumber(phone)` | BD mobile → `"8801XXXXXXXXX"`; anything else → `null` |
| `whatsappLink(message)` | → `https://wa.me/…?text=…` or `null` |
| `telLink(phone)` | `"(+880) 1750-256844"` → `"tel:+8801750256844"` |

[↑ Back to top](#table-of-contents)

---

## 16. Reusable Components

### Shared components the module uses

| Component | Path | Used for |
|---|---|---|
| `Hero` | `components/layout/hero/Hero` | Contact Us page banner |
| `InputField` | `components/form/InputField` | First and last name |
| `PhoneInputField` | `components/form/PhoneInputField` | Phone (BD default, international format) |
| `TextAreaField` | `components/form/TextAreaField` | Message |
| `SubmitButton` | `components/form/SubmitButton` | "Send Message" with pending state |
| `CustomTable` | `components/data-display/table/CustomTable` | Inbox table: server pagination, debounced search, sort callback, `meta.className` per column |
| `CustomModal2` | `components/primitives/modal/CustomModal2` | Details modal shell |
| `CancelButton` | `components/primitives/button/CancelButton` | Modal "Close" |
| `Skeleton` | `components/ui/skeleton` | Stat card loading |
| `Tooltip` | `components/ui/tooltip` | Labels on the icon-only table actions |
| `LoadingPage` | `components/feedback/loading/LoadingPage` | `next/dynamic` fallback on both routes |

### Components the module defines

| Component | File | Reusable? |
|---|---|---|
| `StatusPill({ replied })` | `contact.columns.tsx` | Exported; used by the table and the modal |
| `SenderBadge({ isCustomer })` | `contact.columns.tsx` | Exported; used by the table and the modal |
| `IconAction` | `contact.columns.tsx` | Private; icon button with tooltip and `aria-label` |
| `Segmented<T>` | `Contact.tsx` | Private; generic tab group with optional counts — a good candidate to move to `components/` |
| `Section`, `DetailRow` | `ViewMessage.tsx` | Private; modal card and label/value row with optional link and copy |

[↑ Back to top](#table-of-contents)

---

## 17. Caching & Query Keys

| Key | Data | Invalidated by |
|---|---|---|
| `["getAllMessages", page, limit, search, sortOrder, status, sender]` | One inbox page | Nothing. Changing any part of the key fetches a new entry; `refreshAll()` refetches the current one. |
| `["getContactMessageStats"]` | Counts | `refreshAll()` |

Points to know:

- Updates refresh through explicit `refetch()` calls rather than `queryClient.invalidateQueries`. Cached pages for **other** filter combinations stay stale until revisited (TanStack Query refetches them on mount if they are stale under the global defaults).
- A message sent by a visitor does not appear until the admin presses **Refresh**, changes a filter or the query refetches on window focus. There is no polling or push.

[↑ Back to top](#table-of-contents)

---

## 18. Error Handling & Toasts

| Situation | What the user sees |
|---|---|
| Message sent | Toast "Message sent successfully"; form cleared |
| Server validation fails (4xx with a message array) | One error toast per message, e.g. "Message must be at least 10 characters"; form kept |
| Admin or employee submits | Toast "This resource is not available for admin or employee!" |
| Network failure on send | Toast with the Axios error message |
| List or stats request fails | Toast "Failed to fetch data." (or the error message); table shows empty |
| Status toggle / notes saved | Toast "Message updated successfully" |
| PATCH fails | Error toast; the modal keeps its previous state (it only updates on a 2xx with `data`) |
| Clipboard blocked | Toast "Could not copy …" |
| Modal opened with no message | Placeholder "No message selected." |

Server errors are never mapped onto form fields with `setError`; they appear only as toasts.

[↑ Back to top](#table-of-contents)

---

## 19. SEO

| Item | Value |
|---|---|
| Title | `Contact Us \| Natura Care Limited` |
| Description | `Contact Us at Natura Care` (thin — see [TD-7](#21-known-issues--technical-debt)) |
| Sitemap | `/contact-us`, `changeFrequency: monthly`, `priority: 0.6` ([`sitemap.ts`](../src/app/sitemap.ts)) |
| Structured data | None on this page. The home page's `Organization` JSON-LD has a `ContactPoint` (customer service, English and Bengali) without phone or email. |
| Admin page | `Contact \| Natura Care Limited`; not in the sitemap. |

[↑ Back to top](#table-of-contents)

---

## 20. Business Rules Summary

1. Anyone who is not staff can send a message; no account is needed.
2. Admins and employees cannot send messages (server `403`).
3. A message from a signed-in customer is linked to their account; otherwise it is a guest message.
4. Every new message starts as **Pending** (`replied = false`).
5. Only admins can see, filter, search and update messages. Employees cannot open the inbox.
6. What the sender wrote can never be edited; only `replied` and `notes` change.
7. Replies happen outside the app (phone, WhatsApp, email); the admin marks the message replied afterwards and can reopen it as pending.
8. WhatsApp is offered only for Bangladeshi mobile numbers (`01[3-9]` + 8 digits).
9. Notes are internal, at most 2,000 characters, and an empty save clears them.
10. The inbox reads newest first; "today" and "last 7 days" are in Bangladesh time.
11. The page promises a reply within 24–48 hours (copy only; not tracked by the system).

[↑ Back to top](#table-of-contents)

---

## 21. Known Issues & Technical Debt

| # | Issue | Impact | Suggested fix |
|---|---|---|---|
| TD-1 | **Signed-in customers and employees are redirected away from `/contact-us`.** Admin routes are matched with `startsWith`, and `"/contact-us".startsWith("/contact")` is true, so the hard-block check in `middleware.ts` sends them to `/`. The customer sidebar's "Need help?" card, the navbar and the footer links all hit this. The same pattern affects `/support` vs `/support/term-conditions` etc. | Customers cannot reach the contact form while signed in | Match admin routes on a segment boundary: `pathname === route \|\| pathname.startsWith(route + "/")`, or check `isPublicRoute` before the hard block. |
| TD-2 | Client schema is looser than the server ([§12](#12-validation-schema)); phone is optional and not marked required; server errors are only toasted. | Visitors fill the form, submit, and get a toast instead of a field error | Mirror the server rules in `messageSchema` (names 2–100 with the letter pattern, phone required with `validatePhone`, message 10–5,000) and pass `isRequired` to `PhoneInputField`. |
| TD-3 | `ContactForm` keeps commented `console.log`s; the shared `usePost` logs `"toast message =>"` on every submit. | Console noise in production | Remove the logs. |
| TD-4 | Endpoints are inline strings and queries are called directly from components (no `contact.api.constants.ts`, no `useContactMessages` / `useUpdateContactMessage` hooks), unlike the career module. | Endpoint and key changes must be made in several places | Add `src/constants/api/contact.api.constants.ts` and module hooks, following [`career.api.constants.ts`](../src/constants/api/career.api.constants.ts). |
| TD-5 | Store phone, email and address are hard-coded in both `Map.tsx` and `Footer.tsx`. | They can drift apart | Move them to one `STORE_CONTACT` constant (or the existing `contact-address` API). |
| TD-6 | Refresh is done with `refetch()` instead of query invalidation; there is no polling. | Other cached filter pages go stale; new messages need a manual Refresh | Invalidate `["getAllMessages"]` and `["getContactMessageStats"]` in `onSuccess`; optionally `refetchInterval` (e.g. 60 s) on the stats query. |
| TD-7 | The page description is a placeholder ("Contact Us at Natura Care") and there is no `ContactPage` JSON-LD. The home page `ContactPoint` has no `telephone` or `email`. | Weak search snippet | Write a real description; add `telephone` and `email` to the `ContactPoint`. |
| TD-8 | `email` is part of `IContactMessage` but can never be set from the form (the API rejects it). | Dead field; the "Email" row shows "Not given" for every guest | Either add an optional email field to the form and API, or drop it from the type and the modal. |
| TD-9 | An admin can open `/contact-us` and fill the form, but the submit always fails with `403`. | Confusing when staff test the page | Hide or disable the form for staff with a note ("Staff accounts cannot send messages"). |
| TD-10 | `Segmented` lives inside `Contact.tsx`. | Duplicated if another screen needs segmented tabs | Move to `components/primitives/`. |

[↑ Back to top](#table-of-contents)

---

## 22. How-To Recipes

### Add a field to the contact form (e.g. optional email)

1. **Server first:** add the field to `CreateContactMessageDto` (and the public DTO if it should be echoed).
2. Add it to `messageSchema` in [`contact.schema.ts`](../src/modules/contact/schemas/contact.schema.ts) and to `defaultValues` in `ContactForm`.
3. Render an `InputField` and add it to the `payload` object in `onSubmit`.
4. If admins should see it, add it to `IContactMessage` and show it in `ViewMessage` (a `DetailRow`).

### Add a new inbox filter (e.g. "has notes")

1. Server: add the param to `ContactMessageListQueryDto` and the `where` in `ContactMessageService.findAll`.
2. Client: add a filter type to `contact.types.ts`, a tabs constant and a `useState` in `Contact.tsx`.
3. Include it in `queryParams` (omit for "all"), in the query key, and in the `CustomTable` `key` so the table resets.
4. Change it through `changeFilter(...)` so the page and search reset.

### Make another column sortable

The API sorts by `createdAt` only. Add `sortBy` support on the server first, then set `enableSorting: true` on the column and send `sortBy: field` from `onSortChange`.

### Change the store phone, email or address

Edit both [`Map.tsx`](../src/modules/contact/public/Map.tsx) and [`Footer.tsx`](../src/components/layout/footer/Footer.tsx) (until TD-5 is done). To change the map pin, generate a new embed URL from Google Maps → Share → Embed a map, and replace `mapUrl`.

### Give employees access to the inbox

1. Server: change `@Roles(Role.ADMIN)` to include `Role.EMPLOYEE` on the three admin endpoints.
2. Client: add `"/contact"` to `EMPLOYEE_ROUTES` in `middleware.ts` and `employee: true` to the sidebar item.

[↑ Back to top](#table-of-contents)

---

## 23. QA Checklist

**Storefront**

- [ ] Guest opens `/contact-us`: hero, intro, map, phone, email and address are shown; phone and email links open the dialer and mail app.
- [ ] Map loads lazily and works at phone width; the form and map have equal height on desktop.
- [ ] Submit an empty form → "First name is required" and "Message is required".
- [ ] Submit with a 5-character message → server toast "Message must be at least 10 characters"; input kept.
- [ ] Submit without a phone → server toast about the phone number; input kept.
- [ ] Valid submit as a guest → toast "Message sent successfully", form cleared; the admin sees it with the **Guest** badge.
- [ ] Signed-in customer opens `/contact-us` → page loads (fails today: TD-1). Once it loads, a sent message shows the **Customer** badge and the account panel.
- [ ] Signed-in admin submits → "This resource is not available for admin or employee!".
- [ ] `sitemap.xml` lists `/contact-us`.

**Admin**

- [ ] Guest opening `/contact` → `/login`; employee → `/dashboard`; customer → `/`; admin → inbox. Employees have no "Contact" sidebar item.
- [ ] Stats match the data: total = pending + replied = customers + guests; reply rate rounds correctly; "Inbox zero, nice!" at 0 pending.
- [ ] Clicking a status card or tab filters the list, highlights the card, resets to page 1 and clears the search.
- [ ] Sender tabs: Customers shows only linked messages, Guests only unlinked ones.
- [ ] Search by first name, last name, phone and message text (case-insensitive); results arrive after typing stops (~500 ms).
- [ ] "Received" sorts newest/oldest first; the default is newest first.
- [ ] Phone width: phone, preview and time appear inside the Sender cell; no horizontal page scroll.
- [ ] Toggle from the table: the button is disabled while saving; the pill, header badge and counts update.
- [ ] Modal: Call opens `tel:`; WhatsApp appears for `01750256844` and is absent for `+88022233626`; Email appears only for customers; copy buttons toast.
- [ ] Notes: Save disabled until changed; Discard restores; save, close and reopen → notes persisted; clear and save → notes removed; counter turns amber above 1,800.
- [ ] "Last updated" changes after a save.

[↑ Back to top](#table-of-contents)

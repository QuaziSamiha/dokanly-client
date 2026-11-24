# Career Module — Frontend Technical Documentation

> **Scope:** everything the Natura Care client (Next.js 15, App Router) does with **job openings and job applications**: the admin jobs screen (list, add, edit, delete, review applicants), the public careers page, the job details page with its application form, and the SEO output (metadata, JSON-LD, sitemap) for open jobs.
>
> **Audience:** frontend engineers joining or maintaining the project. QA and backend engineers can use it to see the client's side of the job and application contract.
>
> **Related:** [Project README](../README.md) (run, build, Docker) · [Auth module](./auth.md) (sign-in, session, route guard) · [User module](./user.md) (roles, profile) · [Category module](./category.md) (same admin-screen conventions) · Server source: [`job`](../../natura-care-server/src/modules/job/) and [`application`](../../natura-care-server/src/modules/application/) modules · [Coding conventions](../claude-docs/basic-instructions.md)

| | |
|---|---|
| **Module root** | [`src/modules/career/`](../src/modules/career/) |
| **Admin route** | `/career-admin` (admin route group) |
| **Storefront routes** | `/career` (open positions), `/career-details/[slug]` (job page + application form) |
| **Other touchpoints** | Navbar "Career" link (shown only while jobs are open), `sitemap.xml`, admin sidebar |
| **Backend resources** | `/job/*` and `/application/*` on `NEXT_PUBLIC_API_BASE_URL` (e.g. `https://api.naturacarebd.com/n-care/api/v1`) |
| **Write access (API)** | Jobs: `ADMIN` only · Applications: anyone can create; `ADMIN` reads and deletes |
| **Last reviewed** | 2026-10-24 |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Domain Model: Jobs, Applications & Visibility](#2-domain-model-jobs-applications--visibility)
3. [Tech Stack Used by This Module](#3-tech-stack-used-by-this-module)
4. [File Architecture](#4-file-architecture)
5. [Routes & Role-Based Access Control](#5-routes--role-based-access-control)
6. [End-to-End Workflow](#6-end-to-end-workflow)
7. [Admin Section — Jobs List (`/career-admin`)](#7-admin-section--jobs-list-career-admin)
   - [7.1 Screen layout](#71-screen-layout)
   - [7.2 Data fetching](#72-data-fetching)
   - [7.3 Search, sorting & pagination](#73-search-sorting--pagination)
   - [7.4 Columns & the Live / Expired / Inactive badge](#74-columns--the-live--expired--inactive-badge)
   - [7.5 Modals](#75-modals)
8. [Admin Section — Add Job](#8-admin-section--add-job)
9. [Admin Section — Edit Job](#9-admin-section--edit-job)
10. [Admin Section — Delete Job](#10-admin-section--delete-job)
11. [Admin Section — Applicants](#11-admin-section--applicants)
12. [Storefront — Careers Page (`/career`)](#12-storefront--careers-page-career)
13. [Storefront — Job Details (`/career-details/[slug]`)](#13-storefront--job-details-career-detailsslug)
14. [Storefront — Application Form](#14-storefront--application-form)
15. [SEO: Metadata, JSON-LD & Sitemap](#15-seo-metadata-json-ld--sitemap)
16. [API Reference](#16-api-reference)
17. [Types](#17-types)
18. [Validation Schemas](#18-validation-schemas)
19. [Constants](#19-constants)
20. [Hooks](#20-hooks)
21. [Utilities](#21-utilities)
22. [Reusable Components](#22-reusable-components)
23. [Caching & Query Keys](#23-caching--query-keys)
24. [Error Handling](#24-error-handling)
25. [Business Rules Summary](#25-business-rules-summary)
26. [Known Issues & Technical Debt](#26-known-issues--technical-debt)
27. [How-To Recipes](#27-how-to-recipes)
28. [QA Checklist](#28-qa-checklist)

---

## 1. Overview

The career module lets Natura Care advertise vacancies and collect applications without any third-party job board.

| Actor | What they do | Where |
|---|---|---|
| **Admin** | Publishes job openings, edits or deactivates them, reviews applicants, opens resumes, deletes applications or whole jobs. | `/career-admin` |
| **Candidate** (guest, no account needed) | Browses open positions, filters them, reads a job page, applies with a resume. | `/career`, `/career-details/[slug]` |
| **Search engines** | Index open jobs through per-job metadata, `JobPosting` JSON-LD and the sitemap. | Server-rendered `<head>` and `sitemap.xml` |

Key design decisions:

- **No account is needed to apply.** The application endpoint is public and multipart (form fields + resume file).
- **"Open" is decided by the server**: a job is shown publicly only while it is `ACTIVE` **and** its deadline day has not ended. The client never filters out closed jobs itself; it shows what the API returns.
- **The navbar only advertises Career while something is open** ([`useHasOpenCareers`](../src/modules/career/hooks/usePublicCareer.ts#L62)), so visitors never land on an empty page from the menu.
- **Applications belong to the career domain.** There is no separate "application" module; the endpoints live beside the job endpoints in [`career.api.constants.ts`](../src/constants/api/career.api.constants.ts).

[↑ Back to top](#table-of-contents)

---

## 2. Domain Model: Jobs, Applications & Visibility

### Entities

```text
Job (ICareer / IAdminCareer)            Application (IApplication)
────────────────────────────            ──────────────────────────
id, sid, slug                1 ───── *  id, sid, jobId
position, jobType                       name, email, phoneNumber
jobLocationType?, jobLocation           address?, yearsOfExperience?, skills?
salary ("Negotiable" if blank)          resumeUrl (absolute URL)
deadline (UTC midnight of a day)        appliedAt
jobOverview?, jobResponsibilities,
jobRequirements, jobFacilities?  (HTML)
status: ACTIVE | INACTIVE
applicationCount, createdBy, updatedBy  (admin view only)
```

### Enumerations

| Field | Values | Labels shown in UI |
|---|---|---|
| `status` | `ACTIVE`, `INACTIVE` | Active, Inactive |
| `jobType` | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP` | Full time, Part time, Contract, Internship |
| `jobLocationType` (work mode, optional) | `ONSITE`, `HYBRID`, `ONLINE` | On-site, Hybrid, **Remote** (note: `ONLINE` is shown as "Remote") |

### Visibility: the three states an admin sees

`status` is what the admin sets; **visibility** is derived from `status` + `deadline` ([`visibility()` in `career.columns.tsx`](../src/modules/career/admin/career.columns.tsx#L17)).

| `status` | Deadline | Admin badge | On `/career`? | Can candidates apply? |
|---|---|---|:-:|:-:|
| `ACTIVE` | today or later | **Live** (green) | ✅ | ✅ |
| `ACTIVE` | passed | **Expired** (red) | ❌ | ❌ |
| `INACTIVE` | any | **Inactive** (grey) | ❌ | ❌ |

### Deadline semantics

- The admin picks a **calendar day**. [`DateInputField`](../src/components/form/DateInputField.tsx) stores it as **UTC midnight** of that day (`2026-11-30T00:00:00.000Z`).
- The **whole deadline day is open**. The server compares day-only (`stripTime(deadline) < today`), and the JSON-LD `validThrough` is rewritten to `T23:59:59Z`.
- The client reads deadlines in UTC ([`formatDeadline`](../src/modules/career/utils/career.utils.ts), [`daysUntil`](../src/modules/career/utils/career.utils.ts#L19)) so a viewer in Dhaka never sees the day shift.
- A deadline **≤ 5 days** away (`CLOSING_SOON_DAYS`) is flagged amber as "closing soon".

| `daysUntil()` | `deadlineLabel()` | `deadlineState()` | Badge color |
|---|---|---|---|
| `< 0` | Closed | `closed` | red |
| `0` | Closes today | `closingSoon` | amber |
| `1` | Closes tomorrow | `closingSoon` | amber |
| `2–5` | N days left | `closingSoon` | amber |
| `> 5` | N days left | `open` | grey |

[↑ Back to top](#table-of-contents)

---

## 3. Tech Stack Used by This Module

| Concern | Library / mechanism | Used for |
|---|---|---|
| Framework | Next.js 15 App Router | Route groups `(admin)` / `(public)`, `generateMetadata`, `sitemap.ts`, `dynamic()` |
| Server state | TanStack Query v5 | All reads and mutations (through the shared `hooks/api/*` wrappers) |
| HTTP | axios ([`axiosInstance`](../src/lib/axios/axiosInstance.ts)) | Bearer token, response unwrapping, refresh-on-401, error normalization |
| Server-side fetch | native `fetch` with `next: { revalidate: 300 }` | SEO metadata, JSON-LD and sitemap ([`career-seo.server.ts`](../src/modules/career/utils/career-seo.server.ts)) |
| Forms | react-hook-form + `@hookform/resolvers/zod` | Add/edit job forms, application form |
| Validation | zod | [`career.schema.ts`](../src/modules/career/schemas/career.schema.ts), [`career-application.schema.ts`](../src/modules/career/schemas/career-application.schema.ts) |
| Table | TanStack Table via [`CustomTable`](../src/components/data-display/table/CustomTable.tsx) | Admin jobs list |
| Rich text | [`TextEditor`](../src/components/form/TextEditor.tsx) | Overview, responsibilities, requirements, benefits (HTML) |
| Toasts | sonner | Success/error feedback from the shared hooks |
| Icons | lucide-react | All career UI icons |
| Styling | Tailwind CSS v4 with project tokens | `greenPrimary-*`, `neutralPrimary-*`, `careerBg` (`#f5f6f1` in [`globals.css`](../src/app/globals.css)) |

[↑ Back to top](#table-of-contents)

---

## 4. File Architecture

The project uses a **feature-module** layout. `src/app` holds routing only; logic and UI live in `src/modules/career/`, split by audience (`admin/`, `public/`) and by kind (`hooks/`, `types/`, `schemas/`, `constants/`, `utils/`, `components/`).

```text
natura-care-client/
├── src/
│   ├── middleware.ts                                # /career, /career-details/* public; /career-admin ADMIN-only
│   ├── app/
│   │   ├── (admin)/career-admin/page.tsx            # "use client" + dynamic(() => import(admin/Career), { ssr: false })
│   │   ├── (public)/career/page.tsx                 # static metadata + dynamic(public/career/Career)
│   │   ├── (public)/career-details/[slug]/page.tsx  # generateMetadata + JobPosting JSON-LD + dynamic(CareerDetails)
│   │   └── sitemap.ts                               # /career + one entry per open job
│   │
│   ├── constants/api/
│   │   ├── career.api.constants.ts                  # CAREER_API, CAREER_APPLICATION_API (paths, query keys)
│   │   └── index.ts                                 # barrel export
│   │
│   ├── modules/career/
│   │   ├── admin/
│   │   │   ├── Career.tsx                           # Page: header + AddButton, CustomTable, 3 modals + delete confirm
│   │   │   ├── career.columns.tsx                   # getCareerColumns(), visibility() badge logic
│   │   │   ├── AddCareer.tsx                        # Create form → POST /job/create-job
│   │   │   ├── EditCareer.tsx                       # Edit form → PATCH /job/update-job/:id (dirty fields only)
│   │   │   ├── CareerFormFields.tsx                 # Shared fields for add + edit ("Basics" + "Description")
│   │   │   ├── AllApplications.tsx                  # Applicants modal: search, cards, resume link, delete
│   │   │   └── ApplicationCardSkeleton.tsx          # Loading placeholder for an applicant card
│   │   ├── public/
│   │   │   ├── career/
│   │   │   │   ├── Career.tsx                       # /career: intro, filters, job grid, empty states, "How to apply"
│   │   │   │   ├── JobCard.tsx                      # One opening; the whole card links to the job page
│   │   │   │   └── JobSkeleton.tsx                  # Placeholder grid shaped like JobCard
│   │   │   └── career-details/
│   │   │       ├── CareerDetails.tsx                # Job page: header, description, summary aside, mobile apply bar
│   │   │       ├── CareerDetailsSkeleton.tsx        # Placeholder shaped like the job page
│   │   │       ├── CareerForm.tsx                   # Application form + success receipt
│   │   │       └── ResumeUploadField.tsx            # Drag-and-drop resume input bound to react-hook-form
│   │   ├── components/CareerBadges.tsx              # JobTypeBadge, WorkModeBadge, DeadlineBadge (admin + public)
│   │   ├── hooks/
│   │   │   ├── useCareer.ts                         # Admin: list, create, update, delete jobs
│   │   │   ├── useCareerApplication.ts              # Admin: list/delete applications · Public: apply
│   │   │   └── usePublicCareer.ts                   # Public: open jobs, job by slug, hasOpenCareers
│   │   ├── schemas/
│   │   │   ├── career.schema.ts                     # CreateCareerSchema, UpdateCareerSchema
│   │   │   └── career-application.schema.ts         # applyJobSchema
│   │   ├── types/career.types.ts                    # ICareer, IAdminCareer, IApplication, IApplicationReceipt, enums
│   │   ├── constants/career.constants.ts            # Labels, select options, resume limits, CLOSING_SOON_DAYS
│   │   └── utils/
│   │       ├── career.utils.ts                      # Deadline/date/salary/experience formatting, htmlToText
│   │       └── career-seo.server.ts                 # Server-only fetchers + description + JobPosting JSON-LD
│   │
│   ├── components/
│   │   ├── layout/navbar/Navbar.tsx                 # Conditional "Career" link
│   │   ├── layout/sidebar/AdminSidebar.tsx          # "Career" → /career-admin (no employee flag)
│   │   ├── layout/hero/Hero.tsx                     # Page hero on both public pages
│   │   ├── data-display/table/CustomTable.tsx
│   │   ├── form/ (InputField, PhoneInputField, TextAreaField, DateInputField, SingleSelectSearch, TextEditor, SubmitButton, formStyles)
│   │   └── primitives/ (modal/CustomModal2, modal/ConfirmModal, button/AddButton, button/CancelButton, CustomTooltip, CustomBreadCrumb)
│   │
│   └── hooks/
│       ├── api/ (useGet, useGetAll, usePost, usePatch, useDelete, useFormPost)
│       └── table/useHandleModalState.ts
```

**Cross-module imports** (see [TD-6](#26-known-issues--technical-debt)): the job page reuses `ShareButtons` from `modules/blog/public/blog-details/` and `toJsonLd` from `modules/blog/utils/blog-seo.server`.

**Page convention.** Public pages export metadata and lazy-load the module with a full-page loader:

```tsx
// src/app/(public)/career/page.tsx
export const metadata: Metadata = { title: "Careers | Natura Care Limited", ... };
const DynamicCareerPage = dynamic(() => import("@/modules/career/public/career/Career"), {
  loading: () => <LoadingPage />,
});
export default function CareerPage() {
  return <DynamicCareerPage />;
}
```

The admin page differs: it is a Client Component so it can pass `ssr: false` to `dynamic()`, and therefore exports no metadata ([TD-4](#26-known-issues--technical-debt)).

[↑ Back to top](#table-of-contents)

---

## 5. Routes & Role-Based Access Control

### Routes

| Route | Group | Entry component | Purpose |
|---|---|---|---|
| `/career-admin` | `(admin)` | [`admin/Career.tsx`](../src/modules/career/admin/Career.tsx) | Manage jobs and applicants |
| `/career` | `(public)` | [`public/career/Career.tsx`](../src/modules/career/public/career/Career.tsx) | List open positions |
| `/career-details/[slug]` | `(public)` | [`CareerDetails.tsx`](../src/modules/career/public/career-details/CareerDetails.tsx) | Job page + application form |
| `/sitemap.xml` | — | [`app/sitemap.ts`](../src/app/sitemap.ts) | `/career` + every open job |

### Page access (middleware)

[`src/middleware.ts`](../src/middleware.ts) decodes the role from the `accessToken` cookie (how it is set is covered in the [Auth docs](./auth.md)).

| Route | ADMIN | EMPLOYEE | CUSTOMER | Guest |
|---|:-:|:-:|:-:|:-:|
| `/career` | ✅ | ✅ | ✅ | ✅ (`PUBLIC_ROUTES`, exact match) |
| `/career-details/<slug>` | ✅ | ✅ | ✅ | ✅ (`startsWith("/career-details/")`) |
| `/career-admin` | ✅ (`ADMIN_ONLY_ROUTES`) | ❌ → `/dashboard` | ❌ → `/` | ❌ → `/login` |

`/career-admin` is **not** in `EMPLOYEE_ROUTES`, and the sidebar item has no `employee: true` flag, so employees neither see nor reach it. The page guard and the API guard agree, unlike the category module's TD-1.

### API access

| Endpoint | ADMIN | Others (EMPLOYEE, CUSTOMER, guest) |
|---|:-:|:-:|
| `GET /job/all-jobs` | ✅ | ❌ 401/403 |
| `POST /job/create-job`, `PATCH /job/update-job/:id`, `DELETE /job/delete-job-with-applications/:id` | ✅ | ❌ 401/403 |
| `GET /job/active-current-jobs` | ✅ admin DTO | ✅ public DTO |
| `GET /job/:slug` | ✅ **any status / deadline** | ✅ open jobs only, else 404 |
| `POST /application/create-job-application` | ✅ | ✅ (no login) |
| `GET /application/all-applications/:jobId`, `DELETE /application/delete-application/:id` | ✅ | ❌ 401/403 |

### How the server identifies the viewer

The two public `GET /job` endpoints use the server's `IdentifyViewerGuard`: no token → public view; a valid **ADMIN** token → admin view (`sid`, `applicationCount`, audit users); any other role → public view. Because the axios interceptor attaches the Bearer token whenever the cookie exists, a signed-in admin browsing the storefront receives admin-view responses (see [TD-1](#26-known-issues--technical-debt)). An **expired** token sent to these public endpoints returns 401, which the interceptor answers with a token refresh like any other call.

The server-side SEO fetchers in [`career-seo.server.ts`](../src/modules/career/utils/career-seo.server.ts) use plain `fetch` **without a token**, so metadata and JSON-LD are always built from the public view.

[↑ Back to top](#table-of-contents)

---

## 6. End-to-End Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant AdminUI as /career-admin
    participant API as Natura Care API
    participant Store as /career & /career-details
    actor Candidate

    Admin->>AdminUI: Add job opening (form)
    AdminUI->>API: POST /job/create-job (JSON)
    API-->>AdminUI: 201 job (ACTIVE, slug from position)
    Note over Store: Job is Live until its deadline day ends
    Candidate->>Store: Opens /career (navbar link appears)
    Store->>API: GET /job/active-current-jobs
    Candidate->>Store: Opens a job card
    Store->>API: GET /job/:slug
    Candidate->>Store: Fills form + attaches resume
    Store->>API: POST /application/create-job-application (multipart)
    API-->>Store: 201 receipt (sid, position, email)
    Store-->>Candidate: "Application sent!" + reference
    Admin->>AdminUI: Clicks "N applicants"
    AdminUI->>API: GET /application/all-applications/:jobId
    Admin->>API: Opens resumeUrl / deletes application
    Admin->>AdminUI: Edit → status INACTIVE (or deadline passes)
    Note over Store: Job disappears from /career; job page shows "no longer open"
```

### Lifecycle of a job

```text
            create (always ACTIVE)
                    │
                    ▼
   ┌──────────►  LIVE  ──── deadline day ends ────►  EXPIRED
   │                │                                    │
   │      edit: status=INACTIVE              edit: new future deadline
   │                ▼                                    │
   └── edit: status=ACTIVE ── INACTIVE ◄─────────────────┘ (back to LIVE)

   Any state ── delete ──► gone, together with every application and resume file
```

[↑ Back to top](#table-of-contents)

---

## 7. Admin Section — Jobs List (`/career-admin`)

Entry: [`modules/career/admin/Career.tsx`](../src/modules/career/admin/Career.tsx). Sidebar item "Career" (`MdWorkHistory` icon) in [`AdminSidebar`](../src/components/layout/sidebar/AdminSidebar.tsx).

### 7.1 Screen layout

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Jobs                                              [+ Add Job Opening] │
│ Live jobs appear on the careers page until their deadline.           │
├──────────────────────────────────────────────────────────────────────┤
│ [Search by position or location]                                      │
├─────────────────┬──────────────┬─────────────┬────────┬────────┬─────┤
│ Position        │ Deadline     │ Applications│ Salary │ Status │ Act │
│ Sales Executive │ 30 Nov 2026  │ [👥 3 appl.] │ 25k–30k│ Live   │ ✎ 🗑 │
│ Full time·Hybrid│ [8 days left]│             │        │        │     │
│ View on site ↗  │              │             │        │        │     │
├─────────────────┴──────────────┴─────────────┴────────┴────────┴─────┤
│ ‹ 1 2 3 ›                                       Rows per page [10 ▾] │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.2 Data fetching

[`useCareerList`](../src/modules/career/hooks/useCareer.ts) → `useGetAll` → `GET /job/all-jobs?page&limit&search&sortOrder`.

- Returns every job regardless of status or deadline, newest first, with `applicationCount` and audit users (`IAdminCareer`).
- Query key: `["getAllJobs", page, limit, search, sortOrder]`. Every parameter is in the key, so each page/search combination is cached separately.
- Empty `search` / `sortOrder` are sent as `undefined` so axios omits them.

### 7.3 Search, sorting & pagination

| Control | State in `Career.tsx` | Sent as | Notes |
|---|---|---|---|
| Search box | `searchTerm` | `search` | Server matches **position and location**. Changing it resets to page 1. |
| Page | `currentPage` | `page` | From `meta.totalPages`. |
| Rows per page | `pageSize` (default 10) | `limit` | |
| Sort | `sortOrder` (default `desc`) | `sortOrder` | Wired, but no column is sortable, so it never changes ([TD-2](#26-known-issues--technical-debt)). |

### 7.4 Columns & the Live / Expired / Inactive badge

Defined in [`getCareerColumns(handleEdit, handleDelete, handleAllApplication)`](../src/modules/career/admin/career.columns.tsx).

| Column | Content | Interaction |
|---|---|---|
| **Position** | Title; `Job type · Work mode · Location`; "View on site ↗" link **only when Live** | Link opens `/career-details/<slug>` in a new tab |
| **Deadline** | `30 Nov 2026` + `DeadlineBadge` | — |
| **Applications** | "N applicants" pill (blue when > 0, grey when 0) | Opens the Applicants modal |
| **Salary** | `salary` or "Negotiable" | — |
| **Status** | Derived badge: **Live** / **Expired** / **Inactive** (see [§2](#visibility-the-three-states-an-admin-sees)) | — |
| **Action** | Edit, Delete (`CustomTooltip` icons) | Opens Edit modal / delete confirm |

### 7.5 Modals

All dialogs use [`CustomModal2`](../src/components/primitives/modal/CustomModal2.tsx) with `MODAL_WIDTH = "w-[calc(100vw-2rem)] max-w-4xl"`, and share one shell layout: sticky header, scrollable body, sticky footer.

| Modal | Opened by | State | Component |
|---|---|---|---|
| Add job | `AddButton` | `openModal` | [`AddCareer`](../src/modules/career/admin/AddCareer.tsx) |
| Edit job | Edit icon | `useHandleModalState` (`"edit"`) | [`EditCareer`](../src/modules/career/admin/EditCareer.tsx), `key={modalData?.id}` so defaults reset per job |
| Applicants | Applications pill | `applicationsJob` | [`AllApplications`](../src/modules/career/admin/AllApplications.tsx) |
| Delete job | Delete icon | `deleteTarget` | [`ConfirmModal`](../src/components/primitives/modal/ConfirmModal.tsx) |

[↑ Back to top](#table-of-contents)

---

## 8. Admin Section — Add Job

Component: [`AddCareer.tsx`](../src/modules/career/admin/AddCareer.tsx) · Fields: [`CareerFormFields.tsx`](../src/modules/career/admin/CareerFormFields.tsx) · Schema: `CreateCareerSchema`.

### Form fields

| Section | Form field | Control | Required | API field | Rules |
|---|---|---|:-:|---|---|
| Basics | `position` | `InputField` | ✅ | `position` | 2–255 chars, at least one letter/digit (slug is built from it) |
| Basics | `jobType` | `SingleSelectSearch` (`JOB_TYPE_OPTIONS`) | ✅ | `jobType` | One of the 4 job types |
| Basics | `jobLocationType` | `SingleSelectSearch` (`JOB_LOCATION_TYPE_OPTIONS`) | — | `jobLocationType` | Omitted when blank |
| Basics | `location` | `InputField` | ✅ | **`jobLocation`** | 2–255 chars |
| Basics | `salary` | `InputField` | — | `salary` | ≤ 100 chars; blank → server stores "Negotiable" |
| Basics | `deadline` | `DateInputField` | ✅ | `deadline` | Valid date; past dates disabled in the picker and refused by the API |
| Description | `overview` | `TextEditor` | — | **`jobOverview`** | HTML |
| Description | `responsibilities` | `TextEditor` | ✅ | **`jobResponsibilities`** | Must contain visible text, not just `<p><br></p>` |
| Description | `requirements` | `TextEditor` | ✅ | **`jobRequirements`** | Same |
| Description | `facilities` | `TextEditor` | — | **`jobFacilities`** | HTML ("Benefits / facilities") |

The form uses short names; the request uses the API's names. The mapping is written inline in `AddCareer.onSubmit` (and as `API_FIELD` in `EditCareer`, see [TD-15](#26-known-issues--technical-debt)).

### Submit flow

1. zod validates on submit; errors render under each field.
2. Optional blanks become `undefined` so they are left out of the JSON.
3. `useCreateCareer` → `usePost("/job/create-job")` → toast `"Job created successfully"`.
4. On 2xx the modal closes and `refetchCareer()` reloads the table.
5. The job is created **ACTIVE** (there is no status field on create) and is Live immediately.

[↑ Back to top](#table-of-contents)

---

## 9. Admin Section — Edit Job

Component: [`EditCareer.tsx`](../src/modules/career/admin/EditCareer.tsx) · Schema: `UpdateCareerSchema` (every field optional, plus `status`).

### Submit logic: dirty fields only

```ts
if (!isDirty) { toast.info("No changes to save"); setOpen(false); return; }

const payload = {};
for (const field of Object.keys(API_FIELD))
  if (dirtyFields[field]) payload[API_FIELD[field]] = values[field] ?? "";

if (payload.jobLocationType === "") payload.jobLocationType = null;   // cleared work mode
if (job.status === "INACTIVE" && !payload.status) payload.status = values.status;

updateCareer(job.id, payload);   // PATCH /job/update-job/:id
```

| Rule | Why | Where |
|---|---|---|
| Only changed fields are sent. | The PATCH contract is "fields left out stay as they are". | [`EditCareer.tsx:19`](../src/modules/career/admin/EditCareer.tsx#L19) (`API_FIELD`) |
| A cleared work mode is sent as `null`, not `""`. | `""` is not a valid enum value. | [`EditCareer.tsx:75`](../src/modules/career/admin/EditCareer.tsx#L75) |
| Editing an **INACTIVE** job always sends `status`. | The server rejects edits to an inactive job unless `status` comes with them: *"This job is inactive. Send status ACTIVE with your changes to edit it."* | [`EditCareer.tsx:77`](../src/modules/career/admin/EditCareer.tsx#L77) |
| Renaming the position changes the slug. | The server rebuilds the slug; old `/career-details/<old-slug>` links and shares break. | Server |

### Status field

Only the edit form shows **Status** (`showStatus` prop on `CareerFormFields`). An inactive job opens with an amber banner: *"This job is inactive and hidden from the careers page. Set the status to Active to publish it again."*

To **re-open an expired job**, set a new deadline (today or later). Status can stay `ACTIVE`.

[↑ Back to top](#table-of-contents)

---

## 10. Admin Section — Delete Job

- Trigger: the Delete icon → `ConfirmModal`.
- The confirmation text depends on `applicationCount` ([`Career.tsx:119`](../src/modules/career/admin/Career.tsx#L119)):
  - 0 → *"The job will be removed from the careers page. This cannot be undone."*
  - N → *"This also deletes its N applications and their resumes. This cannot be undone."*
- Request: `DELETE /job/delete-job-with-applications/:id` (one transaction; the server then deletes the resume files).
- `useDelete("getAllJobs")` toasts *"Deleted successfully."* and invalidates every `getAllJobs` query, so the table refreshes without an explicit refetch.

> The server also offers the safer `DELETE /job/delete-job/:id`, which refuses a job that has applications. The client does not use it; the confirm dialog warns about applications instead.

[↑ Back to top](#table-of-contents)

---

## 11. Admin Section — Applicants

Component: [`AllApplications.tsx`](../src/modules/career/admin/AllApplications.tsx), opened from the Applications pill.

### Data

[`useCareerApplications(jobId, search)`](../src/modules/career/hooks/useCareerApplication.ts) → `GET /application/all-applications/:jobId?search=`.

- Disabled until a `jobId` exists (`shouldFetch = Boolean(jobId)`).
- No `page`/`limit` is sent, so the server returns **all** applications, newest first ([TD-11](#26-known-issues--technical-debt)).
- Search is **debounced 400 ms** (`SEARCH_DEBOUNCE_MS`) and matches name, email and phone on the server. The search box only appears when the job has applications.

### Header count

```ts
// AllApplications.tsx:65
const total = isApplicationsLoading || search ? job.applicationCount : applications.length;
```

The row's `applicationCount` stands in while loading or while a search narrows the list. Otherwise the loaded list is the live count.

### Applicant card

| Element | Source | Behavior |
|---|---|---|
| Initials avatar | First letters of the first two name parts | — |
| Name + "Applied 4 Nov 2026, 3:15 pm" | `name`, `appliedAt` | Local time |
| Email | `email` | `mailto:` link |
| Phone | `phoneNumber` | `tel:` link |
| Address | `address` | "No address given" when null |
| Experience | `experienceLabel(yearsOfExperience)` | `0` → "Fresher"; null → "Experience not stated" |
| Skills chips | `skills.split(",")` | Hidden when empty |
| **View resume** | `resumeUrl` (absolute URL built by the server) | Opens in a new tab (`noopener noreferrer`) |
| Delete | — | `ConfirmModal` → `DELETE /application/delete-application/:id` |

After a delete, the modal refetches the applications **and** the jobs table (`refetch` prop), because the table shows `applicationCount`.

[↑ Back to top](#table-of-contents)

---

## 12. Storefront — Careers Page (`/career`)

Entry: [`public/career/Career.tsx`](../src/modules/career/public/career/Career.tsx).

### Data

[`usePublicCareers()`](../src/modules/career/hooks/usePublicCareer.ts) → `GET /job/active-current-jobs` (no pagination: all open jobs). The query key `["getAllActiveCurrentJobs"]` is **shared with the navbar**, so the navbar's request warms the cache this page reads.

### Page structure

1. `Hero` ("Career").
2. Intro: heading, "No account needed", and an "N open positions" pill.
3. **Filter bar** (only when at least one job exists):
   - Search (client-side, position or location, case-insensitive, with a clear button).
   - Work-mode `<select>`: lists **only modes that have jobs**, with counts, e.g. "Hybrid (2)".
   - Sort `<select>`: *Newest first* (API order) or *Closing soonest* (`daysUntil` ascending).
   - Job-type chips: "All jobs N" plus **only types that have jobs**, each with its count (`aria-pressed`).
4. "Showing X of Y positions · Clear filters" when any filter is active (`aria-live="polite"`).
5. Job grid of [`JobCard`](../src/modules/career/public/career/JobCard.tsx)s (1 column, 2 from `md`).
6. "How to apply" — three steps (find role → send application, mentioning `RESUME_MAX_MB` → hear from us).

All filtering and sorting happen in the browser (`useMemo` over `jobs`). Filter state is **not** reflected in the URL.

### States

| Condition | UI |
|---|---|
| Loading | `JobSkeleton` (4 placeholder cards) |
| Request failed | "We couldn't load the open positions" + **Try again** (`refetchJobs`) |
| No open jobs | "No openings right now" + **Contact us** link |
| Filters match nothing | "No jobs match your filters" + **Clear filters** |
| Jobs | Grid of `JobCard` |

### `JobCard`

The whole card is a `<Link>` to `/career-details/<slug>`. It shows the type, work-mode and deadline badges, the title, location, salary ("Negotiable" fallback), "Apply by 30 Nov 2026 · Posted 3 days ago", and "View job →".

[↑ Back to top](#table-of-contents)

---

## 13. Storefront — Job Details (`/career-details/[slug]`)

Route file: [`app/(public)/career-details/[slug]/page.tsx`](../src/app/(public)/career-details/[slug]/page.tsx) (server) · UI: [`CareerDetails.tsx`](../src/modules/career/public/career-details/CareerDetails.tsx) (client).

### Rendering model

| Layer | Runs on | Fetches | Produces |
|---|---|---|---|
| `generateMetadata` | Server | `fetchOpenJob(slug)` (no token, revalidate 300 s) | Title, description, canonical, OG/Twitter; `noindex` when not open |
| Page body | Server | same `fetchOpenJob` (deduped by Next) | `<script type="application/ld+json">` JobPosting |
| `CareerDetails` | Client | `usePublicCareerDetails(slug)` → `GET /job/:slug` | The visible page |

### Client query behavior

```ts
// usePublicCareer.ts:42
retry: (failureCount, err) => err?.statusCode !== 404 && failureCount < 2,
```

It uses `useQuery` directly instead of `useGet`, so an expected 404 (closed, inactive or unknown job) is **not toasted and not retried**. The hook exposes `isNotFound` and `isCareerError` separately.

### Layout

```text
← All open positions
┌─ header (careerBg) ─────────────────────────────────────────────┐
│ [Full time] [Hybrid] [8 days left]                [Apply now]  │ (desktop CTA)
│ Digital Marketing Executive                                     │
│ 📍 Uttara, Dhaka   💰 25,000–30,000 BDT                          │
└─────────────────────────────────────────────────────────────────┘
┌─ main ───────────────────────────────┐ ┌─ aside (sticky lg) ────┐
│ About the role        (jobOverview)  │ │ Job summary            │
│ What you'll do        (responsib.)   │ │ type, mode, location,  │
│ What we're looking for(requirements) │ │ salary, apply by, posted│
│ What we offer         (facilities)   │ │ [Apply now]            │
│ ┌ Apply for this job (#apply) ─────┐ │ │ Share: ShareButtons    │
│ │ CareerForm                       │ │ └────────────────────────┘
│ └──────────────────────────────────┘ │   (on mobile the aside moves above the description)
└──────────────────────────────────────┘
[ mobile sticky bar: title · Apply by …            [Apply now] ]
```

- Description sections with empty HTML are skipped. HTML is rendered with `dangerouslySetInnerHTML` inside `.rich-text-container` ([TD-3](#26-known-issues--technical-debt)).
- Every **Apply now** button smooth-scrolls to `#apply` (`scroll-mt-28` clears the sticky header).
- **Mobile apply bar** (below `lg`): an `IntersectionObserver` on the form wrapper ([`CareerDetails.tsx:117`](../src/modules/career/public/career-details/CareerDetails.tsx#L117)) slides the bar away while the form is on screen. When hidden it is also `aria-hidden` and its button gets `tabIndex=-1`.
- The breadcrumb shows `Career › <position truncated to 24 chars>`.

### States

| Condition | Heading | Actions |
|---|---|---|
| Loading | `CareerDetailsSkeleton` | — |
| Found | Job page | — |
| 404 / no data | "This position is no longer open" | View open positions |
| Other error | "We couldn't load this job" | Try again · View open positions |

[↑ Back to top](#table-of-contents)

---

## 14. Storefront — Application Form

Component: [`CareerForm.tsx`](../src/modules/career/public/career-details/CareerForm.tsx) · Schema: `applyJobSchema` · Hook: `useApplyToJob` (multipart via `useFormPost`).

### Fields

| Group | Form field | Control | Required | Multipart key | Rules |
|---|---|---|:-:|---|---|
| Your details | `name` | `InputField` | ✅ | `name` | 1–100 chars |
| Your details | `email` | `InputField` (email) | ✅ | `email` | Valid email, ≤ 255 |
| Your details | `phone` | `PhoneInputField` | ✅ | **`phoneNumber`** | `validatePhone`: `+8801[3-9]XXXXXXXX` or `01[3-9]XXXXXXXX` |
| Your details | `address` | `InputField` | — | `address` | ≤ 255 |
| Experience | `yearOfExperience` | `InputField` (number) | — | **`yearsOfExperience`** | 0–50, at most one decimal (e.g. 2.5) |
| Experience | `skills` | `TextAreaField` | — | `skills` | ≤ 1000; comma-separated (the admin card splits on commas) |
| Experience | `resumeFile` | [`ResumeUploadField`](../src/modules/career/public/career-details/ResumeUploadField.tsx) | ✅ | `resumeFile` | PDF/DOC/DOCX MIME, ≤ 2 MB |
| (hidden) | — | — | ✅ | `jobId` | From the job |

Validation mode is `onTouched`, so errors appear after a field is left, not on every keystroke.

### Building the request ([`CareerForm.tsx:51`](../src/modules/career/public/career-details/CareerForm.tsx#L51))

```ts
const formData = new FormData();
formData.append("jobId", String(jobId));
formData.append("name", data.name.trim());
formData.append("phoneNumber", data.phone.trim());
formData.append("email", data.email.trim());
appendIfPresent("address", data.address);            // blank → omitted → server stores null
appendIfPresent("yearsOfExperience", data.yearOfExperience);
appendIfPresent("skills", data.skills);
formData.append("resumeFile", data.resumeFile);
applyJob(formData);  // POST /application/create-job-application (multipart/form-data)
```

`appendIfPresent` leaves blanks out so the server stores `null` rather than `""` or `0`.

### Submission UX

- Both fieldsets are `disabled` while sending. The button shows a spinner and "Sending application…".
- **Success:** the form resets, the section scrolls into view, and a receipt replaces the form: *"Application sent!"*, the candidate's name, the position, the email they will be contacted at, and a **reference** (first 8 characters of `sid`, upper-cased), plus links to other openings and products. The success toast is the server's message.
- **Failure:** the form keeps its values; the server message is toasted (see [§24](#24-error-handling)).

### `ResumeUploadField`

A generic react-hook-form field (`useController`): click or drag-and-drop a file, see its name and size (`formatFileSize`), **Replace** or **Remove** it. The native input is `sr-only` with `accept=".pdf,.doc,.docx"`. Type and size are checked by the schema, not the input, so a wrong file gets a clear message rather than being silently rejected.

[↑ Back to top](#table-of-contents)

---

## 15. SEO: Metadata, JSON-LD & Sitemap

| Output | Source | Details |
|---|---|---|
| `/career` metadata | static `metadata` in [`career/page.tsx`](../src/app/(public)/career/page.tsx) | Title "Careers \| Natura Care Limited", canonical `/career`, OG |
| Job metadata | `generateMetadata` | `"<position> \| Careers at Natura Care"`; description from [`jobDescription()`](../src/modules/career/utils/career-seo.server.ts) (overview, else responsibilities, as plain text, ≤ 160 chars); canonical `/career-details/<slug>` |
| Closed/unknown job | `generateMetadata` | Generic fallback metadata + `robots: { index: false, follow: true }`, so a "no longer open" page is never indexed |
| Structured data | [`jobPostingJsonLd()`](../src/modules/career/utils/career-seo.server.ts) | schema.org `JobPosting`: title, HTML description with section headings, `datePosted`, `validThrough` (deadline day at `23:59:59Z`), `employmentType`, `hiringOrganization`, `directApply: true`; remote (`ONLINE`) → `TELECOMMUTE` + Bangladesh, otherwise a `PostalAddress` in BD |
| Sitemap | [`app/sitemap.ts`](../src/app/sitemap.ts) | `/career` (weekly, 0.6) + each open job (weekly, 0.5, `lastModified = updatedAt`); revalidated every 300 s |

`employmentType` mapping: `FULL_TIME → FULL_TIME`, `PART_TIME → PART_TIME`, `CONTRACT → CONTRACTOR`, `INTERNSHIP → INTERN`.

Every server fetcher **swallows errors** (`null` / `[]`), so an API outage degrades SEO instead of breaking the page or the sitemap.

[↑ Back to top](#table-of-contents)

---

## 16. API Reference

All paths are relative to `NEXT_PUBLIC_API_BASE_URL` and defined in [`career.api.constants.ts`](../src/constants/api/career.api.constants.ts). Server-side calls go to `INTERNAL_API_BASE_URL` when it is set (Docker), through [`getBaseUrl()`](../src/config/env.config.ts).

### Endpoints used by the client

| Constant | Method & path | Auth | Used by |
|---|---|---|---|
| `CAREER_API.paths.ALL` | `GET /job/all-jobs?page&limit&search&sortOrder` | ADMIN | `useCareerList` |
| `CAREER_API.paths.ACTIVE_CURRENT` | `GET /job/active-current-jobs` | Public (role-aware) | `usePublicCareers`, `useHasOpenCareers`, sitemap |
| `CAREER_API.paths.BY_SLUG(slug)` | `GET /job/:slug` | Public (role-aware) | `usePublicCareerDetails`, `fetchOpenJob` |
| `CAREER_API.paths.CREATE` | `POST /job/create-job` (JSON) | ADMIN | `useCreateCareer` |
| `CAREER_API.paths.UPDATE_BY_ID(id)` | `PATCH /job/update-job/:id` (JSON, partial) | ADMIN | `useUpdateCareer` |
| `CAREER_API.paths.DELETE_BY_ID(id)` | `DELETE /job/delete-job-with-applications/:id` | ADMIN | `useDeleteCareer` |
| `CAREER_APPLICATION_API.paths.CREATE` | `POST /application/create-job-application` (multipart) | Public | `useApplyToJob` |
| `CAREER_APPLICATION_API.paths.BY_JOB_ID(jobId)` | `GET /application/all-applications/:jobId?search` | ADMIN | `useCareerApplications` |
| `CAREER_APPLICATION_API.paths.DELETE_BY_ID(id)` | `DELETE /application/delete-application/:id` | ADMIN | `useDeleteApplication` |

### Available but unused by the client

| Endpoint | Purpose |
|---|---|
| `GET /job/single-job-details/:id` | Admin: one job by id (any status) |
| `DELETE /job/delete-job/:id` | Admin: delete only if the job has no applications |
| `page` / `limit` on `active-current-jobs` and `all-applications` | Pagination (client fetches all) |

### Response shape

The axios response interceptor unwraps every response to `ResponseSuccessType`:

```ts
{ statusCode: 200, success: true, message: "Open jobs retrieved successfully",
  data: ICareer[] | ICareer | IApplication[] | IApplicationReceipt,
  meta?: { page, limit, totalItems, totalPages } }
```

- `useGet` returns `response.data` (the payload).
- `useGetAll` returns the **whole envelope**, so `useCareerList` reads `data.data` and `data.meta`.
- Errors are normalized to `IGenericErrorResponse` `{ statusCode, message, errorMessages }`.

[↑ Back to top](#table-of-contents)

---

## 17. Types

File: [`types/career.types.ts`](../src/modules/career/types/career.types.ts).

| Type | Server DTO | Purpose |
|---|---|---|
| `CareerStatus` | — | `"ACTIVE" \| "INACTIVE"` |
| `JobType` | — | `"PART_TIME" \| "FULL_TIME" \| "CONTRACT" \| "INTERNSHIP"` |
| `JobLocationType` | — | `"ONSITE" \| "ONLINE" \| "HYBRID"` |
| `ICareer` | `PublicJobDto` | Job as the storefront receives it. `id` is sent back as `jobId` when applying. |
| `IAdminCareer extends ICareer` | `AdminJobDto` | Adds `sid`, `applicationCount`, `createdBy?`, `updatedBy?` |
| `ICareerAuditUser` | — | `{ id, name, phone, email, role }` on the audit trail |
| `IApplication` | `AdminApplicationDto` | One applicant as the admin sees it (`resumeUrl` is absolute) |
| `IApplicationReceipt` | `PublicApplicationDto` | What the candidate gets back: `sid, jobId, position, name, email, appliedAt` |
| `ICareerOption` | — | `{ id, name }` option for `SingleSelectSearch` |
| `ICareerListParams` (in `useCareer.ts`) | — | `{ page, limit, search?, sortOrder? }` |
| `DeadlineState` (in `career.utils.ts`) | — | `"open" \| "closingSoon" \| "closed"` |
| `CreateCareerType`, `UpdateCareerType`, `ApplyJobForm` | — | Inferred from the zod schemas |

Shared types used: `IModal` (`setOpen`, `refetch`, `onClose`, `data`) for every modal body, `ResponseSuccessType`, `IGenericErrorResponse`, `IPaginationMeta` from `@/types`.

[↑ Back to top](#table-of-contents)

---

## 18. Validation Schemas

### [`career.schema.ts`](../src/modules/career/schemas/career.schema.ts)

- `baseJobSchema` holds the field rules once. Limits mirror the server's `CreateJobDto`, so a value is rejected before it is sent.
- `CreateCareerSchema` picks every field **except `status`** (a new job is always ACTIVE).
- `UpdateCareerSchema = z.object(baseJobSchema).partial()`: every field optional, `status` included.
- `requiredRichText(label)` uses `hasText()` to strip tags and `&nbsp;`, so an "empty" editor (`<p><br></p>`) fails as required. The server applies the same idea (`toRichText` turns tag-only HTML into `""`).
- Exported enums: `StatusEnum`, `JobTypeEnum`, `JobLocationTypeEnum`.

### [`career-application.schema.ts`](../src/modules/career/schemas/career-application.schema.ts)

- Mirrors the server's `CreateApplicationMultipartDto`, so the candidate sees every problem **before the upload starts**.
- `yearOfExperience` is `.nullish()` because `InputField` returns `null` for an emptied number input.
- `resumeFile` runs three refinements in order: present (`instanceof File`) → allowed MIME type → size ≤ `RESUME_MAX_MB`.

> When a limit changes on the server, change it here and in `career.constants.ts` too. The client copies are what the user sees first.

[↑ Back to top](#table-of-contents)

---

## 19. Constants

### [`career.constants.ts`](../src/modules/career/constants/career.constants.ts)

| Constant | Value | Used for |
|---|---|---|
| `JOB_TYPE_LABELS` | `Record<JobType, string>` | Badges, chips, admin row subtitle |
| `JOB_LOCATION_TYPE_LABELS` | `Record<JobLocationType, string>` (`ONLINE` → "Remote") | Badges, work-mode select |
| `JOB_TYPE_OPTIONS`, `JOB_LOCATION_TYPE_OPTIONS` | Derived from the label maps | Admin selects (stay in sync with labels automatically) |
| `JOB_STATUS_OPTIONS` | Active / Inactive | Edit form only |
| `CLOSING_SOON_DAYS` | `5` | Amber deadline badge |
| `RESUME_MAX_MB` | `2` | Schema, upload hint, "How to apply" copy (matches server `APPLICATION_LIMITS.RESUME_MAX_MB`) |
| `RESUME_ACCEPT` | `".pdf,.doc,.docx"` | File input `accept` |
| `RESUME_MIME_TYPES` | pdf, msword, wordprocessingml | Schema MIME check |
| `NEGOTIABLE_SALARY` | `"Negotiable"` | `salaryLabel()` fallback (same string the server stores) |

### [`career.api.constants.ts`](../src/constants/api/career.api.constants.ts)

Each API constant has three parts:

- `paths`: endpoint strings or builders.
- `keys`: full query-key arrays for `useGet` / `useGetAll`.
- `rootKeys`: the single string `useDelete` / `invalidateQueries` expect.

See [§23](#23-caching--query-keys).

[↑ Back to top](#table-of-contents)

---

## 20. Hooks

### Module hooks

| Hook | File | Wraps | Returns |
|---|---|---|---|
| `useCareerList({ page, limit, search, sortOrder })` | [`useCareer.ts`](../src/modules/career/hooks/useCareer.ts) | `useGetAll` | `careers`, `meta`, `isCareerLoading`, `refetchCareer` |
| `useCreateCareer(onSuccess?)` | `useCareer.ts` | `usePost` | `createCareer(body)`, `isCreating` |
| `useUpdateCareer(onSuccess?)` | `useCareer.ts` | `usePatch` | `updateCareer(id, payload)`, `isUpdating` |
| `useDeleteCareer()` | `useCareer.ts` | `useDelete("getAllJobs")` | `deleteCareer(id, onSuccess?)`, `isDeletingCareer` |
| `useCareerApplications(jobId?, search?)` | [`useCareerApplication.ts`](../src/modules/career/hooks/useCareerApplication.ts) | `useGet` (enabled by `jobId`) | `applications`, `isApplicationsLoading`, `isApplicationsFetching`, `refetchApplications` |
| `useDeleteApplication()` | `useCareerApplication.ts` | `useDelete("getAllApplications")` | `deleteApplication(id, onSuccess?)`, `isDeletingApplication` |
| `useApplyToJob(onSuccess?)` | `useCareerApplication.ts` | `useFormPost` | `applyJob(formData)`, `isApplying`; `onSuccess(receipt)` on 2xx |
| `usePublicCareers()` | [`usePublicCareer.ts`](../src/modules/career/hooks/usePublicCareer.ts) | `useGet` | `jobs`, `isJobsLoading`, `isJobsError`, `refetchJobs` |
| `usePublicCareerDetails(slug?)` | `usePublicCareer.ts` | raw `useQuery` (404-aware) | `career`, `isCareerLoading`, `isNotFound`, `isCareerError`, `refetchCareer` |
| `useHasOpenCareers()` | `usePublicCareer.ts` | `usePublicCareers` | `hasOpenCareers` (stays `false` while loading, so the link never flashes) |

Convention: each hook hides the raw TanStack result and returns **domain-named** fields (`careers`, `isCreating`), so components never touch `data?.data`.

### Shared hooks

| Hook | Behavior that matters here |
|---|---|
| [`useGet` / `useGetAll`](../src/hooks/api/useGet.ts) | Toast on fetch failure. `useGet` → payload, `useGetAll` → envelope. |
| [`usePost`](../src/hooks/api/usePost.ts) | Toasts the server `message` on success; one toast per message when `message` is an array (validation errors). |
| [`usePatch`](../src/hooks/api/usePatch.ts) | Takes `{ endpoint, data }` per call; toasts success/failure. |
| [`useDelete`](../src/hooks/api/useDelete.ts) | Toasts *"Deleted successfully."* and invalidates `[rootKey]`. |
| [`useFormPost`](../src/hooks/api/useFormPost.ts) | Sends `multipart/form-data` when given `FormData`; same toast rules as `usePost`. |
| [`useHandleModalState<T>`](../src/hooks/table/useHandleModalState.ts) | `{ modalData, isOpen(type), handleOpen(type, data), handleClose }` for the Edit modal. |

Global retry policy ([`QueryProvider`](../src/providers/QueryProvider.tsx)): 4xx is never retried; network/5xx up to 2 times; mutations never.

[↑ Back to top](#table-of-contents)

---

## 21. Utilities

### [`career.utils.ts`](../src/modules/career/utils/career.utils.ts) (isomorphic)

| Function | Example output | Notes |
|---|---|---|
| `daysUntil(deadline)` | `8`, `0`, `-2` | Deadline day read in UTC; "today" in the viewer's zone |
| `deadlineState(deadline)` | `"open"` / `"closingSoon"` / `"closed"` | Uses `CLOSING_SOON_DAYS` |
| `deadlineLabel(deadline)` | "Closes today", "Closes tomorrow", "8 days left", "Closed" | |
| `formatDeadline(deadline)` | "30 Nov 2026" | `en-GB`, UTC |
| `postedLabel(createdAt)` | "Posted today", "Posted 4 days ago", "Posted 12 Oct 2026" | Date shown from 30 days |
| `salaryLabel(salary)` | "25,000 BDT" or "Negotiable" | |
| `jobTypeLabel(job)` / `workModeLabel(job)` | "Full time" / "Remote" or `null` | |
| `experienceLabel(years)` | "Fresher", "1 year", "2.5 years", `null` | |
| `formatFileSize(bytes)` | "1.2 MB", "340 KB" | Minimum 1 KB |
| `htmlToText(html)` | Plain text | For meta descriptions |

### [`career-seo.server.ts`](../src/modules/career/utils/career-seo.server.ts) (server only)

`fetchOpenJob(slug)`, `fetchOpenJobsForSitemap()`, `jobDescription(job)`, `jobPostingJsonLd(job, siteUrl)`. See [§15](#15-seo-metadata-json-ld--sitemap). Import these only from Server Components, route handlers or `sitemap.ts`.

[↑ Back to top](#table-of-contents)

---

## 22. Reusable Components

### Defined in this module (reusable)

| Component | File | Props | Notes |
|---|---|---|---|
| `JobTypeBadge` | [`CareerBadges.tsx`](../src/modules/career/components/CareerBadges.tsx) | `job: Pick<ICareer,"jobType">` | Green pill with briefcase icon |
| `WorkModeBadge` | same | `job: Pick<ICareer,"jobLocationType">` | Blue pill; renders nothing when no work mode |
| `DeadlineBadge` | same | `deadline`, `className?` | Grey / amber / red by `deadlineState` |
| `ResumeUploadField<T>` | [`ResumeUploadField.tsx`](../src/modules/career/public/career-details/ResumeUploadField.tsx) | `name`, `control`, `label?` | Generic RHF file field; reuse for any single-document upload |
| `CareerFormFields` | [`CareerFormFields.tsx`](../src/modules/career/admin/CareerFormFields.tsx) | `control`, `trigger`, `showStatus?` | Shared body of add/edit job |
| `JobCard`, `JobSkeleton`, `CareerDetailsSkeleton`, `ApplicationCardSkeleton` | public / admin folders | — | Skeletons are shaped like the real content to avoid layout shift |

The badges take `Pick<>` types on purpose, so they work with `ICareer`, `IAdminCareer`, or any object that has the field.

### Shared components used here

| Component | Path | Used in |
|---|---|---|
| `CustomTable<T>` | `components/data-display/table/` | Jobs list (search, pagination, page size) |
| `CustomModal2` | `components/primitives/modal/` | Add / Edit / Applicants dialogs |
| `ConfirmModal` | `components/primitives/modal/` | Delete job, delete application |
| `AddButton`, `CancelButton`, `SubmitButton` | `components/primitives/button/`, `components/form/` | Dialog headers/footers |
| `CustomTooltip` | `components/primitives/` | Edit/Delete action icons |
| `InputField`, `PhoneInputField`, `TextAreaField`, `DateInputField`, `SingleSelectSearch`, `TextEditor` | `components/form/` | All forms |
| `formStyles` (`fieldLabel`, `fieldError`, `requiredMark`) | `components/form/formStyles` | `ResumeUploadField`, so it looks like the other fields |
| `Hero`, `CustomBreadCrumb` | `components/layout/hero/`, `components/primitives/` | Public page headers |
| `Skeleton` | `components/ui/skeleton` (shadcn) | All skeletons |
| `LoadingPage` | `components/feedback/loading/` | `dynamic()` loading fallback |
| `ShareButtons` | `modules/blog/public/blog-details/` | Job page "Know someone…" ([TD-6](#26-known-issues--technical-debt)) |

[↑ Back to top](#table-of-contents)

---

## 23. Caching & Query Keys

| Query | Key | Invalidated / refreshed by |
|---|---|---|
| Admin jobs list | `["getAllJobs", page, limit, search, sortOrder]` | `useDelete("getAllJobs")` after delete; explicit `refetchCareer()` after create, update and application delete |
| Open jobs (careers page + navbar) | `["getAllActiveCurrentJobs"]` | Nothing explicit; refetched on mount/focus (default `staleTime: 0`) |
| Job by slug | `["getCareerDetails", slug]` | Nothing explicit |
| Applications of a job | `["getAllApplications", jobId, search]` | `useDelete("getAllApplications")` + explicit `refetchApplications()` |
| SEO fetches (server) | Next data cache, `revalidate: 300` | Time-based only: a new or closed job can take up to 5 minutes to change metadata, JSON-LD and the sitemap |

Root-key invalidation works because TanStack matches by **prefix**: invalidating `["getAllJobs"]` covers every page/search combination.

[↑ Back to top](#table-of-contents)

---

## 24. Error Handling

Network failures, 5xx (redirect to the error page), 403 (*"You do not have permission…"* toast) and expired sessions (refresh, else sign-out) are handled globally by [`axiosInstance`](../src/lib/axios/axiosInstance.ts). See the [Auth docs](./auth.md). Module-level handling:

| Situation | Server message (examples) | Status | Client behavior |
|---|---|---|---|
| Deadline in the past (create/edit) | `Deadline cannot be in the past` | 400 | Toast; the picker already blocks past dates |
| Position slug collides | `A job with this position already exists` | 400 | Toast only |
| Position has no letter/digit | `Job position must contain at least one letter or digit` | 400 | Normally caught first by zod |
| Edit an INACTIVE job without `status` | `This job is inactive. Send status ACTIVE with your changes to edit it.` | 400 | Prevented: `EditCareer` always sends `status` for inactive jobs |
| Job id unknown | `Job not found` | 404 | Toast |
| Job page for closed/inactive/unknown slug | `Job not found, or it is no longer accepting applications` | 404 | **No toast**; "This position is no longer open" screen |
| Apply to a closed job | `This job is no longer accepting applications` | 400 | Toast; form keeps values |
| Same email applies twice to one job | `You have already applied for this position with this email` | 400 | Toast; form keeps values ([TD-14](#26-known-issues--technical-debt)) |
| Resume missing / wrong type / too big | `Resume file is required`, … | 400 | Normally caught first by zod |
| Field validation (class-validator) | `["email must be an email", …]` | 400 | One toast per message (`usePost` / `useFormPost`) |
| Careers list fails | — | any | "We couldn't load the open positions" + Try again |

Server wording lives in [`job.service.ts`](../../natura-care-server/src/modules/job/job.service.ts) and [`application.service.ts`](../../natura-care-server/src/modules/application/application.service.ts).

[↑ Back to top](#table-of-contents)

---

## 25. Business Rules Summary

| # | Rule | Enforced in |
|---|---|---|
| BR-1 | Only `ADMIN` can create, edit or delete jobs and read or delete applications. | API (`RolesGuard`), middleware (`ADMIN_ONLY_ROUTES`), sidebar |
| BR-2 | A new job is always `ACTIVE`; there is no status field on create. | `CreateCareerSchema`, API |
| BR-3 | A job is public only while `ACTIVE` and its deadline day has not ended. | API (`active-current-jobs`, `:slug`, apply) |
| BR-4 | The deadline day itself is open until it ends. | API day-only comparison; JSON-LD `validThrough` 23:59:59Z |
| BR-5 | Deadlines cannot be set in the past. | `DateInputField` (disabled days), API |
| BR-6 | The slug is built from the position and must be unique; renaming changes it. | API |
| BR-7 | Responsibilities and requirements need visible text; other descriptions are optional. | zod `requiredRichText`, API `toRichText` |
| BR-8 | Blank salary is stored and shown as "Negotiable". | API, `salaryLabel` |
| BR-9 | Edits send only changed fields; no change closes the dialog without a request. | `EditCareer` |
| BR-10 | An inactive job can only be edited when `status` is sent with the change. | API; `EditCareer` adds it automatically |
| BR-11 | Deleting a job deletes all its applications and resume files, permanently. | API (`delete-job-with-applications`); warned in `ConfirmModal` |
| BR-12 | Applying needs no account. | API (no guard), middleware (public route) |
| BR-13 | One application per email per job. | API |
| BR-14 | Resume is required: PDF/DOC/DOCX, ≤ 2 MB. | zod, API `validateDocumentFile` |
| BR-15 | Phone must be a Bangladeshi mobile number. | `validatePhone`, API |
| BR-16 | Optional application fields left blank are stored as `null`. | `appendIfPresent`, API |
| BR-17 | The navbar shows "Career" only while at least one job is open. | `useHasOpenCareers` |
| BR-18 | Closed or unknown job pages are `noindex`. | `generateMetadata` |

[↑ Back to top](#table-of-contents)

---

## 26. Known Issues & Technical Debt

| # | Issue | Impact | Suggested fix |
|---|---|---|---|
| TD-1 | **A signed-in admin sees closed jobs on the storefront job page.** `usePublicCareerDetails` sends the admin's Bearer token, and `GET /job/:slug` returns jobs of any status to admins. An expired or inactive job then renders as a normal page with an application form that fails with *"no longer accepting applications"*. Guests are unaffected, and SSR metadata stays correct because it is fetched without a token. | Admin confusion while previewing | Treat the job as closed client-side when `status === "INACTIVE"` or `deadlineState() === "closed"`, and show an "Admin preview — not visible to candidates" banner instead of the form. |
| TD-2 | Sorting is wired (`onSortChange` → `sortOrder`) but every column sets `enableSorting: false`, so `sortOrder` is always `desc`. | Dead state | Remove it, or make a column sortable once the API supports `sortBy`. |
| TD-3 | Admin-written HTML is rendered with `dangerouslySetInnerHTML` and is **not sanitized** on the client or the server (`toRichText` only trims). | Stored XSS if an admin account is compromised | Sanitize on the server (e.g. `sanitize-html` allow-list) when saving; optionally `DOMPurify` on render. |
| TD-4 | `app/(admin)/career-admin/page.tsx` is a Client Component (to allow `ssr: false`), so it exports no `metadata`. It also carries a leftover `// This is the key!` comment. | Generic tab title on the admin page | Follow the category page: a Server Component with `metadata` and `dynamic()` without `ssr: false`. |
| TD-5 | `SITE_URL = "https://naturacarebd.com"` is hard-coded in the job page and in `sitemap.ts`. | Wrong URLs in staging/local JSON-LD | Read it from `config/env.config.ts` (e.g. `NEXT_PUBLIC_SITE_URL`). |
| TD-6 | Cross-module imports: `ShareButtons` from `modules/blog/...` and `toJsonLd` from `blog-seo.server`. | Hidden coupling; a blog refactor breaks careers | Move both to `components/` and `lib/seo/`. |
| TD-7 | Create, update and application delete refresh via an explicit `refetch` prop rather than query invalidation, and nothing invalidates `getAllActiveCurrentJobs` / `getCareerDetails` after admin changes. | Stale storefront data in the same browser session until refetch-on-mount/focus | Invalidate `CAREER_API.keys.ACTIVE_CURRENT` and `["getCareerDetails"]` in the mutation hooks' `onSuccess`. |
| TD-8 | `useUpdateCareer` logs `console.error("Update failed:")`. The shared `usePost` logs `"toast message =>"` on every create. | Console noise in production | Remove the logs. |
| TD-9 | `ApplicationCardSkeleton` has a two-column `lg` layout that the real `ApplicationCard` does not have. | Layout shift on load | Reshape the skeleton like `ApplicationCard` (avatar + grid + footer). |
| TD-10 | `AddCareer` casts `control`/`trigger` to `Control<UpdateCareerType>` with `as unknown as` to share `CareerFormFields`. | Type safety bypassed | Make `CareerFormFields` generic over `T extends CreateCareerType`. |
| TD-11 | The applicants list and the careers list fetch **everything** (no `page`/`limit`). | Slow modal for a job with hundreds of applicants | Add pagination or infinite scroll; the API already supports `page`/`limit`. |
| TD-12 | Careers-page filters and sort live in component state, not the URL. | Filtered views can't be shared or restored with Back | Sync with `useSearchParams` (`?type=FULL_TIME&mode=HYBRID&sort=closing`). |
| TD-13 | "Today" is the viewer's local day on the client and the server's day on the API. Near midnight they can disagree (e.g. "Closes today" shown for a job the server has already closed). | Rare edge case | Accept it, or compute "today" in a fixed zone (`Asia/Dhaka`) on both sides. |
| TD-14 | The duplicate-application error is only toasted; it is not attached to the email field. | Candidate may not notice why it failed | Map the message to `setError("email", …)` in `useApplyToJob`'s `onError`. |
| TD-15 | Form → API field mapping is written twice (inline in `AddCareer`, `API_FIELD` in `EditCareer`), and the application form maps `phone → phoneNumber`, `yearOfExperience → yearsOfExperience`. | Easy to forget one side when adding a field | One `toJobPayload()` mapper in `career.utils.ts`, or rename form fields to the API names. |

[↑ Back to top](#table-of-contents)

---

## 27. How-To Recipes

### Add a new job field (e.g. `experienceLevel`)

1. **Server first:** add it to `CreateJobDto`, the Prisma model and both response DTOs. Unknown fields are rejected with `property X should not exist`.
2. Add it to `ICareer` in `career.types.ts` (and a label map + options in `career.constants.ts` if it is an enum).
3. Add the rule to `baseJobSchema` and to `CreateCareerSchema`'s pick list.
4. Render it in `CareerFormFields`.
5. Map it: `AddCareer.onSubmit` body **and** `EditCareer`'s `API_FIELD` ([TD-15](#26-known-issues--technical-debt)). Add a default value in both forms.
6. Show it publicly: the `summary` array in `CareerDetails.JobView`, and optionally a badge in `CareerBadges` / `JobCard`.
7. If it matters to Google, add it to `jobPostingJsonLd`.

### Add a filter to the careers page

1. Add a state value in `public/career/Career.tsx` next to `jobType` / `workMode`.
2. Add a `countBy(jobs, …)` memo so only options with results are offered.
3. Extend the `visibleJobs` filter predicate and `isFiltered` / `clearFilters`.
4. Render it as a chip group or `<select>` using `chipClass` / `selectClass`.

### Add an admin table column

Append a `ColumnDef<IAdminCareer>` in `getCareerColumns` with `enableSorting: false` (the API can't sort by arbitrary fields). The field must exist in the **admin** DTO.

### Add another file upload field (e.g. cover letter)

Reuse `ResumeUploadField` with a different `name`/`label`. Add a zod refinement block like `resumeFile`'s, append the file in `CareerForm.onSubmit`, and register the field in the server's `FileFieldsInterceptor`.

### Paginate the applicants modal (fixes TD-11)

1. Add `page`/`limit` parameters to `useCareerApplications`, include them in the query key, and switch to `useGetAll` to receive `meta`.
2. Add a "Load more" button or pager in `AllApplications`; reset the page when `search` changes.
3. Use `meta.totalItems` for the header count instead of the `applicationCount` fallback.

### Fix the admin preview of closed jobs (TD-1)

```ts
// CareerDetails.tsx
const isOpen = career?.status !== "INACTIVE" && deadlineState(career.deadline) !== "closed";
// Render JobView with the form only when isOpen; otherwise show an admin-preview banner.
```

[↑ Back to top](#table-of-contents)

---

## 28. QA Checklist

**Admin**

- [ ] Guest opening `/career-admin` → redirected to `/login`; employee → `/dashboard`; customer → `/`.
- [ ] Add job with only required fields → appears as **Live**, salary "Negotiable", visible on `/career` and in the navbar.
- [ ] Add job with an empty Responsibilities editor → "Responsibilities are required".
- [ ] Add a second job with the same position → "A job with this position already exists".
- [ ] Edit without changes → "No changes to save", no request sent (check the Network tab).
- [ ] Edit position → slug changes; "View on site" opens the new URL.
- [ ] Set status Inactive → badge **Inactive**, gone from `/career`, banner shown when editing again.
- [ ] Edit an inactive job's salary only → saves (status is sent automatically).
- [ ] Clear work mode on edit → saved as no work mode (no badge).
- [ ] Job whose deadline passed → badge **Expired**, "View on site" hidden.
- [ ] Applicants modal: search by name, email and phone; empty-search message; resume opens in a new tab.
- [ ] Delete an application → count in the table drops.
- [ ] Delete a job with applications → dialog states the count; job and applicants gone.

**Storefront**

- [ ] No open jobs → navbar has no "Career" link; `/career` shows "No openings right now".
- [ ] Filters only offer types/modes that have jobs; counts are correct; "Clear filters" resets all.
- [ ] "Closing soonest" orders by deadline; a job ≤ 5 days out shows an amber badge.
- [ ] Job page: summary, share buttons, and the mobile apply bar hides when the form is visible.
- [ ] Closed/unknown slug → "This position is no longer open", no error toast, `<meta name="robots" content="noindex">`.
- [ ] Apply with a 3 MB PDF or a `.png` → schema error before upload.
- [ ] Apply with phone `1712345678` → phone error.
- [ ] Successful apply → receipt with an 8-character reference; the admin sees the application.
- [ ] Apply again with the same email → "You have already applied…" toast.
- [ ] View source of an open job → `JobPosting` JSON-LD present; `sitemap.xml` lists it.

[↑ Back to top](#table-of-contents)

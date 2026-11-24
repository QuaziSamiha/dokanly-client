# Google Analytics 4 (GA4) Integration — Natura Care
**Project:** Natura Care (Next.js Frontend + NestJS Backend)  
**Integration Type:** Google Analytics 4 Data API — Admin Dashboard Reporting  
**Last Updated:** 2026-06-03

---

## Table of Contents

1. [What is Google Analytics?](#1-what-is-google-analytics)
2. [Two Separate GA Integrations in This Project](#2-two-separate-ga-integrations-in-this-project)
3. [Core GA4 Concepts You Must Know](#3-core-ga4-concepts-you-must-know)
4. [Architecture & Data Flow](#4-architecture--data-flow)
5. [Google Cloud & Service Account Setup](#5-google-cloud--service-account-setup)
6. [Environment Variables](#6-environment-variables)
7. [File Structure — What Was Created & Modified](#7-file-structure--what-was-created--modified)
8. [Code Walkthrough — `ga-data.server.ts`](#8-code-walkthrough--ga-dataserverts)
9. [The Four GA4 Reports Explained](#9-the-four-ga4-reports-explained)
10. [Raw API Response → Clean Data (Parsing)](#10-raw-api-response--clean-data-parsing)
11. [API Route & Caching Strategy](#11-api-route--caching-strategy)
12. [Route Protection & Middleware](#12-route-protection--middleware)
13. [Testing GA Locally](#13-testing-ga-locally)
14. [Known Issue — Duplicate Measurement IDs](#14-known-issue--duplicate-measurement-ids)
15. [Security Rules](#15-security-rules)

---

## 1. What is Google Analytics?

Google Analytics (GA4) is Google's platform for tracking and reporting on website/app visitor behavior. It automatically collects data such as:

- How many people visited your site
- Where they came from (Google search, Facebook, direct link, etc.)
- Which cities they are browsing from
- How long they spent on the site
- Which pages they viewed
- Whether they left immediately (bounce rate)

Normally, you view this data by logging into [analytics.google.com](https://analytics.google.com). This project **fetches that same data programmatically** using Google's official API, so it can be displayed inside the Natura Care admin dashboard at `/analytics`.

---

## 2. Two Separate GA Integrations in This Project

This is the most important distinction to understand upfront. There are **two completely different GA integrations** in this codebase that do opposite things:

| Integration | Library | Direction | Purpose |
|---|---|---|---|
| `@next/third-parties/google` | Already existed | **Sends data TO Google** | Client-side tracking pixel — fires events like `page_view`, `session_start` when users browse the site |
| `@google-analytics/data` | Newly added | **Reads data FROM Google** | Server-side Data API — fetches processed analytics reports for the admin dashboard |

> **Analogy:** The first is like a security camera recording footage. The second is like a manager reviewing the recorded footage later. They are entirely separate systems.

---

## 3. Core GA4 Concepts You Must Know

Every GA4 report is built from exactly two types of data. Understanding this makes all the code logical.

### Dimensions — "The What" (Qualitative)
A dimension is a descriptive label or category used to **group or segment** your data. It is always a text value.

| Dimension Name | What it represents | Example values |
|---|---|---|
| `date` | The calendar date | `"20260603"` |
| `city` | City of the visitor | `"Dhaka"`, `"Chittagong"` |
| `sessionSource` | Where the visitor came from | `"google"`, `"facebook"`, `"(direct)"` |

### Metrics — "The How Many" (Quantitative)
A metric is a number that **measures** something. It is always numeric.

| Metric Name | What it measures |
|---|---|
| `activeUsers` | Users who had at least 1 active session |
| `newUsers` | First-time visitors (never visited before) |
| `sessions` | Total visits (one user can have multiple sessions) |
| `screenPageViews` | Total number of individual pages viewed |
| `bounceRate` | Fraction of visitors who left without interacting (returned as 0–1 decimal, e.g. `0.43`) |
| `averageSessionDuration` | Average time a user spent on the site (in seconds) |

### How They Work Together
> **Example:** "How many users visited from Dhaka last week?"  
> — **Dimension:** `city` = `"Dhaka"`  
> — **Metric:** `activeUsers` = `145`

Think of it like a spreadsheet: dimensions are the row labels, metrics are the columns of numbers.

---

## 4. Architecture & Data Flow

```
Admin Browser
     │
     ▼
/analytics page (Next.js client component)
     │  React Query hook fetches every 1 hour
     ▼
GET /api/analytics  (Next.js API Route — server-side only, 1-hour cache)
     │
     ▼
src/lib/analytics/ga-data.server.ts  (GA4 Data API client)
     │  Authenticates using service account credentials from .env
     ▼
Google Analytics Data API (GA4)
     │  Returns data for GA4 Property ID: 539974265
     ▼
Raw nested arrays → parsed into clean JSON
     ▼
JSON response → rendered in dashboard UI components
```

**Why is the API call server-side only?**  
The service account private key must never reach the browser. Keeping the fetch inside a Next.js API route means the key stays on the server and is never exposed to the client.

---

## 5. Google Cloud & Service Account Setup

To access GA4 data programmatically, you need a **Service Account** — a special "robot" Google account that your application uses to authenticate itself.

### Service Account Details

| Field | Value |
|---|---|
| Google Cloud Project | `natura-care-bd` |
| Project Number | `1092870875759` |
| Service Account Name | `ga4-api-reader-nautra` |
| Service Account Email | `ga4-api-reader-nautra@natura-care-bd.iam.gserviceaccount.com` |
| Key File (never commit this) | `natura-care-bd-511cea6e9487.json` |
| GA4 Property ID | `539974265` |
| GA4 Account ID | `396602526` |

### APIs Enabled in Google Cloud Console

Both of these APIs must be enabled in the Google Cloud Console for the project:

- **Google Analytics Data API** — required to **read** GA4 report data
- **Google Analytics Admin API** — required to grant the service account access to the GA4 property

### How to Grant GA4 Access to the Service Account

> ⚠️ **Important:** The GA4 web UI at `analytics.google.com` does **not** support adding service accounts via its "Add User" dialog. It only accepts regular Google accounts. You will see this error if you try:
>
> *"Unable to add users — This email doesn't match a Google Account"*

**The correct method** is to use the Google Analytics Admin API via **Google Cloud Shell**:

```bash
# Step 1 — Enable the Admin API (one-time setup)
gcloud services enable analyticsadmin.googleapis.com

# Step 2 — Grant Viewer access to the service account on the GA4 property
python3 -c "
import subprocess, json, urllib.request
token = subprocess.check_output(['gcloud','auth','print-access-token']).decode().strip()
url = 'https://analyticsadmin.googleapis.com/v1beta/properties/539974265/accessBindings'
body = json.dumps({
    'user': 'ga4-api-reader-nautra@natura-care-bd.iam.gserviceaccount.com',
    'roles': ['predefinedRoles/viewer']
}).encode()
req = urllib.request.Request(url, data=body, method='POST')
req.add_header('Authorization', 'Bearer ' + token)
req.add_header('Content-Type', 'application/json')
try:
    r = urllib.request.urlopen(req)
    print('SUCCESS:', r.read().decode())
except urllib.error.HTTPError as e:
    print('ERROR', e.code, ':', e.read().decode())
"
```

> **Note:** Run this from Google Cloud Shell at `console.cloud.google.com` while authenticated as the GA4 property admin account. If Cloud Shell shows a service account as the active user instead of your personal account, run `gcloud auth login` first to switch.

---

## 6. Environment Variables

Add the following to all three env files: `.env.development`, `.env.local`, and `.env.production`.

```env
# GA4 Property ID — found in GA4 Admin > Property Settings > Property ID
GA_PROPERTY_ID=539974265

# Service account email from the downloaded JSON key file
GOOGLE_CLIENT_EMAIL=ga4-api-reader-nautra@natura-care-bd.iam.gserviceaccount.com

# Private key from the downloaded JSON key file
# Keep the \n characters exactly as-is — do not convert them to real line breaks
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABCD...\n-----END PRIVATE KEY-----\n"
```

**Critical rules:**
- These variables have **no `NEXT_PUBLIC_` prefix** — they are server-side only and are never exposed to the browser
- Never commit `.env.*` files to git
- Never hardcode these values directly in source code

---

## 7. File Structure — What Was Created & Modified

### New Files Added

| File | Purpose |
|---|---|
| `src/lib/analytics/ga-data.server.ts` | Core GA4 Data API client — fetches summary, daily trends, traffic sources, and cities |
| `src/app/api/analytics/route.ts` | Next.js API route exposing `GET /api/analytics` with 1-hour server cache |
| `src/modules/analytics/types/analytics.types.ts` | TypeScript interfaces for all GA data shapes |
| `src/modules/analytics/hooks/useGAAnalytics.ts` | React Query hook that fetches `/api/analytics` from the client with 1-hour stale time |
| `src/app/(admin)/analytics/page.tsx` | Admin page route at `/analytics` |
| `src/modules/analytics/admin/AnalyticsPage.tsx` | Full-page analytics component |
| `src/modules/analytics/admin/GAStatCards.tsx` | 6 metric stat cards (users, sessions, bounce rate, etc.) |
| `src/modules/analytics/admin/GAUsersChart.tsx` | 28-day bar chart with Users / Sessions toggle |
| `src/modules/analytics/admin/GATrafficSourcesChart.tsx` | Horizontal bar chart showing traffic sources |
| `src/modules/analytics/admin/GACityTable.tsx` | Top 10 cities table with visual progress bars |

### Modified Files

| File | What Changed |
|---|---|
| `src/components/layout/sidebar/AdminSidebar.tsx` | Added "Analytics" nav link with GA icon |
| `src/middleware.ts` | Added `/analytics` to `ADMIN_ONLY_ROUTES` |
| `src/modules/dashboard/admin/Dashboard.tsx` | Removed `GAAnalyticsSection` (moved to dedicated `/analytics` page) |
| `.env.development` | Added the three GA environment variables |
| `.env.local` | Added the three GA environment variables |
| `.env.production` | Added the three GA environment variables |

---

## 8. Code Walkthrough — `ga-data.server.ts`

This is the most important file. Here is a complete line-by-line explanation.

### The Library

```typescript
import { BetaAnalyticsDataClient } from "@google-analytics/data";
```

`@google-analytics/data` is Google's official Node.js SDK. `BetaAnalyticsDataClient` is its main class — think of it as the "connection object" to the GA4 API. Without this library, you would have to write raw HTTP requests with authentication headers manually.

---

### Function 1: `getClient()` — Authenticate with Google

```typescript
function getClient() {
  const clientEmail = GOOGLE_CLIENT_EMAIL;
  const privateKey = GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const propertyId = GA_PROPERTY_ID;

  if (!clientEmail || !privateKey || !propertyId) {
    throw new Error(
      "Missing GA credentials: GA_PROPERTY_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY"
    );
  }

  const client = new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  });

  return { client, propertyId };
}
```

**Step by step:**

**`GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")`** — Why is this needed?  
When a multi-line RSA private key is stored in a `.env` file, it is flattened into a single line. Real line breaks become the two-character sequence `\n` (backslash + letter n). The `.replace()` call converts those literal text characters back into actual newline characters, which Google's SDK requires to parse the key correctly.

```
Before replace: "-----BEGIN PRIVATE KEY-----\nABCD\n-----END PRIVATE KEY-----"
After replace:  "-----BEGIN PRIVATE KEY-----
                 ABCD
                 -----END PRIVATE KEY-----"
```

**`if (!clientEmail || !privateKey || !propertyId)`** — Fail fast principle.  
If any credential is missing, throw an error immediately with a clear message rather than letting the application crash later with a confusing error deep in the SDK.

**`new BetaAnalyticsDataClient({ credentials: {...} })`** — This creates the authenticated agent. After this line, the `client` object can make API calls on behalf of your service account.

---

### Function 2: `fetchGAOverview()` — Fetch All Dashboard Data

This function runs four separate GA4 report queries simultaneously and returns a single clean object.

#### Parallel Requests with `Promise.all`

```typescript
const [overviewRes, dailyRes, sourcesRes, citiesRes] = await Promise.all([
  // Report 1: Summary totals
  // Report 2: Daily trend
  // Report 3: Traffic sources
  // Report 4: Cities
]);
```

`Promise.all` fires all four API calls **at the same time** and waits for all of them to finish. If you ran them one after another (sequentially), the total wait time would be the sum of all four. With `Promise.all`, the total wait time is only as long as the **slowest single request** — typically 3–4x faster.

---

## 9. The Four GA4 Reports Explained

Every report uses `client.runReport()`. The structure mirrors a database query:

```
SQL Equivalent:
SELECT metrics         ← metrics: [...]
GROUP BY dimensions    ← dimensions: [...]
WHERE date BETWEEN ... ← dateRanges: [...]
ORDER BY ...           ← orderBys: [...]
LIMIT N                ← limit: N
FROM ga4_property      ← property: `properties/${propertyId}`
```

### Report 1 — Summary Totals (for stat cards)

```typescript
client.runReport({
  property: `properties/${propertyId}`,
  dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
  metrics: [
    { name: "activeUsers" },           // Total active users
    { name: "newUsers" },              // First-time visitors
    { name: "sessions" },              // Total visits
    { name: "screenPageViews" },       // Total pages viewed
    { name: "bounceRate" },            // Fraction who left immediately (0–1)
    { name: "averageSessionDuration" } // Avg time in seconds
  ],
})
```

There are **no dimensions** here. That means no grouping — GA4 returns a single summary row aggregated across the entire 28-day period. This powers the stat cards at the top of the dashboard.

---

### Report 2 — Daily Trend (for the line/bar chart)

```typescript
client.runReport({
  property: `properties/${propertyId}`,
  dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
  dimensions: [{ name: "date" }],
  metrics: [{ name: "newUsers" }, { name: "sessions" }],
  orderBys: [{ dimension: { dimensionName: "date" } }],
})
```

`dimensions: [{ name: "date" }]` tells GA4 to split results **per day**, giving you 28 rows (one per day). `orderBys` sorts them chronologically from oldest to newest, which is required for the chart to draw correctly left-to-right.

---

### Report 3 — Traffic Sources (for the horizontal bar chart)

```typescript
client.runReport({
  property: `properties/${propertyId}`,
  dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
  dimensions: [{ name: "sessionSource" }],
  metrics: [{ name: "sessions" }],
  orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  limit: 8,
})
```

Groups results by where visitors came from (e.g. `google`, `facebook`, `(direct)`). `desc: true` ranks from highest traffic to lowest. `limit: 8` returns only the top 8 sources.

---

### Report 4 — Top Cities (for the cities table)

```typescript
client.runReport({
  property: `properties/${propertyId}`,
  dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
  dimensions: [{ name: "city" }],
  metrics: [{ name: "activeUsers" }],
  orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
  limit: 10,
})
```

Groups results by city name. Returns the top 10 cities ranked by number of active users.

---

## 10. Raw API Response → Clean Data (Parsing)

GA4 does not return labeled JSON. It returns deeply nested arrays of generic string values that look like this:

```json
{
  "rows": [
    {
      "dimensionValues": [{ "value": "20260606" }],
      "metricValues": [{ "value": "145" }, { "value": "210" }]
    }
  ]
}
```

There are no keys like `"city"` or `"sessions"` — just positional arrays. The order of values matches the order you listed dimensions and metrics in the query. The parsing code converts this structure into readable named objects.

### Defensive Access: `?.` and `?? 0`

```typescript
Number(row.metricValues?.[0]?.value ?? 0)
```

- `?.` (optional chaining) — "if this property exists, go deeper; if it is `null` or `undefined`, stop and return `undefined` instead of throwing a crash"
- `?? 0` (nullish coalescing) — "if the result is `null` or `undefined`, use `0` as the fallback"

Together, these ensure the code never crashes on missing or incomplete data from the API.

### Date Reformatting

GA4 returns dates as 8-character strings in `YYYYMMDD` format:

```typescript
const raw = row.dimensionValues?.[0]?.value ?? ""; // "20260606"

const label = raw.length === 8
  ? `${raw.slice(6, 8)}/${raw.slice(4, 6)}`   // "06/06"
  : raw;
```

`String.slice(start, end)` extracts a substring by character positions (zero-indexed). `raw.slice(6, 8)` = day, `raw.slice(4, 6)` = month. This produces a human-readable `DD/MM` format for the chart axis.

### Bounce Rate Conversion

```typescript
bounceRate: parseFloat(
  (Number(summary?.metricValues?.[4]?.value ?? 0) * 100).toFixed(1)
)
```

GA4 returns bounce rate as a decimal between 0 and 1 (e.g. `0.432`). The steps:
1. Multiply by `100` → `43.2`
2. `.toFixed(1)` locks it to 1 decimal place → `"43.2"` (now a string)
3. `parseFloat()` converts the string back to a number → `43.2`

### Session Duration Rounding

```typescript
avgSessionDuration: Math.round(Number(summary?.metricValues?.[5]?.value ?? 0))
```

GA4 returns duration as a raw decimal (e.g. `124.87263`). `Math.round()` converts it to a clean integer (`125` seconds).

### Final Clean Object Shape

After all parsing, the function returns:

```typescript
{
  summary: {
    activeUsers: 1250,          // e.g. 1,250 users
    newUsers: 800,              // e.g. 800 first-time visitors
    sessions: 2100,             // e.g. 2,100 visits total
    pageViews: 6300,            // e.g. 6,300 pages viewed
    bounceRate: 43.2,           // e.g. 43.2%
    avgSessionDuration: 125,    // e.g. 125 seconds
  },
  dailyData: [
    { label: "09/05", newUsers: 45, sessions: 60 },
    // ... 27 more days
  ],
  trafficSources: [
    { source: "google", sessions: 840 },
    { source: "(direct)", sessions: 320 },
    // ... up to 8 sources
  ],
  cities: [
    { city: "Dhaka", users: 420 },
    { city: "Chittagong", users: 180 },
    // ... up to 10 cities
  ],
}
```

This object is consumed directly by the React frontend components.

---

## 11. API Route & Caching Strategy

### Why a Separate API Route?

The service account credentials cannot go near the browser. The Next.js API route (`/api/analytics`) acts as a secure proxy — it runs on the server, calls `fetchGAOverview()`, and sends only the clean JSON result to the client.

### Caching Layers

GA4's Data API has a natural **24–48 hour reporting delay** — it does not return real-time data. Hourly caching is therefore more than sufficient.

| Layer | Duration | Mechanism |
|---|---|---|
| Next.js API Route (`/api/analytics`) | 1 hour | `export const revalidate = 3600` |
| React Query client cache | 1 hour | `staleTime: 60 * 60 * 1000` |

The server cache (`revalidate`) means Next.js will not re-call the GA4 API more than once per hour, even if many admin users load the dashboard. The React Query `staleTime` means the browser will not re-fetch from `/api/analytics` more than once per hour per user session.

---

## 12. Route Protection & Middleware

The `/analytics` page is restricted to the `ADMIN` role only.

| Route | Protection | Non-admin result |
|---|---|---|
| `/analytics` | Listed in `ADMIN_ONLY_ROUTES` in `src/middleware.ts` | Unauthenticated users → redirected to `/login`; Customer/other roles → redirected to `/` |

---

## 13. Testing GA Locally

There are two completely separate things you can test, and they require different methods.

### Thing 1: Tracking Pixel (Events Firing)
Tests that your site is **sending** data to Google Analytics correctly.

**Method A — GA4 Realtime Overview (simplest)**  
Go to **GA4 Console → Realtime overview**. If you are browsing the site on `localhost:3000`, you will appear as an active user within seconds.

> ✅ **Confirmed working 2026-06-03:** Realtime showed 1 active user in Dhaka with `first_visit`, `page_view`, and `session_start` events.

**Method B — DebugView (best for individual events)**  
Run this in the browser console while on any page of the site:
```javascript
gtag("config", "G-DXZFXQBDCD", { debug_mode: true });
```
Then open **GA4 Console → Admin → DebugView**. Your device appears within seconds and every event is listed individually in real time.

**Method C — Network tab (quick sanity check)**  
Open DevTools → Network tab → filter by `collect`. Requests to `www.google-analytics.com/g/collect` confirm the tag is firing. Check the `tid` query parameter to see which Measurement ID is being used.

---

### Thing 2: Admin Dashboard Data API
Tests that the `/analytics` page is **reading** data from GA4 correctly.

> ⚠️ **The admin dashboard shows zeros on the same day you set it up.** This is expected. The GA4 Data API reads processed historical data, not real-time data. It has a natural 24–48 hour processing delay. The dashboard will populate the following day.

| What | How to verify |
|---|---|
| Tracking (events firing) | Network tab, Realtime overview, DebugView — works immediately |
| Admin dashboard Data API | Wait 24–48 hours after setup — it reads processed historical data only |

---

## 14. Known Issue — Duplicate Measurement IDs

**Observed 2026-06-03:** The Network tab showed tracking requests going to `tid=G-JEVY2XHR4B`, but `.env.development` has `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-DXZFXQBDCD`.

**Root cause:** Two separate GA tags are firing on every page load simultaneously:
1. GTM (`GTM-WD6JPSJS`) has `G-JEVY2XHR4B` hardcoded inside the GTM container
2. The `<GoogleAnalytics>` component from `@next/third-parties/google` fires `G-DXZFXQBDCD` separately

This means every page view is being double-counted across two different GA4 properties (or the same property twice).

**To fix:**
1. Open Google Tag Manager → Tags → find the GA4 Configuration tag
2. Check which Measurement ID it uses
3. Decide on one canonical ID
4. Remove the other — either delete the GTM tag or remove the `<GoogleAnalytics>` component
5. Ensure only one GA4 tag fires per page

---

## 15. Security Rules

| Rule | Reason |
|---|---|
| Never commit the service account JSON key file (`natura-care-bd-511cea6e9487.json`) | Contains the private key — anyone with it can impersonate your service account |
| Never add `NEXT_PUBLIC_` prefix to GA env variables | Would expose them to the browser and every user who inspects the page source |
| All `.env.*` files must be in `.gitignore` | Prevents credentials from being pushed to git |
| All GA4 Data API calls stay inside Next.js server-side routes | Credentials never leave the server environment |
| The `GOOGLE_PRIVATE_KEY` `\n` handling is server-side only | The raw private key string is never serialized or logged |
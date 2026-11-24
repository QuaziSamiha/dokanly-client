# GTM & GA4 Analytics Setup Guide
**Project:** Natura Care Limited (naturacarebd.com)
**Prepared for:** Client
**Date:** June 2026

---

## Overview

This document describes the complete Google Tag Manager (GTM) and Google Analytics 4 (GA4) setup for the Natura Care website. It covers what has been configured, how to verify it is working, and how to read the data in GA4.

---

## What Is Configured

| Feature | Status | Details |
|---|---|---|
| Page View Tracking | Done | All page visits are tracked automatically |
| Button Click Tracking | Done | All button clicks captured with label, ID, and page |
| Default Consent (No Banner) | Done | Analytics fires for all users without a consent popup |
| Scroll Tracking | Auto | GA4 tracks 90% scroll depth by default |
| Form Interaction | Auto | GA4 tracks `form_start` and `form_submit` automatically |

---

## Part 1 — GTM Container Setup

**Container:** `GTM-WF8C962M`
**Domain:** `naturacarebd.com`

The GTM snippet is embedded in the website code. It loads all tracking tags automatically on every page.

---

## Part 2 — Page View Tracking

Page views are tracked automatically via the GA4 Configuration Tag inside GTM.

**What is captured per page view:**
- Page URL
- Page title
- Referrer source
- User's device and browser

**Where to see it in GA4:**
GA4 → Reports → Engagement → Pages and screens

---

## Part 3 — Button Click Tracking

### How It Works

GTM listens for clicks on any element matching these HTML types:

```
button, [role="button"], input[type="button"], input[type="submit"]
```

When a click is detected, a `button_click` event is sent to GA4 with the following parameters:

| Parameter | Description | Example |
|---|---|---|
| `button_text` | Visible label on the button | `"Add to Cart"` |
| `button_id` | HTML `id` attribute of the button | `"checkout-btn"` |
| `button_classes` | CSS classes on the button | `"btn btn-primary"` |
| `page_location` | Full URL where the click happened | `"https://naturacarebd.com/products"` |

### GTM Configuration (Already Done)

**Variables enabled (Built-in):**
- Click Element
- Click Classes
- Click ID
- Click Text
- Click Target
- Click URL

**Trigger created:**
- Name: `Trigger - Button Click`
- Type: All Elements (click)
- Fires on: Clicks matching CSS selector `button, [role="button"], input[type="button"], input[type="submit"]`

**Tag created:**
- Name: `GA4 - Button Click`
- Type: Google Analytics: GA4 Event
- Event Name: `button_click`
- Parameters: `button_text`, `button_id`, `button_classes`, `page_location`
- Trigger: `Trigger - Button Click`

---

## Part 4 — Consent Configuration (No Popup Required)

A Consent Initialization tag is configured in GTM that automatically grants all consent states for every user. This means:

- No cookie banner is shown to users
- GA4 and all tags fire immediately on page load
- No data is withheld or delayed

**Consent states set to `granted` by default:**
- `analytics_storage`
- `ad_storage`
- `ad_user_data`
- `ad_personalization`

> **Note:** This configuration is appropriate for Bangladesh-based audiences. If the website is ever targeted at users in the European Union (EU), consent mode must be revisited to comply with GDPR regulations.

---

## Part 5 — How to See Which Button Was Clicked

### Method A — GA4 DebugView (Real-Time, Recommended for Testing)

1. Open GTM → click **Preview** → enter `https://naturacarebd.com`
2. In a separate tab, open GA4 → **Admin** → **DebugView**
3. Click any button on the website
4. In DebugView, click on the `button_click` event to expand it
5. You will see `button_text`, `button_id`, and `button_classes` with their captured values

### Method B — GTM Preview Panel

1. Open GTM → click **Preview** → enter the site URL
2. A debug panel appears at the bottom of the browser
3. Click any button — the panel shows the tag firing and all parameter values in real time

### Method C — GA4 Events Report (After 24–48 Hours)

1. GA4 → Reports → Engagement → Events
2. Click on `button_click` in the list
3. Scroll down to see a breakdown of which buttons were clicked most

---

## Part 6 — Adding Custom Labels to Specific Buttons (Optional)

For buttons without visible text (e.g. icon-only buttons like WhatsApp, social links), the developer can add a `data-gtm` attribute to the HTML:

```html
<button data-gtm="whatsapp-cta">...</button>
<button data-gtm="add-to-cart">Add to Cart</button>
<button data-gtm="checkout-submit">Place Order</button>
```

GTM can then read this attribute and send it as a clean `button_name` parameter, giving a readable label even for icon buttons. Ask your developer to add these attributes to any button you want to track individually.

---

## Part 7 — GTM Publishing Workflow

Any future change to GTM (new tag, trigger, or variable) must go through this process:

1. Make changes in the **Default Workspace**
2. Click **Preview** to test on the live site before publishing
3. Verify the changes work correctly using DebugView or the GTM preview panel
4. Click **Submit** → add a version description → click **Publish**

> Only published versions go live. Workspace changes are invisible to the public until submitted.

---

## Part 8 — GA4 Property Details

| Property | Value |
|---|---|
| Property Name | Natura Care Ltd. |
| Account | ATI Limited |
| GTM Container ID | GTM-WF8C962M |

---

## Events Currently Tracked in GA4

| Event Name | Source | Description |
|---|---|---|
| `page_view` | GA4 Auto | Every page visit |
| `button_click` | GTM Tag | Every button click with label and location |
| `scroll` | GA4 Auto | When user scrolls 90% down a page |
| `session_start` | GA4 Auto | Start of a new user session |
| `first_visit` | GA4 Auto | First time a user visits the site |
| `user_engagement` | GA4 Auto | User is active on page for at least 1 second |
| `form_start` | GA4 Auto | User begins filling a form |

---

## Contact

For any questions about this setup, contact the development team.

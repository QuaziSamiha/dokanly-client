# Analytics Setup Guide — Natura Care Limited

**Website:** naturacarebd.com
**Date:** June 2026

---

## Tools Used

- **Google Tag Manager (GTM)** — manages all tracking tags in one place
- **Google Analytics 4 (GA4)** — tracks website visitors and behaviour
- **Meta Pixel** — connects website activity to Facebook/Instagram Ads

---

## Section 1 — Google Tag Manager

**GTM Container ID:** `GTM-WD6JPSJS`

### Step 1 — Install GTM on the Website -- Done By Developers

- The GTM snippet was added to the website code by the developer
- This loads all tracking automatically on every page

### Step 2 — Enable Click Variables

1. Go to **Variables → Configure** (Built-in Variables)
2. Enable: 
  - `Click Element`
  - `Click Classes`
  - `Click ID`
  - `Click Text`
  - `Click Target`
  - `Click URL`

### Step 3 — Create Consent Tag (No Cookie Banner)

1. **Tags → New**
2. Type: **Custom HTML**
3. Paste this code:

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  });
</script>
```

4. Trigger: **Consent Initialization - All Pages**
5. Name: `Consent - Default Granted` → Save

### Step 4 — Create GA4 Base Tag

1. **Tags → New**
2. Type: **Google Tag**
3. Enter your GA4 Measurement ID
4. Trigger: **All Pages**
5. Name: `GA4 - Base Tag` → Save

### Step 5 — Create Button Click Trigger

1. **Triggers → New**
2. Type: **All Elements**
3. Fire on: **Some Clicks**
4. Condition: `Click Element` → `matches CSS selector` → `button, [role="button"], input[type="button"], input[type="submit"]`
5. Name: `Trigger - Button Click` → Save

### Step 6 — Create GA4 Button Click Tag

1. **Tags → New**
2. Type: **Google Analytics: GA4 Event**
3. Event Name: `button_click`
4. Parameters:
   - `button_text` → `{{Click Text}}`
   - `button_id` → `{{Click ID}}`
   - `button_classes` → `{{Click Classes}}`
   - `page_location` → `{{Page URL}}`
5. Trigger: `Trigger - Button Click`
6. Name: `GA4 - Button Click` → Save

---

## Section 2 — Meta Pixel

**Pixel ID:** `2510190342726231`

### Step 1 — Install Meta Pixel Template

1. **Templates → Search Gallery**
2. Search **Meta Pixel** → Add to workspace

### Step 2 — Create DataLayer Variables

Go to **Variables → New** and create each one as **Data Layer Variable, Version 2**:

| Variable Name         | Data Layer Variable Name |
| --------------------- | ------------------------ |
| `DL - item_id`        | `item_id`                |
| `DL - item_name`      | `item_name`              |
| `DL - value`          | `value`                  |
| `DL - currency`       | `currency`               |
| `DL - quantity`       | `quantity`               |
| `DL - transaction_id` | `transaction_id`         |

### Step 3 — Create Custom Event Triggers

Go to **Triggers → New** for each, Type: **Custom Event**, Fire on: **All Custom Events**:

| Trigger Name                | Event Name         |
| --------------------------- | ------------------ |
| `Event - Add to Cart`       | `add_to_cart`      |
| `Event - Remove from Cart`  | `remove_from_cart` |
| `Event - Purchase`          | `purchase`         |
| `Event - View Item`         | `view_item`        |
| `Event - Initiate Checkout` | `begin_checkout`   |

### Step 4 — Create Meta Pixel Base PageView Tag

1. **Tags → New**
2. Type: **Meta Pixel**
3. Pixel ID: `2510190342726231`
4. Event: `PageView`
5. Check: **Use GA4 dataLayer Integration**
6. Trigger: **All Pages**
7. Name: `Base PageView` → Save

### Step 5 — Create Meta Pixel Event Tags

Create one tag for each event below. All use:

- Type: **Meta Pixel**
- Pixel ID: `2510190342726231`
- Check: **Use GA4 dataLayer Integration**

| Tag Name           | Event                     | Trigger                   |
| ------------------ | ------------------------- | ------------------------- |
| `ViewContent`      | `ViewContent`             | Event - View Item         |
| `AddToCart`        | `AddToCart`               | Event - Add to Cart       |
| `InitiateCheckout` | `InitiateCheckout`        | Event - Initiate Checkout |
| `Purchase`         | `Purchase`                | Event - Purchase          |
| `RemoveFromCart`   | `RemoveFromCart` (Custom) | Event - Remove from Cart  |

---

## Section 3 — Publish

### Step 1 — Test Before Publishing

1. GTM → click **Preview** → enter `https://naturacarebd.com`
2. Browse the site and perform actions (add to cart, go to checkout, place order)
3. Confirm tags fire in the GTM preview panel at the bottom of the browser

### Step 2 — Publish

1. Click **Submit**
2. Add a version description (e.g. `GA4 + Meta Pixel setup`)
3. Click **Publish**

---

## Section 4 — Verify in GA4

1. Go to [analytics.google.com](https://analytics.google.com)
2. **Admin → DebugView**
3. With GTM Preview active, browse your site
4. Confirm these events appear: `page_view`, `button_click`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`

---

## Section 5 — Verify in Meta Events Manager

1. Go to **Events Manager → Datasets → Nautra Care BD**
2. Click **Test Events** tab
3. Enter `https://naturacarebd.com` → click **Open Website**
4. Browse and perform actions on the site
5. Confirm these events appear: `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`

---

## Final Tag List

| Tag                       | Type        | Trigger                   |
| ------------------------- | ----------- | ------------------------- |
| Consent - Default Granted | Custom HTML | All Pages                 |
| GA4 - Base Tag            | Google Tag  | All Pages                 |
| GA4 - Button Click        | GA4 Event   | Trigger - Button Click    |
| Base PageView             | Meta Pixel  | All Pages                 |
| ViewContent               | Meta Pixel  | Event - View Item         |
| AddToCart                 | Meta Pixel  | Event - Add to Cart       |
| InitiateCheckout          | Meta Pixel  | Event - Initiate Checkout |
| Purchase                  | Meta Pixel  | Event - Purchase          |
| RemoveFromCart            | Meta Pixel  | Event - Remove from Cart  |

---

## Section 6 — Testing Guide

> Complete this section after publishing GTM. Use two browser tabs side by side throughout.

---

### Before You Start

**Open GTM Preview:**
1. Go to [tagmanager.google.com](https://tagmanager.google.com)
2. Select your container → click **Preview** (top right)
3. Enter `https://naturacarebd.com` → click **Connect**
4. Your website opens in a new tab with a GTM debug bar at the bottom
5. Keep this tab open for all tests below

---

### Test A — GA4 Page View

**Open GA4 DebugView:**
1. Go to [analytics.google.com](https://analytics.google.com)
2. Click **Admin** (bottom left gear icon)
3. Click **DebugView**
4. Keep this tab open

**Test steps:**
1. In your website tab, visit the **Home page**
2. In DebugView, within a few seconds you should see `page_view` appear
3. Click on `page_view` → confirm `page_location` shows the correct URL
4. Now visit the **Products page** → another `page_view` should appear
5. Visit the **About page** → another `page_view` should appear

**What success looks like:**
- Every page you visit fires one `page_view` event in DebugView
- The `page_location` parameter matches the URL you visited

---

### Test B — GA4 Button Clicks

**Test steps (continue in the same browser session):**
1. On any page, click any visible button (e.g. "Shop Now", "Add to Cart", "View Details")
2. In GA4 DebugView, `button_click` should appear within seconds
3. Click on `button_click` to expand it and check:
   - `button_text` — shows the label on the button you clicked
   - `page_location` — shows the page where the click happened

**Buttons to test:**
| Button to Click | Expected `button_text` |
|---|---|
| Any "Shop Now" or hero CTA | `Shop Now` or similar |
| "Add to Cart" on product page | `Add to Cart` |
| "Order Now" on checkout page | `Order Now` |

**What success looks like:**
- Every button click fires `button_click` in DebugView
- `button_text` correctly shows what the button says

---

### Test C — GA4 Ecommerce Events

**Test steps:**
1. Go to any **Product page**
   - DebugView should show `view_item`
   - Click on it → confirm `item_name` and `value` are populated

2. Click **Add to Cart**
   - DebugView should show `add_to_cart`
   - Confirm `item_name`, `value`, `currency: BDT` are correct

3. Go to the **Checkout page** (`/check-out`)
   - DebugView should show `begin_checkout`
   - Confirm `value` matches the cart total

4. Complete a **test order** (use a fake name/address, Cash on Delivery)
   - DebugView should show `purchase`
   - Confirm `transaction_id`, `value`, and `items` are populated

**What success looks like:**

| Action | Event in DebugView |
|---|---|
| Visited product page | `view_item` |
| Clicked Add to Cart | `add_to_cart` |
| Opened checkout page | `begin_checkout` |
| Placed order | `purchase` |

---

### Test D — Meta Pixel Page View & Events

**Open Meta Test Events:**
1. Go to [business.facebook.com](https://business.facebook.com)
2. Click the grid menu → **Events Manager**
3. Select **Nautra Care BD** dataset
4. Click the **Test Events** tab
5. Under **"Test browser events"**, enter `https://naturacarebd.com`
6. Click **Open Website** — your site opens in a new tab
7. Keep the Test Events tab open

**Test steps:**
1. On your website, visit any page
   - Test Events tab should show `PageView`

2. Visit a **Product page**
   - Test Events tab should show `PageView` + `ViewContent`

3. Click **Add to Cart**
   - Test Events tab should show `AddToCart`

4. Go to **Checkout page**
   - Test Events tab should show `InitiateCheckout`

5. Complete a **test order**
   - Test Events tab should show `Purchase`
   - Click on `Purchase` → confirm `value` and `currency` are correct

**What success looks like:**

| Action | Event in Meta Test Events |
|---|---|
| Any page visited | `PageView` |
| Product page viewed | `ViewContent` |
| Add to Cart clicked | `AddToCart` |
| Checkout page opened | `InitiateCheckout` |
| Order completed | `Purchase` |

---

### Test E — Remove From Cart

1. Add any product to cart
2. Go to the **Cart page**
3. Remove the item
4. In GA4 DebugView → confirm `remove_from_cart` appears
5. In Meta Test Events → confirm `RemoveFromCart` appears

---

### Testing Checklist

Use this to confirm everything is working before handing over to the client:

- [ ] `page_view` fires on every page in GA4 DebugView
- [ ] `button_click` fires on every button click in GA4 DebugView
- [ ] `view_item` fires on product page in GA4 DebugView
- [ ] `add_to_cart` fires when adding to cart in GA4 DebugView
- [ ] `begin_checkout` fires on checkout page in GA4 DebugView
- [ ] `purchase` fires after order completion in GA4 DebugView
- [ ] `PageView` fires on every page in Meta Test Events
- [ ] `ViewContent` fires on product page in Meta Test Events
- [ ] `AddToCart` fires when adding to cart in Meta Test Events
- [ ] `InitiateCheckout` fires on checkout page in Meta Test Events
- [ ] `Purchase` fires after order completion in Meta Test Events

> All boxes must be checked before going live with ad campaigns.

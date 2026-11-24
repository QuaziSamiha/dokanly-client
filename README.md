## Compile and run the project

```bash
# development
$ yarn dev

# production mode
$ yarn build
$ yarn start

# production build against the LOCAL API (e.g. to demo to the client)
$ yarn development         # build:development + start:development
$ yarn build:development   # build only
$ yarn start:development   # start the last build:development output
```

`yarn build` bakes `NEXT_PUBLIC_API_BASE_URL` from `.env.production` (the live API) into the bundle, so `yarn start` can't be pointed at a local database. The `development` commands make a separate production build using `.env.development` (`http://localhost:5001/n-care/api/v1`) into `.next-development`, leaving the real build in `.next` untouched. Start the local backend first; it serves on `http://localhost:3000`.

- [Google Analytics (GA)](./claude-docs/google-analytics-integration.md)
- [Google Tag Manager (GTM)](./claude-docs/google-analytics-integration.md)

## Module documentation

- [Home module: admin home content (top title, hero slider, OVC, product articles, platform redirect), storefront home page, promotion bar](./docs/home.md)
- [Auth module: login, signup + OTP, social sign-in, password reset, session](./docs/auth.md)
- [Third-party login: Google & Facebook via NextAuth, token exchange, account linking, OAuth app setup](./docs/third-party-login.md)
- [User module: admin users, profile, customer account](./docs/user.md)
- [Product module: admin catalogue (simple / variable / combo), shop, product details, cart hand-off](./docs/product.md)
- [Cart module: local cart, price & stock re-check, /my-cart page, free-delivery progress, checkout hand-off](./docs/cart.md)
- [Free Delivery module: admin free delivery settings (add, activate / deactivate, change history, delete), promotion bar & product page offer, add-to-cart nudge, cart progress bar, checkout waiver, free delivery on orders & invoices](./docs/free-delivery.md)
- [Order module: placing an order, admin order list (stats, filters, confirm / cancel, edit, Steadfast courier, invoices, CSV export, live updates), customer My Orders (tracking, cancel, buy again)](./docs/order.md)
- [Delivery Pricing module: admin zone pricing (charge & delivery time per zone), division → zone at checkout, delivery charge in totals, charge snapshot on orders](./docs/delivery-pricing.md)
- [Inventory module: warehouses, suppliers, stock per warehouse, ledger & reversals, purchase orders (receive with batches), transfers, counts / write-offs, expiring batches, valuation & consistency reports](./docs/inventory.md)
- [Category module: admin category management, category pickers, storefront filters](./docs/category.md)
- [Promotion module: admin coupon codes (add, edit, view, archive), promotion bar, Coupons & Offers page, checkout coupon box, coupon on orders & invoices](./docs/promotion.md)
- [Blog module: admin posts / types / comment moderation, storefront listing & post page, comments, SEO & sitemap](./docs/blog.md)
- [Career module: admin job openings + applicants, careers page, job details + application form, job SEO](./docs/career.md)
- [Contact Us module: contact page + message form, admin messages inbox (reply status, WhatsApp/call, internal notes)](./docs/contact-us.md)
- [Support module: store policy pages (terms, shipping, returns, privacy), admin policy editor (health checks, preview, publish), headings & table of contents](./docs/support.md)
- [Meta Pixel: GTM-delivered Pixel, storefront event catalogue (ViewContent → Purchase), role-based tracking, catalog feed & content IDs, consent, legacy direct Pixel & rollback, known issues](./docs/meta-pixel.md)

## Docker

The image is `natura-care-client`, served on port `3000`. Run these from this folder (`natura-care-frontend`).

> **`NEXT_PUBLIC_*` values are baked in at build time.** They are passed as `--build-arg`, not read from `.env.production` (all `.env*` files are excluded from the image). Changing any of them — or any frontend code — means **rebuilding the image**; a restart is not enough. The values below match `natura-care-backend/deploy/.env`; keep the two in sync.

### After every code change — rebuild the image

PowerShell (Windows):

```powershell
docker build -t natura-care-client:latest `
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.naturacarebd.com/n-care/api/v1 `
  --build-arg NEXT_PUBLIC_GTM_ID=GTM-WD6JPSJS `
  --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YWM9R0TRYW `
  --build-arg NEXT_PUBLIC_FACEBOOK_PIXEL_ID=2510190342726231 `
  .
```

Bash (Linux / macOS / Git Bash):

```bash
docker build -t natura-care-client:latest \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.naturacarebd.com/n-care/api/v1 \
  --build-arg NEXT_PUBLIC_GTM_ID=GTM-WD6JPSJS \
  --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YWM9R0TRYW \
  --build-arg NEXT_PUBLIC_FACEBOOK_PIXEL_ID=2510190342726231 \
  .
```

### Run it

Normally the client runs together with the API through the backend's compose file (it sets `INTERNAL_API_BASE_URL` so server-side rendering reaches the API directly):

```bash
cd ../natura-care-backend/deploy
docker compose up -d --no-build client
docker compose logs -f client
```

Standalone, without compose (runtime secrets come from the backend's `deploy/env/client.prod.env`):

```bash
docker rm -f natura-care-client
docker run -d --name natura-care-client --restart unless-stopped \
  --env-file ../natura-care-backend/deploy/env/client.prod.env \
  -p 3000:3000 natura-care-client:latest
```

Check it at `http://localhost:3000`.

### Versioned build → `.tar` file (ship to a server without a registry)

Pick a new version each release (e.g. `1.0.1`).

**1. Build and export (your machine)**

PowerShell (Windows):

```powershell
$VERSION = "1.0.1"
docker build -t natura-care-client:$VERSION -t natura-care-client:latest `
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.naturacarebd.com/n-care/api/v1 `
  --build-arg NEXT_PUBLIC_GTM_ID=GTM-WD6JPSJS `
  --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YWM9R0TRYW `
  --build-arg NEXT_PUBLIC_FACEBOOK_PIXEL_ID=2510190342726231 `
  .
docker save -o natura-care-client-$VERSION.tar natura-care-client:$VERSION
```

Bash:

```bash
VERSION=1.0.1
docker build -t natura-care-client:$VERSION -t natura-care-client:latest \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.naturacarebd.com/n-care/api/v1 \
  --build-arg NEXT_PUBLIC_GTM_ID=GTM-WD6JPSJS \
  --build-arg NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YWM9R0TRYW \
  --build-arg NEXT_PUBLIC_FACEBOOK_PIXEL_ID=2510190342726231 \
  .
docker save natura-care-client:$VERSION | gzip > natura-care-client-$VERSION.tar.gz
```

Already built `latest` and just want a versioned file? Tag it instead of rebuilding:

```bash
docker tag natura-care-client:latest natura-care-client:1.0.1
docker save -o natura-care-client-1.0.1.tar natura-care-client:1.0.1
```

**2. Copy it to the server**

```bash
scp natura-care-client-1.0.1.tar user@SERVER_IP:/path/to/natura-care-backend/deploy/
```

**3. Load and run (on the server)**

```bash
cd /path/to/natura-care-backend/deploy
docker load -i natura-care-client-1.0.1.tar          # .tar.gz works too
IMAGE_TAG=1.0.1 docker compose up -d --no-build client
docker compose logs -f client
```

> `IMAGE_TAG` is shared by `server` and `client` in the compose file. If the two are on different versions, pass the right tag per command as above rather than setting it in `deploy/.env`.

**Roll back** — start the previous tag, which is still loaded:

```bash
IMAGE_TAG=1.0.0 docker compose up -d --no-build client
```

> Don't commit the `.tar` files — delete them once loaded. `docker images natura-care-client` lists the versions you have.

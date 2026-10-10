# Partsyaar.com

**Genuine Parts. Locked In. Delivered Fast.** — an online car-parts store for Pakistan, built with
Next.js 15, Payload CMS 3 (admin panel + backend) and PostgreSQL.

The owner runs the whole store from the admin panel at `/admin`: products, prices, stock,
categories, banners, phone/WhatsApp numbers, pages and orders. No code changes needed.

> Build status: **Phases 0–5** (setup, admin, storefront, checkout & orders, motion & 3D, admin power tools) are complete. See [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md)
> for the full plan and the phases still to come.

## Run it locally

Requirements: Node 20.18+ (22 recommended), pnpm 9 (`corepack enable`), and either Docker or a
local PostgreSQL 16.

```bash
cp .env.example .env              # then set PAYLOAD_SECRET to a long random string
docker compose up -d postgres     # skip if you already run Postgres on :5432
pnpm install
pnpm seed                         # demo catalogue, settings, pages + the owner login from .env
pnpm dev                          # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

`pnpm seed` creates the owner account from `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` and loads
18 car makes (86 model generations), 70 categories, 13 part brands, 44 products, pages, banners,
reviews, blog posts and demo orders. `pnpm seed --reset` wipes the demo data and starts again.
Without a seed, the first visit to `/admin` asks you to create the first user — that user is the owner.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` · `pnpm typecheck` | ESLint · TypeScript (strict) |
| `pnpm test:int` | Vitest: unit tests + Payload integration tests (needs the database) |
| `pnpm test:e2e` | Playwright (starts `pnpm dev` if it isn't running) |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` after changing collections |
| `pnpm generate:importmap` | Regenerate the admin import map after adding admin components |

## Deploy (Vercel + Neon + Cloudflare R2)

1. **Database** — create a Neon project; copy its connection string into `DATABASE_URL`.
2. **Media** — create an R2 bucket and an API token; set `S3_BUCKET`, `S3_ENDPOINT`
   (`https://<account-id>.r2.cloudflarestorage.com`), `S3_REGION=auto`, `S3_ACCESS_KEY_ID`,
   `S3_SECRET_ACCESS_KEY`. Uploads go to R2 automatically once `S3_BUCKET` is set.
3. **App** — import the GitHub repo in Vercel, add every variable from `.env.example`
   (`PAYLOAD_SECRET` must be a long random string; `NEXT_PUBLIC_SERVER_URL` = your domain), deploy.
4. Open `https://<your-domain>/admin` and create the owner account.

## For the owner

- **Log in:** go to `yourdomain.pk/admin` and sign in with your email and password.
- The dashboard opens with big shortcuts: **Orders, Add a product, Change prices & stock,
  Phone & WhatsApp, Homepage, Banners, Pages, Delivery**.
- **Change a price:** Products → search the name, SKU or OEM number → open it → *Price (Rs)* →
  **Publish changes**.
- **Change the WhatsApp / phone number:** Settings → Site Settings → *Contact* tab → Save.
  It updates on every page.
- **Edit About Us / policies:** Content → Pages → open the page → edit the sections → Publish.
- **Add a homepage banner:** Marketing → Banners → Create new → pick *Homepage — promo* →
  upload the picture → Save. Optional start/end dates schedule it.
- **Mark an order delivered:** Orders → open the order → *Status* (right side) → Delivered → Save.
  The customer's tracking timeline updates automatically.
- **Hide a section of the homepage:** Content → Homepage → untick *Show this section*, or drag
  sections to reorder → Publish.

### Power tools (left menu → Tools)

- **Dashboard:** today's orders and revenue, 7/30-day totals, orders waiting to ship, low stock,
  new part requests (one-tap WhatsApp), top sellers, and big shortcuts.
- **Bulk price update:** filter by category / brand / car make / name → increase or decrease by
  % or Rs (or set a price), round to Rs 5/10/50 → **Preview** → **Apply**. Optional: keep the
  current price as the "old price" so the site shows a sale.
- **Excel import / export:** download all products as CSV, edit in Excel, upload. "Check file"
  shows errors per row before anything is saved; rows are matched by SKU and empty cells are left
  unchanged.
- **Duplicate a product:** open it → ⋮ menu → Duplicate (gets a new SKU, saved as a draft).
- **Live preview:** while editing a product, page, blog post or the homepage, click *Live
  Preview* to see the real page update (phone / tablet / desktop sizes). Drafts stay private.
- **Orders:** the right sidebar has *WhatsApp status to customer*, *Invoice (PDF)* (with your
  logo and NTN from Site Settings) and *Packing slip (PDF)*.

### Orders, payments and emails

- Shoppers check out as guests or with an account (phone-first, Pakistani numbers validated).
  Cash on Delivery and Bank Transfer are on by default (Settings → Payment Settings).
- Every order gets a number like **PY-100245**. Stock is reduced the moment an order is placed
  and put back automatically if you mark the order **Cancelled** or **Returned**.
- Changing an order's **Status** emails the customer and updates their tracking page
  (`/track`). Delivered orders credit **Yaar Points** to logged-in customers.
- New-order alerts go to *Site Settings → Contact → Send new-order emails to* (or the support
  emails). Emails need `RESEND_API_KEY` (free at resend.com); without it they are only logged.
- Coupons (Marketing → Coupons): % off with a cap, fixed Rs off, or free delivery; minimum order,
  dates, usage limit and "first order only" (checked by phone number).

### Staff roles

| Role | Can do |
| --- | --- |
| Owner | Everything, including payment keys and adding/removing staff |
| Manager | Prices, cost prices, coupons, catalogue, orders, content, settings |
| Staff | Stock, orders, part requests, reviews, content — cannot change prices or see cost prices |

Every change to a price, stock level or order status is recorded in **Settings → Audit log**.

## Project layout

```
src/app/(frontend)/   storefront (Next.js App Router)
src/app/(payload)/    Payload admin + REST/GraphQL API (generated — don't edit)
src/collections/      Payload collections: products, orders, customers, makes/models, …
src/globals/          one-place settings: site, delivery, payments, homepage, menus, SEO, …
src/blocks/           page-builder sections (homepage + pages)
src/access/           roles: owner / manager / staff / customer
src/seed/             demo data + placeholder artwork (`pnpm seed`)
src/components/       ui/ (shadcn-style primitives), brand/ (logo)
src/lib/              utils (cn, formatPrice, slugify), fonts
tests/unit, tests/int Vitest     tests/e2e  Playwright
docs/BUILD_PLAN.md    the full product brief and phase plan
```

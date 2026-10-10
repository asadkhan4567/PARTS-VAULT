# Partsyaar.com

**Genuine Parts. Locked In. Delivered Fast.** — an online car-parts store for Pakistan, built with
Next.js 15, Payload CMS 3 (admin panel + backend) and PostgreSQL.

The owner runs the whole store from the admin panel at `/admin`: products, prices, stock,
categories, banners, phone/WhatsApp numbers, pages and orders. No code changes needed.

> Build status: **Phase 0 — setup** is complete. See [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md)
> for the full plan and the phases still to come.

## Run it locally

Requirements: Node 20.18+ (22 recommended), pnpm 9 (`corepack enable`), and either Docker or a
local PostgreSQL 16.

```bash
cp .env.example .env              # then set PAYLOAD_SECRET to a long random string
docker compose up -d postgres     # skip if you already run Postgres on :5432
pnpm install
pnpm dev                          # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

The first visit to `/admin` asks you to create the first user — that user is the owner.

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
- Changing prices, the WhatsApp number, pages and orders is covered step by step here as each
  phase lands (Phase 1 adds products, settings and pages to the admin panel).

## Project layout

```
src/app/(frontend)/   storefront (Next.js App Router)
src/app/(payload)/    Payload admin + REST/GraphQL API (generated — don't edit)
src/collections/      Payload collections (data model)
src/components/       ui/ (shadcn-style primitives), brand/ (logo)
src/lib/              utils (cn, formatPrice, slugify), fonts
tests/unit, tests/int Vitest     tests/e2e  Playwright
docs/BUILD_PLAN.md    the full product brief and phase plan
```

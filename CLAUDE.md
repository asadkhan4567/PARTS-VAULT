# Partsyaar.com — guide for Claude sessions

Online car-parts store for Pakistan. The full brief (scope, design, phases) is
`docs/BUILD_PLAN.md` — read it before starting a phase. This file holds conventions.

## Stack

Next.js 15.4 (App Router, TS strict) · Payload CMS 3.90 inside the same app (admin at `/admin`,
REST at `/api`) · PostgreSQL via `@payloadcms/db-postgres` · Tailwind v4 (tokens in
`src/app/(frontend)/globals.css`, no tailwind.config) + shadcn-style components · media to
S3/R2 when `S3_BUCKET` is set · Vitest + Playwright · pnpm.

Next is pinned to 15.4.x on purpose: the brief fixes Next 15, and `@payloadcms/next@3.90` only
accepts `>=15.4.11 <15.5` in the 15 line. Bump Next and every `@payloadcms/*` package together.

## Commands

```bash
pnpm dev | build | lint | typecheck
pnpm test:int        # vitest (unit + Payload integration; needs DATABASE_URL)
pnpm test:e2e        # playwright; in the cloud sandbox: PW_CHROMIUM_PATH=/opt/pw-browsers/chromium
pnpm generate:types  # after any collection/global change — commit src/payload-types.ts
pnpm generate:importmap  # after adding admin components
```

## Rules

- **Phases:** one phase per PR; finish with lint + typecheck + tests green, then summarise.
- **Owner edits everything:** any text, number, link or image a shopper sees comes from a Payload
  collection/global, never hard-coded (the Phase 0 home page is the one placeholder).
- **Brand tokens only:** use `navy-*`, `red-600/700`, `steel-400`, `success`, `warning`,
  `font-heading`, `font-mono`, `rounded-brand`, `shadow-navy`, `glass`. Tailwind v4 syntax:
  `rounded-brand`, not `rounded-[--radius-brand]`.
- **No Stripe.** Payments go through a swappable adapter (COD, bank transfer, JazzCash, Easypaisa,
  Safepay/PayFast).
- **Cost price never reaches the client** — field-level access on `costPrice` (managers only)
  and `workshopPrice` (staff + workshop customers). Storefront reads must go through the Local
  API with `overrideAccess: false` (plus the customer as `user` when logged in) so field access
  applies; never render a doc fetched with `overrideAccess: true`.
- **Roles** (`src/access`): owner > manager > staff in `users`; shoppers are `customers` and can
  never open /admin. Price fields are manager-only; staff can change stock.
- **Audit:** price/stock/order-status changes are logged via `hooks/audit.auditFields`; pass
  `context: { skipAudit: true }` only for seed/system writes.
- **Seed:** `pnpm seed [--reset]`; keep `src/seed/data/*` in sync when fields change.
- **Migrations:** dev uses schema push; production runs `src/migrations` on deploy
  (`pnpm build:deploy`). After any collection/field change run `pnpm migrate:create <name>`
  and commit the files. Verify on a fresh DB: `NODE_ENV=production pnpm migrate`.
- **Rich text** renders server-side via `convertLexicalToHTML` (components/RichText.tsx);
  never import `@payloadcms/richtext-lexical/react` in storefront code (ships the editor).
- Integration tests boot Payload against the real DB and run one file at a time.
- **Accessibility:** never disable pinch-zoom; respect `prefers-reduced-motion`; keep focus rings.
- **Secrets only in env**; document every new variable in `.env.example`.
- Prices are whole rupees; format with `formatPrice()` (`Rs 8,425`).

## Motion (Phase 4)

- `src/lib/gsap.ts` registers ScrollTrigger + useGSAP; `src/lib/lenis.ts` drives Lenis from the GSAP
  ticker. `components/motion/MotionProvider.tsx` is the single place scroll/hover motion runs.
- Opt in from markup: `data-reveal` (fade-up, IntersectionObserver + CSS), `data-magnetic`
  (CTA pull + light sweep + ripple), `data-tilt` (3D tilt), `data-pin-horizontal` + `data-pin-track`.
  Headline reveal = `<SplitWords>` (pure CSS, never delays LCP). GSAP/Lenis load after idle,
  desktop only (`motion/desktop-effects.ts`).
- Preloader: inline head script adds `html.py-preload` on the first visit of a session only;
  CSS failsafe hides it by 1.5s even without JS. Page wipe: `(frontend)/template.tsx`.
- 3D hero (`components/three/HeroCar.tsx`, R3F, no drei) loads only on capable desktops via
  `HeroVisual`; phones get the owner's hero video or an SVG. Measured: three.js ≈185 KB gz +
  R3F ≈50 KB gz, lazy and off the critical path.
- Reduced motion: no preloader, 3D, Lenis, pinning or parallax; CSS keeps simple fades.
  E2E runs with `contextOptions.reducedMotion = 'reduce'` unless a test opts in.
- Animate transform/opacity only.

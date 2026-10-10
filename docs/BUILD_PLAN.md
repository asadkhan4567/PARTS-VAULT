# Partsyaar.com — Master Build Plan

> Renamed from the original working title "PartsVault.pk" to **Partsyaar.com** (wordmark "Parts" +
> red "Yaar"). Vault-door motifs in the motion spec stay as a "locked in / genuine" visual idea.

This is the owner's original brief. `CLAUDE.md` summarises it; when the two disagree, this file wins
on *what* to build and `CLAUDE.md` wins on *how* (conventions, commands).

## 0. Role & goal

Build **Partsyaar.com**, Pakistan's best online car-parts store: genuine OEM and premium aftermarket
parts, same-day delivery in Lahore, with an award-level animated UI in a **navy blue + red** theme.

The owner is **non-technical** and must manage **everything from an admin panel without touching
code**: products, prices, stock, categories, banners, phone / WhatsApp numbers, About Us, policies,
offers, and orders.

Work in phases (Section 12). After each phase: run the app, fix all errors, run lint + type-check +
tests, and summarise what was built before moving on.

## 1. Tech stack (fixed — do not substitute)

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript (strict) |
| CMS + Admin panel + Backend | Payload CMS 3 (installed inside the Next.js app) |
| Database | PostgreSQL (Neon or Supabase) via `@payloadcms/db-postgres` |
| Media storage | Payload media with S3-compatible storage (Cloudflare R2 or AWS S3) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animation | GSAP + ScrollTrigger + useGSAP, Lenis, Motion (Framer Motion), Lottie preloader |
| 3D | React Three Fiber + drei (hero only, lazy-loaded) |
| Search | Postgres full-text first; pluggable for Meilisearch later |
| Forms / validation | React Hook Form + Zod |
| Email | Resend (or SMTP) |
| Hosting | Vercel (app) + Neon (DB) + R2 (media) |
| Testing | Vitest (unit) + Playwright (E2E) |

No Stripe (not available for Pakistani merchants).

## 2. Brand & design system

- **Name:** Partsyaar.com · **Tagline:** "Genuine Parts. Locked In. Delivered Fast."
- **Logo:** wordmark — "Parts" bold white, "Vault" red, shield/vault-door icon, small ".pk". SVG
  component; the owner can replace it from Site Settings.

| Token | Hex | Use |
|---|---|---|
| `navy-950` | `#06122A` | Deepest backgrounds, footer |
| `navy-900` | `#0A1A33` | Header, hero |
| `navy-700` | `#12305C` | Cards on dark |
| `navy-500` | `#1E4A8A` | Links, focus rings |
| `navy-100` | `#E8EEF7` | Light sections |
| `red-600` | `#E10600` | Primary CTA, prices, badges |
| `red-700` | `#B30500` | CTA hover / pressed |
| `red-glow` | `rgba(225,6,0,.35)` | Glows, light streaks |
| `steel-400` | `#8A97AB` | Secondary text, borders |
| `success` | `#1DB954` | In stock, "Fits your car" |
| `warning` | `#F5A524` | Low stock |

- Fonts: headings Rajdhani (600/700), body Inter, numbers/part codes JetBrains Mono, Urdu Noto
  Nastaliq Urdu (RTL toggle).
- Radius 12px · soft navy shadows · glassmorphism panels on navy (backdrop-blur, 8% white).
- Light content areas, navy header/footer/hero. Optional dark mode.

## 3. Inspiration & UX rules

Borrow patterns (not assets) from AutoDoc / CarParts.com / RockAuto (YMM finder, fitment
confirmation), Partsouq (OEM-number search), Apple / Porsche (scroll storytelling), Awwwards
e-commerce winners (preloader, Lenis, magnetic buttons, page transitions).

1. Vehicle finder on every page (header).
2. "Fits your vehicle ✓ / ✗" on every product card and page once a vehicle is selected.
3. Mobile-first; thumb-reachable CTAs, sticky Add-to-Cart.
4. Shipping, returns and delivery ETA visible on the product page.
5. Search accepts part names, OEM numbers, car models and Urdu/Roman-Urdu terms ("brake ki pads").

## 4. Motion & animation spec (60fps, transform/opacity only)

`lib/gsap.ts` registers ScrollTrigger + useGSAP; Lenis wired to `ScrollTrigger.update`.

1. Vault-door preloader — first visit only (sessionStorage), ≤1.2s, skippable.
2. Hero — navy gradient + red light streak; R3F car that "explodes" into parts on a pinned scroll
   section; mouse parallax; WebM fallback on low-end/mobile.
3. Headline split-word reveal. 4. Vehicle finder steps slide in, red progress bar.
5. Stats counters. 6. Infinite brand marquee. 7. Category card tilt + red glow.
8. Horizontal-scroll "Shop by Make". 9. Product quick-view + fly-to-cart.
10. Magnetic CTAs, light sweep, ripple. 11. Same-day delivery route + cutoff countdown.
12. Navy page-wipe transitions. 13. Navy skeleton shimmers.
14. `prefers-reduced-motion`: no preloader/3D/parallax/pinning; simple fades only.
15. Budget: LCP < 2.5s on 4G, CLS < 0.1, 3D JS < 200KB gz lazy, Lighthouse mobile ≥ 90.

## 5. Storefront pages

- Home — 14 sections, each toggleable and re-orderable from admin (layout blocks): announcement
  bar, hero + vehicle finder, trust strip, shop by make, promo banners, popular categories, feature
  banners, deal of the day, best sellers/new arrivals, brand marquee, "can't find your part?"
  WhatsApp, reviews, blog tips, newsletter.
- `/make/[make]`, `/make/[make]/[model]`, `/category/[slug]`, `/product/[slug]`, `/search?q=`,
  `/garage`, cart drawer + `/cart`, `/checkout`, `/track`, account, CMS pages (About, Contact, FAQ,
  Shipping, Returns, Warranty, Privacy, Terms, Genuine Guarantee, B2B), `/blog`, `/stores`.
- Header everywhere: red announcement bar, navy header with logo, search with live suggestions,
  compact vehicle selector, WhatsApp, account, wishlist, cart; mega menus; sticky + shrink; mobile
  bottom tab bar.
- Footer: all from Site Settings.

## 6. Catalogue seed (excluding Suzuki)

Makes & models: Toyota (Corolla 09-13/14-22, Yaris 19-, Vitz 05-10/11-13/14-18/18-, Aqua, Passo,
Premio, Prius 09-15/16-21, C-HR, Camry 06-11/11-17/18-, Mark X, Crown, Hilux Vigo / Vigo Champ /
Revo, Fortuner, Prado, Land Cruiser) · Honda (City 09-20/21-, Civic 08-12/12-15/16-21/22-, Accord,
BR-V, HR-V, Vezel, N-One, N-WGN) · Kia (Picanto, Sportage, Sorento, Stonic, Grand Carnival) ·
Hyundai (Elantra, Tucson, Sonata) · Audi (A3, A4, A5, A6, Q3, Q5, Q7, e-tron, e-tron GT) ·
Mercedes-Benz (C/E/S-Class, EQS) · BMW (3/5/7 Series, X1, X5, X7) · Land Rover (Range Rover, Range
Rover Sport) · Porsche (Cayenne, Panamera, 911, Taycan) · Lexus (LX570, LX600, RX450h, CT200h) ·
MG (HS, ZS) · Haval (H6, Jolion) · Changan (Alsvin, Oshan X7) · DFSK (Glory 580) · Proton (Saga,
X70) · Daihatsu (Mira, Move) · Peugeot (2008) · BAIC (BJ40).

Categories: Engine Parts, Body Parts, Lighting, Suspension, Service Parts, Filters, Oils & Fluids,
Air Conditioning, Electrical, Accessories (sub-categories in `src/seed/data/categories.ts`).

Part brands: Genuine/OEM, Bosch, Brembo, Mahle, Mann, Hengst, Hitachi, INA, FAG Schaeffler,
Nissens, Onnuri, Denso, NGK.

~40 realistic products (Corolla, Civic, Sportage, Audi A4), e.g. "Front Brake Pads – Toyota Corolla
[14–22] – 04465-02220 – Hitachi" · Rs 8,425.

## 7. Product page spec

Title `<Part> – <Make Model [YY–YY]> – <OEM No.> – <Brand>`; gallery with zoom; genuine/aftermarket
badge; price + compare-at + "Save Rs X"; stock status + back-in-stock alert; fit check vs garage
vehicle + fitment table; OEM, cross-refs, SKU (mono, copy); delivery ETA by city + cutoff
countdown; Add to Cart, Buy Now, Order on WhatsApp (pre-filled), Wishlist, Share; tabs
(Description & Specs · Fitment · Shipping & Returns · Warranty · Reviews); frequently bought
together, customers also bought, recently viewed; sticky mobile ATC; JSON-LD Product + Offer +
BreadcrumbList.

## 8. Admin panel — owner controls everything without code

Payload admin at `/admin`, branded navy/red with a custom dashboard.

Collections: Products, Categories, Makes, Models, Part Brands, Orders, Customers, Coupons, Reviews,
Banners, Pages, Blog Posts, Part Requests, Media, Users (staff: Owner / Manager / Staff).
Globals: Site Settings, Announcement Bar, Delivery Settings, Payment Settings, Homepage, Header /
Footer Navigation, Loyalty Settings, SEO Defaults, Popups.
Power tools: custom dashboard, bulk price update, CSV import/export, duplicate product, live
preview + drafts + versions, order notifications, invoice PDF (NTN), audit log, mobile-friendly.

**Acceptance test:** a non-technical owner can (1) change a product price, (2) add a new product
with fitment and images, (3) change the WhatsApp number site-wide, (4) edit About Us, (5) add a
homepage banner, (6) mark an order Delivered — each in under 2 minutes, without code. One
Playwright test each.

## 9. Commerce

Cart drawer (coupon, delivery estimate, free-delivery progress), one-page checkout (guest or login,
`03XX-XXXXXXX` phone, city/area → fee + ETA; COD, bank transfer, JazzCash, Easypaisa, card via a
swappable gateway adapter — Safepay / PayFast), order numbers `PV-100245`, tracking by number +
phone, Yaar Points, wishlist, back-in-stock + price-drop alerts, WhatsApp everywhere, B2B workshop
pricing, photo reviews.

## 10. SEO, analytics, performance, security

SSR, clean URLs, editable meta, canonical, sitemap, robots, hreflang (Urdu); schema.org
Organization, AutoPartsStore, Product, Offer, Review, BreadcrumbList, FAQPage; GA4 + Meta Pixel
from admin; `/feeds/products.xml`; next/image + next/font; WCAG 2.1 AA, never disable pinch-zoom;
Payload access control, rate-limited forms, Zod, CSRF-safe server actions, secrets only in env,
**cost price never sent to the client**.

## 12. Build phases

- **Phase 0 — Setup:** Next.js + Payload + Postgres + Tailwind + shadcn, design tokens, fonts,
  `.env.example`, README.
- **Phase 1 — Data model + Admin:** all collections & globals, roles, admin branding, seed script.
- **Phase 2 — Core storefront:** header/footer from settings, home, make/model/category/product
  pages, search, vehicle finder + garage + fit check.
- **Phase 3 — Commerce:** cart, checkout, COD + bank transfer, orders, emails, tracking, coupons.
- **Phase 4 — Motion & 3D.**
- **Phase 5 — Admin power tools.**
- **Phase 6 — Extras:** loyalty, reviews, wishlist, alerts, blog, B2B, Urdu/RTL, payment adapters.
- **Phase 7 — Polish & launch.**

## 13. Definition of done

All Section 8 acceptance tests pass; Lighthouse mobile ≥ 90 in all four categories; no TS errors,
no console errors, all E2E green; README covers local run, deploy, owner login, and how to change
prices / numbers / pages.

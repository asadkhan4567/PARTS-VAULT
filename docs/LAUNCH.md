# Launching Partsyaar.com

A one-time checklist to go from this repository to a live store on **partsyaar.com**.
Hosting: **Vercel** (website + admin), **Neon** (database), **Cloudflare R2** (photos),
**Resend** (emails). All have free tiers that are enough to start.

## 1. Accounts you need

| Service | What for | Sign up |
| --- | --- | --- |
| Vercel | Runs the website and admin | vercel.com (log in with GitHub) |
| Neon | PostgreSQL database | neon.tech — choose region **AWS Asia Pacific (Mumbai) / Singapore** |
| Cloudflare R2 | Product photos and banners | dash.cloudflare.com → R2 |
| Resend | Order emails | resend.com |
| Domain registrar | partsyaar.com | wherever you bought the domain |

## 2. Database (Neon)

1. Create a project → copy the **pooled** connection string (`postgresql://…-pooler…/neondb?sslmode=require`).
2. That's `DATABASE_URL`. Tables are created automatically on the first deploy (`pnpm migrate`).
3. Neon keeps point-in-time backups; turn on a longer history window when you have orders.

## 3. Photos (Cloudflare R2)

1. Create a bucket, e.g. `partsyaar-media`.
2. R2 → *Manage API tokens* → create a token with **Object Read & Write** on that bucket.
3. Note the **Account ID**. Values:
   - `S3_BUCKET=partsyaar-media`
   - `S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
   - `S3_REGION=auto`
   - `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` from the token

Photos are served through the site (`/api/media/file/…`), so the bucket can stay private.

## 4. Email (Resend)

1. Resend → *Domains* → add `partsyaar.com` → add the DNS records it shows (SPF, DKIM) at your
   domain registrar → wait for "Verified".
2. Create an API key → `RESEND_API_KEY`. Set `EMAIL_FROM_ADDRESS=orders@partsyaar.com`.

## 5. Deploy on Vercel

1. Vercel → *Add New Project* → import the GitHub repository.
2. Framework is detected from `vercel.json` (build runs database migrations, then builds).
3. *Environment Variables* — add every variable from `.env.example`:
   - `DATABASE_URL` (Neon), `PAYLOAD_SECRET` (run `openssl rand -hex 32`),
     `NEXT_PUBLIC_SERVER_URL=https://partsyaar.com`
   - the five `S3_*` values, `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME`
4. Deploy.

## 6. Domain

1. Vercel project → *Settings → Domains* → add `partsyaar.com` and `www.partsyaar.com`
   (redirect www → root).
2. At your registrar, add the A / CNAME records Vercel shows. HTTPS is automatic.

## 7. First login and real data

1. Open `https://partsyaar.com/admin` → create the first account. **The first account is the
   Owner.** Use a strong password.
2. Choose how to start:
   - **Demo data** (to explore): from your computer with the production `DATABASE_URL`
     and S3 values in `.env`, run `pnpm seed`. Delete demo products later, or
   - **Empty store**: skip the seed and add makes, categories and products in the admin, or
     upload a spreadsheet in **Tools → Excel import / export**.
   - Never run `pnpm seed --reset` against the live database — it deletes orders and products.
3. Settings → **Site Settings**: store name, logo, phone, WhatsApp, address, hours, NTN, social links,
   and *Send new-order emails to*.
4. Settings → **Delivery Settings**: cities, fees, same-day cutoff, free-delivery threshold.
5. Settings → **Payment Settings**: COD and bank details. Add JazzCash / Easypaisa / card keys
   when your merchant accounts are approved (keep *Sandbox* ticked for the first test payment).
   Gateway return URLs: `https://partsyaar.com/pay/callback/jazzcash`, `/easypaisa`, `/card`.
6. Settings → **Staff**: invite managers and staff with the right role.
7. Change the demo coupon codes (Marketing → Coupons) and the bank details text.

## 8. Google, Meta and analytics

1. Google Search Console → add `partsyaar.com` → paste the verification code into
   **Settings → SEO & Analytics** → submit `https://partsyaar.com/sitemap.xml`.
2. Google Merchant Center / Meta Commerce Manager → add a scheduled feed:
   `https://partsyaar.com/feeds/products.xml` (updates hourly).
3. GA4 measurement ID (`G-…`) and Meta Pixel ID → **Settings → SEO & Analytics**.

## 9. Before announcing

- [ ] Place a real COD test order on a phone; mark it Delivered in the admin; check the emails
- [ ] Download an invoice PDF and check logo, address and NTN
- [ ] Change one price, one stock level; check the audit log shows your name
- [ ] Test the WhatsApp buttons open the right number
- [ ] Visit the site in Urdu (header switch) and on a slow connection
- [ ] Make sure only the right people have Owner/Manager roles

## Updating the site later

Every push to the main branch redeploys automatically. If you (or a developer) change a
collection or field, create a migration first: `pnpm migrate:create <name>` and commit it;
the deploy runs it.

## Performance notes (measured with Lighthouse 12, production build)

| Page | Mobile (perf / a11y / best / SEO) | Desktop |
| --- | --- | --- |
| Home | 84 / 97 / 100 / 100 | 99 / 97 / 100 / 100 |
| Product | 75 / 100 / 100 / 100 | 95 / 100 / 100 / 100 |
| Category | 82 / 98 / 100 / 100 | 98 / 98 / 100 / 100 |

Mobile scores use Lighthouse's simulated slow 4G + 4× CPU throttling; the observed paint in the
same runs was ~1.1 s. The brief's ≥ 90 mobile performance target is not yet met. Next steps that
would close the gap: cache anonymous pages at the edge (ISR) to cut server time, and trim
client JavaScript on the product page further.

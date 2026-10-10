/**
 * Starter copy for the CMS pages. Everything here is editable in Admin → Content → Pages.
 * Placeholders in [brackets] are for the owner to fill in.
 */
export type SeedPage = {
  title: string
  slug: string
  intro: string
  body: string
  faq?: Array<[string, string]>
  contact?: boolean
  cta?: { heading: string; text: string; whatsapp?: boolean }
}

export const PAGES: SeedPage[] = [
  {
    title: 'About Us',
    slug: 'about-us',
    intro: 'Genuine parts, honest prices, delivered the same day.',
    body: `
## Who we are
Partsyaar.com started with a simple idea: buying car parts in Pakistan should not mean guesswork, fake parts or wasted afternoons at the market. We stock **genuine OEM** and **premium aftermarket** parts from brands like Bosch, Brembo, Denso, Mahle and NGK — and we deliver them to your door, often within the hour in Lahore.
## What makes us different
- **100% genuine guarantee** — every part is sourced from authorised distributors or the manufacturer.
- **Fitment you can trust** — choose your car once and we show you only parts that fit.
- **Same-day delivery in Lahore** — order before the cutoff and our riders bring it today.
- **Real experts on WhatsApp** — send a photo or your chassis number and we will find the right part.
## Our promise
If a part we sold you is not genuine, we refund you double. That is how confident we are.`,
    cta: { heading: 'Need help finding a part?', text: 'Message our parts experts — we usually reply within minutes.', whatsapp: true },
  },
  {
    title: 'Contact Us',
    slug: 'contact',
    intro: 'Call, WhatsApp or visit — we are happy to help.',
    body: `Our team can help you identify parts, check fitment, track an order or arrange a workshop account.`,
    contact: true,
  },
  {
    title: 'Frequently Asked Questions',
    slug: 'faq',
    intro: 'Quick answers about orders, delivery, payments and returns.',
    body: `Can’t find your answer? Message us on WhatsApp — a real person will reply.`,
    faq: [
      ['How do I know a part fits my car?', 'Select your vehicle (make, model and year) at the top of the page. Every product then shows “Fits your vehicle ✓” or “Does not fit ✗”. Not sure? Send us your chassis/VIN number on WhatsApp and we will confirm.'],
      ['Are your parts genuine?', 'Yes. Genuine parts come from the vehicle manufacturer; OEM and aftermarket parts come from the original manufacturer (Denso, Bosch, Hitachi…) through authorised channels. See our Genuine Guarantee.'],
      ['How fast is delivery?', 'In-stock parts are delivered the same day in Lahore if you order before the daily cutoff — often within 60 minutes. Other cities take 2–4 working days by courier.'],
      ['Which payment methods do you accept?', 'Cash on Delivery, bank transfer, and — as they go live — JazzCash, Easypaisa and debit/credit cards.'],
      ['Can I return a part?', 'Yes. Unused parts in original packaging can be returned within 7 days. Electrical parts can only be returned if faulty. See Returns & Refunds for details.'],
      ['Do you install parts?', 'We supply parts only, but we can recommend trusted partner workshops in Lahore.'],
      ['I own a workshop. Do you offer trade prices?', 'Yes — apply for a workshop (B2B) account and you will see trade prices on every product once approved.'],
    ],
  },
  {
    title: 'Shipping & Delivery',
    slug: 'shipping',
    intro: 'Same-day in Lahore, 2–4 working days nationwide.',
    body: `
## Same-day delivery (Lahore)
Order in-stock parts before the daily cutoff time shown on each product and our own riders will deliver today — usually in under 60 minutes in central Lahore.
## Other cities
We ship nationwide through trusted courier partners. Delivery usually takes 2–4 working days. You will receive a tracking update by SMS/WhatsApp.
## Delivery fees
Fees depend on your city and are shown at checkout before you pay. Orders above the free-delivery threshold ship free.
## Bulky items
Bumpers, radiators and other large parts may need an extra day and are delivered by van.`,
  },
  {
    title: 'Returns & Refunds',
    slug: 'returns',
    intro: 'Easy 7-day returns on unused parts.',
    body: `
## 7-day returns
You can return any unused part in its original, undamaged packaging within 7 days of delivery.
## Not returnable
- Electrical parts (coils, sensors, bulbs, batteries) that have been installed — unless faulty
- Fluids and oils once opened
- Parts ordered specially for you (marked “special order”)
## Wrong part?
If we sent the wrong part, or a part we confirmed as fitting does not fit, we collect it free and send the right one or refund you in full.
## Refunds
Refunds are made by bank transfer or JazzCash/Easypaisa within 3–5 working days of us receiving the part.`,
  },
  {
    title: 'Warranty',
    slug: 'warranty',
    intro: 'Manufacturer warranty on every part, handled by us.',
    body: `
Each product page shows its warranty period. If a part fails within warranty, message us with your order number and photos — we handle the claim with the manufacturer so you don’t have to.
## Warranty does not cover
- Damage from incorrect installation
- Normal wear (brake pads, wiper blades, filters)
- Accident or misuse`,
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy',
    intro: 'How we collect and use your information.',
    body: `
We collect only what we need to deliver your order: your name, phone number, delivery address and (optionally) email. We never sell your data.
## How we use it
- To deliver your order and send status updates
- To answer your questions and handle returns
- To send offers, only if you subscribe (you can unsubscribe any time)
## Cookies and analytics
We use cookies to remember your cart and selected vehicle, and anonymous analytics to improve the site.
## Contact
For any privacy question, contact us using the details on our Contact page.`,
  },
  {
    title: 'Terms & Conditions',
    slug: 'terms',
    intro: 'The rules for using Partsyaar.com.',
    body: `
By placing an order on Partsyaar.com you agree to these terms.
## Prices
All prices are in Pakistani Rupees and include applicable taxes unless stated otherwise. We may correct obvious pricing errors before dispatch.
## Orders
An order is confirmed when we call or message to verify it. We may cancel orders we cannot fulfil and refund any payment in full.
## Fitment
Fitment information is provided in good faith. Please confirm with us (VIN/chassis number) for rare variants.
## Liability
Our liability is limited to the value of the parts supplied.`,
  },
  {
    title: 'Genuine Guarantee',
    slug: 'genuine-guarantee',
    intro: 'Genuine or double your money back.',
    body: `
Counterfeit parts are a real danger on Pakistani roads. Every part we sell is sourced from the vehicle manufacturer, the original equipment maker or their authorised distributors.
## Our guarantee
If any part bought from Partsyaar.com is proven not to be genuine, we will refund **double** the price you paid.
## How to spot genuine parts
- Original packaging with hologram or QR code
- Correct OEM part number printed on the part
- Consistent finish and weight — fakes are often lighter`,
  },
  {
    title: 'Workshops & B2B',
    slug: 'b2b',
    intro: 'Trade prices, priority stock and credit for workshops.',
    body: `
Run a workshop, fleet or dealership? Open a Partsyaar workshop account.
- **Trade pricing** on every product, shown automatically when you log in
- **Priority same-day delivery** to your workshop
- **Monthly statements** and credit for approved accounts
- **Dedicated WhatsApp line** for fast quotes
## How to apply
Create an account, then message us your workshop name and address. We usually approve accounts within one working day.`,
    cta: { heading: 'Apply for a workshop account', text: 'Send us your workshop details on WhatsApp.', whatsapp: true },
  },
]

export const BLOG_POSTS: Array<{ title: string; excerpt: string; body: string; tags: string[]; icon: string }> = [
  {
    title: 'When should you change your brake pads?',
    excerpt: 'Squealing, a longer pedal or a vibrating steering wheel? Here is how to tell your pads are done.',
    icon: 'disc',
    tags: ['brakes', 'maintenance'],
    body: `
In Lahore traffic, brake pads typically last 25,000–40,000 km. Check them every oil change.
## Warning signs
- A high-pitched squeal when braking (the wear indicator)
- Grinding — metal on metal; stop driving and replace immediately
- The car pulls to one side
- Vibration through the pedal or steering wheel (often warped discs)
## Genuine vs aftermarket
Genuine and OEM pads (Hitachi, Denso, Brembo) are matched to your calipers. Cheap pads can glaze, squeal and wear your discs faster.`,
  },
  {
    title: 'Oil change intervals in Pakistani conditions',
    excerpt: 'Heat, dust and stop-start traffic count as “severe service”. Here is what that means for your oil.',
    icon: 'droplet',
    tags: ['engine oil', 'maintenance'],
    body: `
Manufacturers list a “severe service” schedule for hot, dusty, stop-start driving — which describes most Pakistani cities.
## Our recommendation
- Mineral oil: every 3,000–4,000 km
- Semi-synthetic: every 5,000 km
- Fully synthetic (0W-20, 5W-30): every 7,000–8,000 km
## Always change the filter
A new oil filter costs a fraction of an engine. Change it at every oil change.`,
  },
  {
    title: 'Why your AC is weak in summer (and how to fix it)',
    excerpt: 'Before you blame the compressor, check these three cheap parts first.',
    icon: 'snowflake',
    tags: ['air conditioning', 'summer'],
    body: `
A weak AC is usually one of three things:
## 1. A clogged cabin filter
A Rs 2,000 cabin filter can restore airflow instantly. Replace it every 10,000 km.
## 2. A dirty condenser
The condenser sits in front of the radiator and collects dust and insects. A gentle wash helps.
## 3. Low refrigerant
Gas leaks slowly over time. A workshop can test pressures and recharge it.
Only if all three are fine is it time to look at the compressor.`,
  },
]

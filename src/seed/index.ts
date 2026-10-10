/**
 * Demo data for Partsyaar.com.  Run:  pnpm seed          (skips if products already exist)
 *                                     pnpm seed --reset  (wipes catalogue/content first)
 * The first owner account comes from SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD.
 */
import config from '@payload-config'
import { getPayload, type CollectionSlug, type Payload } from 'payload'

import { richText } from '@/lib/richtext'
import { slugify } from '@/lib/utils'

import { PART_BRANDS } from './data/brands'
import { CATEGORIES } from './data/categories'
import { HIDDEN_MAKES, MAKES } from './data/makes'
import { BLOG_POSTS, PAGES } from './data/pages'
import { PRODUCTS } from './data/products'
import { bannerImage, categoryImage, makeLogo, modelImage, productImage } from './images'

const ctx = { skipAudit: true }
const log = (msg: string) => console.log(`[seed] ${msg}`)

// Deletion order respects relationships (children before parents).
const WIPE: CollectionSlug[] = [
  'orders', 'reviews', 'stock-alerts', 'part-requests', 'audit-logs', 'subscribers', 'customers',
  'products', 'models', 'makes', 'categories', 'part-brands', 'banners', 'pages', 'blog-posts', 'coupons', 'media',
]

async function wipe(payload: Payload) {
  for (const collection of WIPE) {
    if (collection === 'categories') {
      await payload.delete({ collection, where: { parent: { exists: true } }, overrideAccess: true, context: ctx })
    }
    await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true, context: ctx })
  }
  log('wiped existing demo data')
}

async function upload(payload: Payload, data: Buffer, name: string, alt: string): Promise<number> {
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/png', name: `${slugify(name)}.png`, size: data.length },
    overrideAccess: true,
  })
  return doc.id
}

export async function seed(payload: Payload, { reset = false } = {}) {
  const existing = await payload.count({ collection: 'products', overrideAccess: true })
  if (existing.totalDocs > 0 && !reset) {
    log(`${existing.totalDocs} products already exist — nothing to do (use --reset to start over).`)
    return
  }
  if (reset) await wipe(payload)

  // ——— Owner account ———
  const users = await payload.count({ collection: 'users', overrideAccess: true })
  if (users.totalDocs === 0) {
    const email = process.env.SEED_OWNER_EMAIL || 'owner@partsyaar.com'
    const password = process.env.SEED_OWNER_PASSWORD || 'change-me'
    await payload.create({ collection: 'users', data: { email, password, name: 'Store Owner', role: 'owner' }, overrideAccess: true })
    log(`created owner login ${email}`)
  }

  // ——— Part brands ———
  const brandId = new Map<string, number>()
  for (const b of PART_BRANDS) {
    const doc = await payload.create({ collection: 'part-brands', data: { ...b, trusted: true }, overrideAccess: true })
    brandId.set(b.name, doc.id)
  }
  log(`${brandId.size} part brands`)

  // ——— Makes & models ———
  const modelKey = new Map<string, { id: number; makeId: number; from: number; to: number | null }>()
  const makeId = new Map<string, number>()
  let order = 0
  for (const make of MAKES) {
    const logo = await upload(payload, await makeLogo(make.name), `${make.name}-logo`, `${make.name} logo`)
    const m = await payload.create({ collection: 'makes', data: { name: make.name, logo, order: order++, visible: true }, overrideAccess: true })
    makeId.set(make.name, m.id)
    const imageFor = new Map<string, number>()
    for (const model of make.models) {
      if (!imageFor.has(model.name)) {
        imageFor.set(model.name, await upload(payload, await modelImage(`${make.name} ${model.name}`), `${make.name}-${model.name}`, `${make.name} ${model.name}`))
      }
      const doc = await payload.create({
        collection: 'models',
        data: { make: m.id, name: model.name, yearFrom: model.from, yearTo: model.to, image: imageFor.get(model.name) },
        overrideAccess: true,
      })
      modelKey.set(`${make.name}|${model.name}|${model.from}`, { id: doc.id, makeId: m.id, from: model.from, to: model.to })
    }
  }
  for (const name of HIDDEN_MAKES) {
    await payload.create({ collection: 'makes', data: { name, visible: false, order: order++ }, overrideAccess: true })
  }
  log(`${makeId.size} makes, ${modelKey.size} model generations`)

  // ——— Categories ———
  const categoryId = new Map<string, number>()
  const categoryIcon = new Map<string, string>()
  let catOrder = 0
  for (const cat of CATEGORIES) {
    const image = await upload(payload, await categoryImage({ icon: cat.icon, name: cat.name }), cat.name, cat.name)
    const parent = await payload.create({
      collection: 'categories',
      data: { name: cat.name, icon: cat.icon as 'wrench', image, order: catOrder++, showOnHome: cat.showOnHome },
      overrideAccess: true,
    })
    categoryId.set(cat.name, parent.id)
    let childOrder = 0
    for (const child of cat.children) {
      const doc = await payload.create({
        collection: 'categories',
        data: { name: child, parent: parent.id, icon: cat.icon as 'wrench', order: childOrder++ },
        overrideAccess: true,
      })
      categoryId.set(child, doc.id)
      categoryIcon.set(child, cat.icon)
    }
  }
  log(`${categoryId.size} categories`)

  // ——— Products ———
  const productId = new Map<string, number>()
  for (const p of PRODUCTS) {
    const title = `${p.part} – ${p.vehicleLabel} – ${p.oem} – ${p.brand}`
    const icon = categoryIcon.get(p.category)
    const images: number[] = []
    for (let v = 0; v < 2; v++) {
      images.push(await upload(payload, await productImage({ icon, title: p.part, brand: p.brand, oem: p.oem, variant: v }), `${p.part}-${p.oem}-${v}`, `${p.brand} ${p.part} ${p.oem}`))
    }
    const fitments = p.fits.map((f) => {
      const [make, model, gen, engine, yf, yt] = f.split('|')
      const m = modelKey.get(`${make}|${model}|${gen}`)
      if (!m) throw new Error(`Unknown vehicle "${f}" for ${title}`)
      return {
        make: m.makeId,
        model: m.id,
        yearFrom: yf ? Number(yf) : m.from,
        yearTo: yt ? Number(yt) : m.to,
        engine: engine || undefined,
      }
    })
    const categoryRef = categoryId.get(p.category)
    if (!categoryRef) throw new Error(`Unknown category "${p.category}"`)
    const doc = await payload.create({
      collection: 'products',
      overrideAccess: true,
      context: ctx,
      data: {
        _status: 'published',
        title,
        sku: `PY-${slugify(p.oem).toUpperCase().slice(0, 18)}-${slugify(p.brand).slice(0, 3).toUpperCase()}`,
        oemNumber: p.oem,
        price: p.price,
        compareAtPrice: p.compareAt,
        workshopPrice: p.workshop,
        costPrice: p.cost,
        stock: p.stock,
        lowStockThreshold: 3,
        partBrand: brandId.get(p.brand)!,
        condition: p.condition,
        categories: [categoryRef],
        images,
        description: richText(`${p.blurb}\n## Why buy from Partsyaar\n- 100% genuine guarantee\n- Same-day delivery in Lahore\n- Easy 7-day returns on unused parts`),
        specs: p.specs?.map(([label, value]) => ({ label, value })),
        warranty: p.warranty,
        tags: p.tags,
        universalFit: Boolean(p.universal),
        fitments,
        crossRefs: p.crossRefs?.map(([number, brand]) => ({ number, brand })),
        featured: Boolean(p.featured),
        bestSeller: Boolean(p.bestSeller),
        salesCount: p.bestSeller ? 40 + p.stock : Math.floor(p.stock / 2),
        meta: { title: `${title} | Partsyaar.com`, description: p.blurb },
      },
    })
    productId.set(`${p.part}|${p.oem}`, doc.id)
  }
  const pid = (part: string, oem: string) => productId.get(`${part}|${oem}`)!
  // Frequently bought together
  const together: Array<[string, string, Array<[string, string]>]> = [
    ['Front Brake Pads', '04465-02220', [['Rear Brake Shoes', '04495-02140'], ['Super Long Life Coolant (Pink, 4L)', '08889-80140']]],
    ['Oil Filter', '90915-YZZE1', [['Toyota Motor Oil 0W-20 (4L)', '08880-83265'], ['Air Filter', '17801-0T020'], ['Cabin AC Filter', '87139-02090']]],
    ['Oil Filter', '15400-RTA-003', [['Air Filter', '17220-5BA-A00'], ['Cabin AC Filter', '80292-TBA-A11']]],
    ['Front Brake Discs (Pair)', '8W0615301', [['Front Brake Pads', '8W0698151']]],
    ['Oil Filter', '06L115562B', [['Engine Oil 5W-30 LongLife III (5L)', 'G 052 195 M4'], ['Air Filter', '8W0133843']]],
  ]
  for (const [part, oem, others] of together) {
    await payload.update({
      collection: 'products',
      id: pid(part, oem),
      data: { boughtTogether: others.map(([p, o]) => pid(p, o)) },
      overrideAccess: true,
      context: ctx,
    })
  }
  log(`${productId.size} products`)

  // ——— Reviews ———
  const REVIEWS: Array<[string, string, string, string, number, string, string]> = [
    ['Front Brake Pads', '04465-02220', 'Usman R.', 'Lahore', 5, 'Perfect fit, delivered in 45 minutes', 'Ordered at 2pm, rider was at my door before 3. Pads are exactly like the ones Toyota fitted. No squeal.'],
    ['Front Brake Pads', '04465-02220', 'Hira K.', 'Lahore', 5, 'Genuine and cheaper than the market', 'Checked the box hologram — genuine Hitachi. Saved about Rs 1,500 compared to Montgomery Road.'],
    ['Oil Filter', '90915-YZZE1', 'Bilal A.', 'Gujranwala', 4, 'Good packaging', 'Arrived in two days to Gujranwala, well packed. Will order oil from here next time.'],
    ['Front Brake Pads', '45022-TBA-A01', 'Saad M.', 'Islamabad', 5, 'Brembo quality', 'Big difference in braking feel on my Civic. Very little dust compared to local pads.'],
    ['Iridium Spark Plugs (Set of 4)', '90919-01253', 'Ayesha N.', 'Lahore', 5, 'Smoother idle', 'Car starts instantly now and the average went up a little. Helpful staff on WhatsApp.'],
    ['Front Brake Pads', '58101-D3A10', 'Kamran S.', 'Karachi', 4, 'Original Kia part', 'Hard to find genuine Sportage pads in Karachi. These were genuine, delivery took 3 days.'],
    ['Front Brake Discs (Pair)', '8W0615301', 'Faisal H.', 'Lahore', 5, 'Finally a reliable Audi parts shop', 'They confirmed fitment from my chassis number before sending. Brembo discs fitted perfectly.'],
    ['S4 55D23L Car Battery (60Ah)', '0092S40050', 'Zainab T.', 'Lahore', 5, 'Rescued me at night', 'Battery died at 8pm, they delivered and the rider even helped me fit it.'],
  ]
  for (const [part, oem, name, city, rating, title, text] of REVIEWS) {
    await payload.create({
      collection: 'reviews',
      data: { product: pid(part, oem), name, city, rating, title, text, verifiedBuyer: true, approved: true, featured: true },
      overrideAccess: true,
      context: ctx,
    })
  }
  log(`${REVIEWS.length} reviews`)

  // ——— Banners ———
  const banner = async (data: Record<string, unknown>, icon: string, tone: 'navy' | 'red' = 'navy') => {
    const img = await upload(payload, await bannerImage({ icon, tone }), `banner-${String(data.title)}`, String(data.headline ?? data.title))
    const doc = await payload.create({ collection: 'banners', data: { ...data, imageDesktop: img, imageMobile: img } as never, overrideAccess: true })
    return doc.id
  }
  await banner({ title: 'Brake week', placement: 'home_promo', eyebrow: 'BRAKE WEEK', headline: 'Up to 15% off brake pads & discs', subtext: 'Hitachi, Brembo and genuine pads for Corolla, Civic, Sportage and Audi.', ctaText: 'Shop brakes', ctaLink: '/category/brake-pads', theme: 'red', order: 0 }, 'disc', 'red')
  await banner({ title: 'Service kit', placement: 'home_promo', eyebrow: 'SERVICE DUE?', headline: 'Oil + filter combos from Rs 6,900', subtext: 'Everything for a proper service, delivered today.', ctaText: 'Build my service', ctaLink: '/category/oil-filters', theme: 'navy', order: 1 }, 'droplet')
  await banner({ title: 'Oil filters feature', placement: 'home_feature', headline: 'Oil Filters', subtext: 'Genuine, Mann, Mahle & Hengst', ctaText: 'Shop now', ctaLink: '/category/oil-filters', theme: 'navy', order: 0 }, 'filter')
  await banner({ title: 'Engine parts feature', placement: 'home_feature', headline: 'Engine Parts', subtext: 'Mounts, pumps, coils, timing kits', ctaText: 'Shop now', ctaLink: '/category/engine-parts', theme: 'navy', order: 1 }, 'engine')
  await banner({ title: 'Suspension feature', placement: 'home_feature', headline: 'Suspension', subtext: 'Shocks, arms, bushes & hubs', ctaText: 'Shop now', ctaLink: '/category/suspension', theme: 'red', order: 2 }, 'cog', 'red')
  await banner({ title: 'Category top — free delivery', placement: 'category_top', headline: 'Free delivery over Rs 10,000', subtext: 'Same-day across Lahore when you order before 5pm.', theme: 'navy', order: 0 }, 'wrench')
  log('banners')

  // ——— Pages & blog ———
  for (const p of PAGES) {
    const layout: Record<string, unknown>[] = [{ blockType: 'richText', enabled: true, content: richText(p.body) }]
    if (p.faq) layout.push({ blockType: 'faq', enabled: true, heading: 'Frequently Asked Questions', items: p.faq.map(([question, answer]) => ({ question, answer })) })
    if (p.contact) layout.push({ blockType: 'contact', enabled: true, heading: 'Get in touch', showForm: true })
    if (p.cta) layout.push({ blockType: 'cta', enabled: true, heading: p.cta.heading, text: p.cta.text, whatsapp: p.cta.whatsapp })
    await payload.create({
      collection: 'pages',
      data: { _status: 'published', title: p.title, slug: p.slug, intro: p.intro, layout: layout as never, meta: { title: `${p.title} | Partsyaar.com`, description: p.intro } },
      overrideAccess: true,
    })
  }
  let day = 0
  for (const post of BLOG_POSTS) {
    const cover = await upload(payload, await bannerImage({ icon: post.icon }), `blog-${post.title}`, post.title)
    await payload.create({
      collection: 'blog-posts',
      data: {
        _status: 'published',
        title: post.title,
        excerpt: post.excerpt,
        body: richText(post.body),
        tags: post.tags,
        cover,
        publishedAt: new Date(Date.now() - (day += 6) * 86400000).toISOString(),
        meta: { title: post.title, description: post.excerpt },
      },
      overrideAccess: true,
    })
  }
  log(`${PAGES.length} pages, ${BLOG_POSTS.length} blog posts`)

  // ——— Coupons ———
  await payload.create({ collection: 'coupons', data: { code: 'YAAR10', type: 'percent', value: 10, maxDiscount: 2000, minOrder: 2000, firstOrderOnly: true, active: true }, overrideAccess: true })
  await payload.create({ collection: 'coupons', data: { code: 'FREESHIP', type: 'free_delivery', minOrder: 5000, active: true }, overrideAccess: true })
  await payload.create({ collection: 'coupons', data: { code: 'BRAKE500', type: 'fixed', value: 500, minOrder: 8000, active: true }, overrideAccess: true })

  // ——— Globals ———
  await payload.updateGlobal({
    slug: 'site-settings',
    overrideAccess: true,
    data: {
      storeName: 'Partsyaar.com',
      tagline: 'Genuine Parts. Locked In. Delivered Fast.',
      aboutBlurb: 'Genuine OEM and premium aftermarket car parts for Pakistan — with same-day delivery across Lahore and fitment you can trust.',
      footerText: `© ${new Date().getFullYear()} Partsyaar.com. All rights reserved.`,
      phone: '0300-1234567',
      whatsapp: '923001234567',
      emails: [{ label: 'Support', email: 'support@partsyaar.com' }, { label: 'Orders', email: 'orders@partsyaar.com' }],
      businessHours: 'Mon–Sat 9:00am – 9:00pm · Sun 11:00am – 6:00pm',
      stores: [
        {
          name: 'Partsyaar — Lahore Store',
          address: '[Shop no.], McLeod Road, Lahore',
          city: 'Lahore',
          phone: '0300-1234567',
          hours: 'Mon–Sat 9am – 9pm · Sun 11am – 6pm',
          mapUrl: 'https://maps.google.com/?q=McLeod+Road+Lahore',
          mapEmbedQuery: 'McLeod Road, Lahore',
        },
      ],
      social: { facebook: 'https://facebook.com/partsyaar', instagram: 'https://instagram.com/partsyaar', tiktok: 'https://tiktok.com/@partsyaar', youtube: '' },
    },
  })
  const LAHORE_AREAS = ['DHA', 'Gulberg', 'Johar Town', 'Model Town', 'Bahria Town', 'Cantt', 'Wapda Town', 'Valencia', 'Iqbal Town', 'Township', 'Garden Town', 'Faisal Town', 'Shadman', 'Samanabad', 'Allama Iqbal Town', 'Other']
  await payload.updateGlobal({
    slug: 'delivery-settings',
    overrideAccess: true,
    data: {
      sameDayEnabled: true,
      sameDayCutoff: '17:00',
      freeDeliveryThreshold: 10000,
      defaultFee: 350,
      defaultEta: '2–4 working days',
      codEnabled: true,
      codFee: 0,
      zones: [
        { city: 'Lahore', fee: 200, eta: 'Today — under 60 min in most areas', sameDay: true, areas: LAHORE_AREAS },
        { city: 'Karachi', fee: 350, eta: '2–3 working days', sameDay: false },
        { city: 'Islamabad', fee: 350, eta: '1–2 working days', sameDay: false },
        { city: 'Rawalpindi', fee: 350, eta: '1–2 working days', sameDay: false },
        { city: 'Faisalabad', fee: 300, eta: '1–2 working days', sameDay: false },
        { city: 'Gujranwala', fee: 300, eta: '1–2 working days', sameDay: false },
        { city: 'Sialkot', fee: 300, eta: '1–2 working days', sameDay: false },
        { city: 'Multan', fee: 350, eta: '2–3 working days', sameDay: false },
        { city: 'Peshawar', fee: 400, eta: '2–3 working days', sameDay: false },
        { city: 'Quetta', fee: 450, eta: '3–4 working days', sameDay: false },
      ],
      shippingSummary: 'Same-day delivery in Lahore when you order before the cutoff. 1–4 working days to other cities.',
      returnsSummary: '7-day easy returns on unused parts in original packaging. Wrong part? We collect it free.',
    },
  })
  await payload.updateGlobal({
    slug: 'announcement-bar',
    overrideAccess: true,
    data: {
      enabled: true,
      messages: [
        { text: '⚡ Same-day delivery across Lahore — order before 5pm', link: '/shipping' },
        { text: '✅ 100% Genuine Guarantee — or double your money back', link: '/genuine-guarantee' },
        { text: '🎁 10% off your first order with code YAAR10' },
      ],
    },
  })
  await payload.updateGlobal({
    slug: 'navigation',
    overrideAccess: true,
    data: {
      headerLinks: [
        { label: 'Deals', url: '/search?sale=1' },
        { label: 'Track Order', url: '/track' },
        { label: 'Workshops', url: '/b2b' },
        { label: 'Blog', url: '/blog' },
      ],
      footerColumns: [
        { title: 'Shop by Make', auto: 'makes', links: [] },
        { title: 'Categories', auto: 'categories', links: [] },
        {
          title: 'Customer Care',
          auto: 'none',
          links: [
            { label: 'Track your order', url: '/track' },
            { label: 'Shipping & Delivery', url: '/shipping' },
            { label: 'Returns & Refunds', url: '/returns' },
            { label: 'Warranty', url: '/warranty' },
            { label: 'FAQ', url: '/faq' },
            { label: 'Contact us', url: '/contact' },
          ],
        },
        {
          title: 'Company',
          auto: 'none',
          links: [
            { label: 'About us', url: '/about-us' },
            { label: 'Genuine Guarantee', url: '/genuine-guarantee' },
            { label: 'Workshops & B2B', url: '/b2b' },
            { label: 'Blog', url: '/blog' },
            { label: 'Store locator', url: '/stores' },
            { label: 'Privacy policy', url: '/privacy' },
            { label: 'Terms & conditions', url: '/terms' },
          ],
        },
      ],
    },
  })
  await payload.updateGlobal({
    slug: 'loyalty-settings',
    overrideAccess: true,
    data: {
      enabled: true,
      pointsPer100: 1,
      pointValue: 1,
      minRedeem: 100,
      maxRedeemPercent: 20,
      tiers: [
        { name: 'Bronze', minPoints: 0, multiplier: 1 },
        { name: 'Silver', minPoints: 1000, multiplier: 1.25 },
        { name: 'Gold', minPoints: 5000, multiplier: 1.5 },
      ],
    },
  })
  await payload.updateGlobal({ slug: 'popups', overrideAccess: true, data: { enabled: true, delaySeconds: 12, couponCode: 'YAAR10', collectEmail: true } })

  const homepageSections = [
    {
      blockType: 'hero',
      enabled: true,
      eyebrow: 'Over 5,000 genuine parts in stock',
      headline: 'Genuine Parts. Locked In. Delivered Fast.',
      highlight: 'Locked In.',
      subheadline: 'OEM and premium aftermarket parts for Toyota, Honda, Kia, Audi and more — delivered across Lahore in under an hour.',
      primaryCta: { label: 'Shop all parts', url: '/search' },
      secondaryCta: { label: 'Send part photo on WhatsApp', url: '#whatsapp' },
      show3D: true,
      showFinder: true,
    },
    {
      blockType: 'trustStrip',
      enabled: true,
      items: [
        { icon: 'truck', title: 'Same-Day Delivery', text: 'Under 1 hour in Lahore' },
        { icon: 'shield-check', title: '100% Genuine', text: 'Or double your money back' },
        { icon: 'badge-percent', title: 'Best Price Guarantee', text: 'Found it cheaper? We match it' },
        { icon: 'gift', title: 'Yaar Rewards', text: 'Earn points on every order' },
      ],
    },
    { blockType: 'shopByMake', enabled: true, heading: 'Shop by Make', subheading: 'Pick your car — we’ll show only parts that fit.', layout: 'horizontal' },
    {
      blockType: 'stats',
      enabled: true,
      items: [
        { value: 5000, suffix: '+', label: 'Parts in stock' },
        { value: 18, label: 'Car brands' },
        { value: 60, prefix: '<', suffix: ' min', label: 'Lahore delivery' },
        { value: 4.9, suffix: '★', label: 'Customer rating' },
      ],
    },
    { blockType: 'promoBanners', enabled: true },
    { blockType: 'popularCategories', enabled: true, heading: 'Popular Categories', subheading: 'From filters to full headlamps.' },
    { blockType: 'featureBanners', enabled: true },
    { blockType: 'dealOfTheDay', enabled: true, heading: 'Deal of the Day', product: pid('Iridium Spark Plugs (Set of 4)', '90919-01253'), note: 'While stocks last' },
    {
      blockType: 'productTabs',
      enabled: true,
      heading: 'Top Picks',
      tabs: [
        { label: 'Best Sellers', source: 'bestSellers', limit: 10 },
        { label: 'New Arrivals', source: 'newArrivals', limit: 10 },
        { label: 'On Sale', source: 'onSale', limit: 10 },
      ],
    },
    { blockType: 'deliveryStrip', enabled: true },
    { blockType: 'brandMarquee', enabled: true, heading: 'Brands We Trust' },
    { blockType: 'partRequest', enabled: true, showForm: true },
    { blockType: 'reviews', enabled: true, heading: 'What Our Customers Say', limit: 8 },
    { blockType: 'blogTeaser', enabled: true, heading: 'Maintenance Tips', limit: 3 },
    { blockType: 'newsletter', enabled: true, couponCode: 'YAAR10' },
  ]
  await payload.updateGlobal({ slug: 'homepage', overrideAccess: true, data: { _status: 'published', sections: homepageSections as never } })
  log('globals + homepage')

  // ——— Demo customers & orders ———
  const customer = await payload.create({
    collection: 'customers',
    data: { name: 'Ali Raza', phone: '0321-5551234', email: 'ali.demo@partsyaar.com', password: 'demo-password', type: 'retail', points: 240, addresses: [{ label: 'Home', city: 'Lahore', area: 'DHA', address: 'House 12, Street 4, Phase 5, DHA, Lahore' }] },
    overrideAccess: true,
  })
  await payload.create({
    collection: 'customers',
    data: { name: 'Bhatti Auto Workshop', phone: '0333-4440000', email: 'workshop.demo@partsyaar.com', password: 'demo-password', type: 'workshop', points: 0 },
    overrideAccess: true,
  })
  const line = (part: string, oem: string, quantity: number) => {
    const p = PRODUCTS.find((x) => x.part === part && x.oem === oem)!
    return { product: pid(part, oem), title: `${p.part} – ${p.vehicleLabel} – ${p.oem} – ${p.brand}`, sku: undefined, unitPrice: p.price, quantity }
  }
  const demoOrders = [
    { status: 'delivered', paymentStatus: 'paid', items: [line('Front Brake Pads', '04465-02220', 1), line('Oil Filter', '90915-YZZE1', 2)], customer: customer.id, customerName: 'Ali Raza', phone: '0321-5551234', city: 'Lahore', area: 'DHA', address: 'House 12, Street 4, Phase 5, DHA, Lahore', deliveryFee: 200 },
    { status: 'out_for_delivery', paymentStatus: 'unpaid', items: [line('Front Brake Pads', '45022-TBA-A01', 1)], customerName: 'Sana Iqbal', phone: '0300-7654321', city: 'Lahore', area: 'Gulberg', address: '45-B Main Boulevard, Gulberg III, Lahore', deliveryFee: 200, riderName: 'Imran', riderPhone: '0301-1112223' },
    { status: 'pending', paymentStatus: 'awaiting', paymentMethod: 'bank_transfer', items: [line('Front Brake Discs (Pair)', '8W0615301', 1), line('Front Brake Pads', '8W0698151', 1)], customerName: 'Faisal Hameed', phone: '0345-9876543', city: 'Islamabad', area: 'F-7', address: 'House 3, Street 22, F-7/2, Islamabad', deliveryFee: 0 },
  ]
  for (const o of demoOrders) {
    await payload.create({ collection: 'orders', data: { paymentMethod: 'cod', ...o } as never, overrideAccess: true, context: ctx })
  }
  log('demo customers + orders')
  log('done ✅')
}

const reset = process.argv.includes('--reset') || process.env.SEED_RESET === '1'
const payload = await getPayload({ config })
await seed(payload, { reset })
process.exit(0)

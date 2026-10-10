import 'server-only'

import type { Payload, Where } from 'payload'

import type { Coupon, Customer, Product } from '@/payload-types'

import { deliveryEta, deliveryFee, type DeliveryConfig } from '../delivery'
import { mediaUrl } from '../media'
import { priceFor } from '../product'
import type { CartLineInput, Quote, QuoteLine } from './types'

type PriceInput = {
  items: CartLineInput[]
  city?: string | null
  couponCode?: string | null
  paymentMethod?: string | null
  phone?: string | null
  customer?: Customer | null
  /** Shopper ticked "use my Yaar Points" (logged-in customers only). */
  usePoints?: boolean
}

/** Coupon rules: active, dates, minimum, usage limit, first order only. */
export async function checkCoupon(
  payload: Payload,
  code: string,
  subtotal: number,
  who: { phone?: string | null; customer?: Customer | null },
): Promise<{ coupon: Coupon | null; message: string | null }> {
  const { docs } = await payload.find({ collection: 'coupons', where: { code: { equals: code.trim().toUpperCase() } }, limit: 1, overrideAccess: true, depth: 0 })
  const c = docs[0]
  if (!c || !c.active) return { coupon: null, message: 'This code isn’t valid.' }
  const now = Date.now()
  if (c.startsAt && Date.parse(c.startsAt) > now) return { coupon: null, message: 'This code isn’t active yet.' }
  if (c.endsAt && Date.parse(c.endsAt) < now) return { coupon: null, message: 'This code has expired.' }
  if (c.usageLimit && (c.usedCount ?? 0) >= c.usageLimit) return { coupon: null, message: 'This code has been fully used.' }
  if (c.minOrder && subtotal < c.minOrder) return { coupon: null, message: `Add Rs ${(c.minOrder - subtotal).toLocaleString('en-PK')} more to use this code.` }
  if (c.firstOrderOnly) {
    const or: Where[] = [
      ...(who.customer ? [{ customer: { equals: who.customer.id } }] : []),
      ...(who.phone ? [{ phone: { equals: who.phone } }] : []),
    ]
    if (or.length) {
      const prior = await payload.count({ collection: 'orders', where: { and: [{ or }, { status: { not_equals: 'cancelled' } }] }, overrideAccess: true })
      if (prior.totalDocs > 0) return { coupon: null, message: 'This code is for first orders only.' }
    }
  }
  return { coupon: c, message: null }
}

/**
 * Prices a cart from live data. Never trusts client prices: every product is re-read
 * (respecting field access, so workshop prices only apply to workshop accounts),
 * quantities are clamped to stock, then bundle, coupon, delivery and COD fees apply.
 */
export async function priceCart(payload: Payload, input: PriceInput): Promise<Quote> {
  const warnings: string[] = []
  const wanted = new Map<number, number>()
  for (const i of input.items) {
    if (!Number.isInteger(i.productId) || i.quantity < 1) continue
    wanted.set(i.productId, Math.min(99, (wanted.get(i.productId) ?? 0) + Math.floor(i.quantity)))
  }
  const ids = [...wanted.keys()].slice(0, 100)
  const { docs } = ids.length
    ? await payload.find({
        collection: 'products',
        where: { id: { in: ids } },
        overrideAccess: false,
        user: input.customer ? { ...input.customer, collection: 'customers' } : undefined,
        depth: 1,
        limit: 100,
        pagination: false,
      })
    : { docs: [] as Product[] }

  const lines: QuoteLine[] = []
  for (const id of ids) {
    const p = docs.find((d) => d.id === id)
    if (!p) {
      warnings.push('An item in your cart is no longer available and was removed.')
      continue
    }
    const requested = wanted.get(id)!
    const quantity = Math.min(requested, Math.max(0, p.stock))
    if (quantity < requested) warnings.push(quantity ? `Only ${quantity} × ${p.title.split(' – ')[0]} in stock — quantity updated.` : `${p.title.split(' – ')[0]} just sold out.`)
    if (!quantity) continue
    const unitPrice = priceFor(p, input.customer)
    lines.push({
      productId: p.id,
      title: p.title,
      slug: p.slug ?? '',
      sku: p.sku,
      image: mediaUrl(p.images?.[0], 'thumb'),
      unitPrice,
      quantity,
      requested,
      lineTotal: unitPrice * quantity,
      bundleDiscount: 0,
      stock: p.stock,
    })
  }

  // Bundles: when a product and its "bought together" items are all in the cart,
  // its bundle discount applies once to one unit of each item in the set.
  const inCart = new Set(lines.map((l) => l.productId))
  const discounted = new Set<number>()
  for (const p of docs) {
    const set = (p.boughtTogether ?? []).map((b) => (typeof b === 'object' ? b.id : b)).filter((id) => inCart.has(id))
    const pct = p.bundleDiscountPercent ?? 0
    if (!pct || !set.length || !inCart.has(p.id)) continue
    for (const id of [p.id, ...set]) {
      if (discounted.has(id)) continue
      const line = lines.find((l) => l.productId === id)!
      line.bundleDiscount = Math.round((line.unitPrice * pct) / 100)
      discounted.add(id)
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const bundleDiscount = lines.reduce((s, l) => s + l.bundleDiscount, 0)
  const afterBundle = subtotal - bundleDiscount

  const delivery = (await payload.findGlobal({ slug: 'delivery-settings', overrideAccess: true })) as DeliveryConfig
  let fee = lines.length ? deliveryFee(delivery, input.city, afterBundle) : 0

  let couponDiscount = 0
  let couponMessage: string | null = null
  let couponValid = false
  const code = input.couponCode?.trim().toUpperCase() || null
  if (code && lines.length) {
    const { coupon, message } = await checkCoupon(payload, code, afterBundle, { phone: input.phone, customer: input.customer })
    couponMessage = message
    if (coupon) {
      couponValid = true
      if (coupon.type === 'percent') {
        couponDiscount = Math.round((afterBundle * (coupon.value ?? 0)) / 100)
        if (coupon.maxDiscount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount)
        couponMessage = `${coupon.value}% off applied`
      } else if (coupon.type === 'fixed') {
        couponDiscount = Math.min(afterBundle, coupon.value ?? 0)
        couponMessage = `Rs ${couponDiscount.toLocaleString('en-PK')} off applied`
      } else {
        fee = 0
        couponMessage = 'Free delivery applied'
      }
    }
  }

  const codFee = input.paymentMethod === 'cod' && lines.length ? (delivery.codFee ?? 0) : 0
  const beforePoints = Math.max(0, afterBundle - couponDiscount + fee + codFee)

  // Yaar Points: worth `pointValue` Rs each, capped at maxRedeemPercent of the order.
  let pointsRedeemed = 0
  let pointsUsed = 0
  let pointsAvailable = 0
  const loyalty = await payload.findGlobal({ slug: 'loyalty-settings', overrideAccess: true })
  if (input.customer && loyalty.enabled && lines.length) {
    pointsAvailable = input.customer.points ?? 0
    const value = loyalty.pointValue ?? 1
    if (input.usePoints && pointsAvailable >= (loyalty.minRedeem ?? 0) && value > 0) {
      const cap = Math.floor((beforePoints * (loyalty.maxRedeemPercent ?? 20)) / 100)
      pointsUsed = Math.min(pointsAvailable, Math.floor(cap / value))
      pointsRedeemed = Math.round(pointsUsed * value)
    }
  }
  const total = Math.max(0, beforePoints - pointsRedeemed)
  return {
    lines,
    subtotal,
    bundleDiscount,
    couponCode: couponValid ? code : null,
    couponDiscount,
    couponMessage,
    couponValid,
    deliveryFee: fee,
    codFee,
    pointsRedeemed,
    pointsUsed,
    pointsAvailable,
    pointsMin: loyalty.minRedeem ?? 0,
    total,
    eta: deliveryEta(delivery, input.city),
    warnings,
  }
}

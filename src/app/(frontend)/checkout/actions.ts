'use server'

import { randomBytes } from 'crypto'
import { commitTransaction, createLocalReq, initTransaction, killTransaction } from 'payload'
import { z } from 'zod'

import { priceCart } from '@/lib/checkout/pricing'
import type { CartLineInput, Quote } from '@/lib/checkout/types'
import { newOrderAlertEmail, orderConfirmationEmail } from '@/lib/email/templates'
import { ORDER_FLOW, statusLabel } from '@/lib/orders/status'
import { availablePayments, getAdapter } from '@/lib/payments'
import { getPayloadClient } from '@/lib/payload'
import { rateLimit } from '@/lib/rate-limit'
import { getCustomer } from '@/lib/session'
import { absoluteUrl } from '@/lib/url'
import { normalizePkPhone } from '@/lib/whatsapp'

const itemsSchema = z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(99) })).max(100)

/** Live totals for the cart and checkout pages (re-priced from the database). */
export async function quoteCart(input: { items: CartLineInput[]; city?: string | null; couponCode?: string | null; paymentMethod?: string | null; phone?: string | null; usePoints?: boolean }): Promise<Quote> {
  const items = itemsSchema.safeParse(input.items)
  const payload = await getPayloadClient()
  const customer = await getCustomer()
  return priceCart(payload, {
    items: items.success ? items.data : [],
    city: input.city?.slice(0, 60),
    couponCode: input.couponCode?.slice(0, 40),
    paymentMethod: input.paymentMethod,
    phone: input.phone ? normalizePkPhone(input.phone) : null,
    customer,
    usePoints: Boolean(input.usePoints),
  })
}

const checkoutSchema = z.object({
  items: z.string().transform((v, ctx) => {
    try {
      return itemsSchema.parse(JSON.parse(v))
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Your cart is empty' })
      return z.NEVER
    }
  }),
  name: z.string().trim().min(2, 'Please enter your full name').max(80),
  phone: z.string().transform((v, ctx) => {
    const n = normalizePkPhone(v)
    if (!n) ctx.addIssue({ code: 'custom', message: 'Enter a mobile number like 0300-1234567' })
    return n ?? ''
  }),
  email: z.union([z.literal(''), z.string().trim().toLowerCase().email('Enter a valid email or leave it empty')]).optional(),
  city: z.string().trim().min(2, 'Choose your city').max(60),
  otherCity: z.string().trim().max(60).optional(),
  area: z.string().trim().max(80).optional(),
  address: z.string().trim().min(8, 'Please enter your full address (house, street, area)').max(400),
  paymentMethod: z.string().min(2, 'Choose a payment method'),
  couponCode: z.string().trim().max(40).optional(),
  note: z.string().trim().max(500).optional(),
  vehicle: z.string().trim().max(120).optional(),
  usePoints: z.string().optional(),
  company: z.string().max(0).optional(),
})

export type CheckoutResult =
  | { ok: true; orderNumber: string; token: string; redirect?: string }
  | { ok: false; message: string; errors?: Record<string, string>; quote?: Quote }

export async function placeOrder(form: FormData): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(Object.fromEntries(form))
  if (!parsed.success) {
    return { ok: false, message: 'Please fix the highlighted fields.', errors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) }
  }
  if (!(await rateLimit('order', 5))) return { ok: false, message: 'Too many orders from this connection — please wait a minute.' }
  const data = parsed.data
  const city = data.city === 'Other' ? data.otherCity || 'Other' : data.city

  const payload = await getPayloadClient()
  const customer = await getCustomer()
  const [paymentSettings, delivery] = await Promise.all([
    payload.findGlobal({ slug: 'payment-settings', overrideAccess: true }),
    payload.findGlobal({ slug: 'delivery-settings', overrideAccess: true }),
  ])
  const allowed = availablePayments(paymentSettings, delivery.codFee ?? 0, delivery.codEnabled !== false)
  if (!allowed.some((p) => p.id === data.paymentMethod)) return { ok: false, message: 'That payment method isn’t available.', errors: { paymentMethod: 'Choose another payment method' } }

  const quote = await priceCart(payload, { items: data.items, city, couponCode: data.couponCode, paymentMethod: data.paymentMethod, phone: data.phone, customer, usePoints: data.usePoints === '1' })
  if (!quote.lines.length) return { ok: false, message: 'Your cart is empty or the items sold out.', quote }
  if (quote.lines.some((l) => l.quantity < l.requested)) return { ok: false, message: 'Some quantities changed because of stock — please review your order.', quote }
  if (data.couponCode && !quote.couponValid) return { ok: false, message: quote.couponMessage ?? 'Coupon not valid', errors: { couponCode: quote.couponMessage ?? 'Not valid' }, quote }

  const token = randomBytes(18).toString('base64url')
  const req = await createLocalReq({}, payload)
  await initTransaction(req)
  let order
  try {
    // Re-check and decrement stock inside the transaction so two shoppers can't buy the last unit.
    for (const line of quote.lines) {
      const p = await payload.findByID({ collection: 'products', id: line.productId, depth: 0, overrideAccess: true, req })
      if (p.stock < line.quantity) throw new Error(`STOCK:${p.title.split(' – ')[0]}`)
      await payload.update({
        collection: 'products',
        id: p.id,
        data: { stock: p.stock - line.quantity, salesCount: (p.salesCount ?? 0) + line.quantity },
        overrideAccess: true,
        context: { skipAudit: true },
        req,
      })
    }
    order = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      req,
      data: {
        status: 'pending',
        paymentStatus: data.paymentMethod === 'cod' ? 'unpaid' : 'awaiting',
        paymentMethod: data.paymentMethod as 'cod',
        accessToken: token,
        customer: customer?.id,
        customerName: data.name,
        phone: data.phone,
        email: data.email || undefined,
        city,
        area: data.area,
        address: data.address,
        vehicle: data.vehicle,
        customerNote: data.note,
        items: quote.lines.map((l) => ({ product: l.productId, title: l.title, sku: l.sku, unitPrice: l.unitPrice, quantity: l.quantity })),
        deliveryFee: quote.deliveryFee,
        codFee: quote.codFee,
        couponCode: quote.couponCode ?? undefined,
        discount: quote.bundleDiscount + quote.couponDiscount,
        pointsRedeemed: quote.pointsRedeemed,
        pointsUsed: quote.pointsUsed,
        deliveryEta: quote.eta,
      },
    })
    if (customer && quote.pointsUsed) {
      const fresh = await payload.findByID({ collection: 'customers', id: customer.id, depth: 0, overrideAccess: true, req })
      if ((fresh.points ?? 0) < quote.pointsUsed) throw new Error('POINTS')
      await payload.update({ collection: 'customers', id: customer.id, data: { points: (fresh.points ?? 0) - quote.pointsUsed }, overrideAccess: true, req })
    }
    if (quote.couponCode) {
      const { docs } = await payload.find({ collection: 'coupons', where: { code: { equals: quote.couponCode } }, limit: 1, overrideAccess: true, req })
      if (docs[0]) await payload.update({ collection: 'coupons', id: docs[0].id, data: { usedCount: (docs[0].usedCount ?? 0) + 1 }, overrideAccess: true, req })
    }
    await commitTransaction(req)
  } catch (err) {
    await killTransaction(req)
    const known = err instanceof Error && (err.message.startsWith('STOCK:') || err.message === 'POINTS')
    const msg =
      err instanceof Error && err.message.startsWith('STOCK:')
        ? `Sorry — ${err.message.slice(6)} just sold out. Please review your cart.`
        : err instanceof Error && err.message === 'POINTS'
          ? 'Your points balance changed — please review your order.'
          : 'We couldn’t place your order. Please try again or order on WhatsApp.'
    if (!known) payload.logger.error({ err }, 'placeOrder failed')
    return { ok: false, message: msg }
  }

  // Emails after commit; failures never block the order.
  const adapter = getAdapter(order.paymentMethod)
  const site = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
  const trackUrl = absoluteUrl(`/track?order=${order.orderNumber}`)
  const sends: Promise<unknown>[] = []
  if (order.email) {
    const mail = orderConfirmationEmail(order, { trackUrl, paymentInstructions: adapter?.instructions(paymentSettings) })
    sends.push(payload.sendEmail({ to: order.email, ...mail }))
  }
  const staffTo = site.orderNotificationEmails?.length ? site.orderNotificationEmails : (site.emails ?? []).map((e) => e.email)
  if (staffTo.length) sends.push(payload.sendEmail({ to: staffTo, ...newOrderAlertEmail(order, absoluteUrl(`/admin/collections/orders/${order.id}`)) }))
  await Promise.allSettled(sends)

  // Online gateways: /pay builds the signed request and sends the shopper to the gateway.
  const redirect = adapter?.start ? `/pay/${order.orderNumber}?t=${token}` : undefined
  return { ok: true, orderNumber: order.orderNumber!, token, redirect }
}

// ——— Order tracking ———
export type TrackResult =
  | { ok: false; message: string }
  | {
      ok: true
      orderNumber: string
      status: string
      statusLabel: string
      createdAt: string
      eta: string | null
      total: number
      rider: string | null
      steps: Array<{ status: string; label: string; at: string | null; done: boolean }>
      cancelled: boolean
    }

export async function trackOrder(_: TrackResult | null, form: FormData): Promise<TrackResult> {
  const orderNumber = String(form.get('order') ?? '').trim().toUpperCase()
  const phone = normalizePkPhone(String(form.get('phone') ?? ''))
  if (!/^PY-\d{6,}$/.test(orderNumber) || !phone) return { ok: false, message: 'Enter your order number (e.g. PY-100245) and the phone number used at checkout.' }
  if (!(await rateLimit('track', 10))) return { ok: false, message: 'Too many attempts — please wait a minute.' }
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'orders', where: { and: [{ orderNumber: { equals: orderNumber } }, { phone: { equals: phone } }] }, limit: 1, overrideAccess: true, depth: 0 })
  const o = docs[0]
  if (!o) return { ok: false, message: 'We couldn’t find an order with that number and phone.' }
  const reached = new Map((o.timeline ?? []).map((t) => [t.status, t.at ?? null]))
  const idx = ORDER_FLOW.indexOf(o.status as (typeof ORDER_FLOW)[number])
  return {
    ok: true,
    orderNumber: o.orderNumber!,
    status: o.status,
    statusLabel: statusLabel(o.status),
    createdAt: o.createdAt,
    eta: o.deliveryEta ?? null,
    total: o.total ?? 0,
    rider: o.status === 'out_for_delivery' && o.riderName ? `${o.riderName}${o.riderPhone ? ` · ${o.riderPhone}` : ''}` : null,
    cancelled: o.status === 'cancelled' || o.status === 'returned',
    steps: ORDER_FLOW.map((s, i) => ({ status: s, label: statusLabel(s), at: reached.get(s) ?? null, done: idx >= i })),
  }
}

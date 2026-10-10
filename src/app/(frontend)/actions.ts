'use server'

import type { Where } from 'payload'
import { z } from 'zod'

import { getPayloadClient } from '@/lib/payload'
import { rateLimit } from '@/lib/rate-limit'
import { normalizePkPhone } from '@/lib/whatsapp'

export type FormState = { ok: boolean; message: string; errors?: Record<string, string> }

const fieldErrors = (e: z.ZodError) => Object.fromEntries(e.issues.map((i) => [String(i.path[0]), i.message]))

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email'),
  source: z.string().max(40).optional(),
  // Honeypot: real people leave it empty.
  company: z.string().max(0).optional(),
})

export async function subscribe(_: FormState | null, form: FormData): Promise<FormState> {
  const parsed = subscribeSchema.safeParse(Object.fromEntries(form))
  if (!parsed.success) return { ok: false, message: 'Please check the form.', errors: fieldErrors(parsed.error) }
  if (!(await rateLimit('subscribe', 5))) return { ok: false, message: 'Too many attempts — please try again in a minute.' }
  const payload = await getPayloadClient()
  const existing = await payload.find({ collection: 'subscribers', where: { email: { equals: parsed.data.email } }, limit: 1, overrideAccess: true })
  if (!existing.docs.length) {
    await payload.create({ collection: 'subscribers', data: { email: parsed.data.email, source: parsed.data.source ?? 'footer' }, overrideAccess: true })
  }
  return { ok: true, message: 'You’re in! Check your inbox for your discount code.' }
}

const partRequestSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  phone: z.string().transform((v, ctx) => {
    const n = normalizePkPhone(v)
    if (!n) ctx.addIssue({ code: 'custom', message: 'Use a mobile number like 0300-1234567' })
    return n ?? ''
  }),
  vehicle: z.string().trim().max(120).optional(),
  vin: z.string().trim().max(40).optional(),
  partName: z.string().trim().max(120).optional(),
  message: z.string().trim().max(1000).optional(),
  company: z.string().max(0).optional(),
})

export async function requestPart(_: FormState | null, form: FormData): Promise<FormState> {
  const parsed = partRequestSchema.safeParse(Object.fromEntries(form))
  if (!parsed.success) return { ok: false, message: 'Please check the form.', errors: fieldErrors(parsed.error) }
  if (!(await rateLimit('part-request', 3))) return { ok: false, message: 'Too many requests — please try again in a minute.' }
  const payload = await getPayloadClient()
  const { company: _honeypot, ...data } = parsed.data

  let photo: number | undefined
  const file = form.get('photo')
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) return { ok: false, message: 'Photo must be an image under 8 MB.' }
    const media = await payload.create({
      collection: 'media',
      data: { alt: `Part request photo from ${data.name}` },
      file: { data: Buffer.from(await file.arrayBuffer()), mimetype: file.type, name: file.name || 'part.jpg', size: file.size },
      overrideAccess: true,
    })
    photo = media.id
  }
  await payload.create({ collection: 'part-requests', data: { ...data, photo, status: 'new' }, overrideAccess: true })
  return { ok: true, message: 'Thanks! Our parts expert will call or WhatsApp you shortly.' }
}

const alertSchema = z.object({
  productId: z.coerce.number().int().positive(),
  type: z.enum(['back_in_stock', 'price_drop']),
  contact: z
    .string()
    .trim()
    .min(5, 'Enter your email or mobile number')
    .max(120)
    .refine((v) => z.string().email().safeParse(v).success || normalizePkPhone(v) !== null, 'Enter a valid email or mobile number'),
  company: z.string().max(0).optional(),
})

export async function requestProductAlert(_: FormState | null, form: FormData): Promise<FormState> {
  const parsed = alertSchema.safeParse(Object.fromEntries(form))
  if (!parsed.success) return { ok: false, message: 'Please check the form.', errors: fieldErrors(parsed.error) }
  if (!(await rateLimit('alert', 5))) return { ok: false, message: 'Too many requests — try again in a minute.' }
  const payload = await getPayloadClient()
  const product = await payload.findByID({ collection: 'products', id: parsed.data.productId, depth: 0, overrideAccess: false }).catch(() => null)
  if (!product) return { ok: false, message: 'Product not found.' }
  const contact = normalizePkPhone(parsed.data.contact) ?? parsed.data.contact.toLowerCase()
  await payload.create({
    collection: 'stock-alerts',
    data: { product: product.id, type: parsed.data.type, contact, priceAtRequest: product.price },
    overrideAccess: true,
  })
  return { ok: true, message: parsed.data.type === 'back_in_stock' ? 'We’ll let you know the moment it’s back.' : 'We’ll tell you when the price drops.' }
}

const reviewSchema = z.object({
  productId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1, 'Choose a star rating').max(5),
  title: z.string().trim().min(3, 'Add a short title').max(80),
  text: z.string().trim().min(10, 'Tell us a little more (10+ characters)').max(1500),
  name: z.string().trim().min(2, 'Your name').max(60),
  city: z.string().trim().max(40).optional(),
  orderNumber: z.string().trim().max(20).optional(),
  phone: z.string().trim().max(20).optional(),
  company: z.string().max(0).optional(),
})

/** Customer review (held for approval). "Verified buyer" when a delivered order contains the product. */
export async function submitReview(_: FormState | null, form: FormData): Promise<FormState> {
  const parsed = reviewSchema.safeParse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string')))
  if (!parsed.success) return { ok: false, message: 'Please check the form.', errors: fieldErrors(parsed.error) }
  if (!(await rateLimit('review', 3, 10 * 60_000))) return { ok: false, message: 'Too many reviews — please try again later.' }
  const payload = await getPayloadClient()
  const d = parsed.data
  const product = await payload.findByID({ collection: 'products', id: d.productId, depth: 0, overrideAccess: false }).catch(() => null)
  if (!product) return { ok: false, message: 'Product not found.' }

  const { getCustomer } = await import('@/lib/session')
  const customer = await getCustomer()
  const phone = d.phone ? normalizePkPhone(d.phone) : null
  const or: Where[] = [
    ...(customer ? [{ customer: { equals: customer.id } }] : []),
    ...(d.orderNumber && phone ? [{ and: [{ orderNumber: { equals: d.orderNumber.toUpperCase() } }, { phone: { equals: phone } }] }] : []),
  ]
  let verified = false
  if (or.length) {
    const orders = await payload.find({ collection: 'orders', where: { and: [{ status: { equals: 'delivered' } }, { or }] }, depth: 0, limit: 50, overrideAccess: true })
    verified = orders.docs.some((o) => (o.items ?? []).some((i) => (typeof i.product === 'object' ? i.product?.id : i.product) === product.id))
  }

  const photos: number[] = []
  for (const f of form.getAll('photos').slice(0, 3)) {
    if (!(f instanceof File) || !f.size) continue
    if (!f.type.startsWith('image/') || f.size > 5 * 1024 * 1024) return { ok: false, message: 'Photos must be images under 5 MB.' }
    const media = await payload.create({
      collection: 'media',
      data: { alt: `Customer photo: ${product.title.split(' – ')[0]}` },
      file: { data: Buffer.from(await f.arrayBuffer()), mimetype: f.type, name: f.name || 'review.jpg', size: f.size },
      overrideAccess: true,
    })
    photos.push(media.id)
  }
  await payload.create({
    collection: 'reviews',
    data: { product: product.id, customer: customer?.id, name: d.name, city: d.city, rating: d.rating, title: d.title, text: d.text, photos, verifiedBuyer: verified, approved: false },
    overrideAccess: true,
  })
  return { ok: true, message: 'Thank you! Your review will appear after a quick check.' }
}

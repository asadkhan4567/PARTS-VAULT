'use server'

import { z } from 'zod'

import { getPayloadClient } from '@/lib/payload'
import { rateLimit } from '@/lib/rate-limit'
import { getCustomer } from '@/lib/session'
import type { Vehicle } from '@/lib/vehicle'

/** Merge this device's wishlist into the account and return the combined list. */
export async function syncWishlist(localIds: number[]): Promise<number[] | null> {
  const customer = await getCustomer()
  if (!customer) return null
  const ids = z.array(z.number().int().positive()).max(100).safeParse(localIds)
  const server = (customer.wishlist ?? []).map((w) => (typeof w === 'object' ? w.id : w))
  const merged = [...new Set([...(ids.success ? ids.data : []), ...server])].slice(0, 100)
  if (merged.length !== server.length || merged.some((id, i) => id !== server[i])) {
    const payload = await getPayloadClient()
    // Drop ids of deleted/unpublished products.
    const { docs } = await payload.find({ collection: 'products', where: { id: { in: merged } }, depth: 0, limit: 100, overrideAccess: false, select: { slug: true } })
    const valid = merged.filter((id) => docs.some((d) => d.id === id))
    await payload.update({ collection: 'customers', id: customer.id, data: { wishlist: valid }, overrideAccess: true })
    return valid
  }
  return merged
}

/** Replace the account wishlist (after a toggle on any device). */
export async function saveWishlist(ids: number[]): Promise<void> {
  const customer = await getCustomer()
  const parsed = z.array(z.number().int().positive()).max(100).safeParse(ids)
  if (!customer || !parsed.success) return
  const payload = await getPayloadClient()
  await payload.update({ collection: 'customers', id: customer.id, data: { wishlist: parsed.data }, overrideAccess: true }).catch(() => undefined)
}

const vehicleSchema = z.object({
  makeId: z.number().int(),
  makeName: z.string().max(60),
  makeSlug: z.string().max(80),
  modelName: z.string().max(60),
  modelSlug: z.string().max(80),
  generationId: z.number().int(),
  generationLabel: z.string().max(120),
  year: z.number().int().min(1950).max(2100),
})

/** Merge this device's garage with the account garage; returns the combined list (max 6). */
export async function syncGarage(local: Vehicle[]): Promise<Vehicle[] | null> {
  const customer = await getCustomer()
  if (!customer) return null
  const parsed = z.array(vehicleSchema).max(12).safeParse(local)
  const payload = await getPayloadClient()
  const fromServer: Vehicle[] = []
  for (const row of customer.garage ?? []) {
    const gen = typeof row.model === 'object' ? row.model : await payload.findByID({ collection: 'models', id: row.model, depth: 1, overrideAccess: true }).catch(() => null)
    const make = gen && typeof gen.make === 'object' ? gen.make : null
    if (!gen || !make) continue
    fromServer.push({ makeId: make.id, makeName: make.name, makeSlug: make.slug ?? '', modelName: gen.name, modelSlug: gen.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), generationId: gen.id, generationLabel: gen.label ?? gen.name, year: row.year })
  }
  const all = [...(parsed.success ? parsed.data : []), ...fromServer]
  const merged = all.filter((v, i) => all.findIndex((w) => w.generationId === v.generationId && w.year === v.year) === i).slice(0, 6)
  await payload.update({
    collection: 'customers',
    id: customer.id,
    data: { garage: merged.map((v) => ({ make: v.makeId, model: v.generationId, year: v.year })) },
    overrideAccess: true,
  })
  return merged
}

const workshopSchema = z.object({
  businessName: z.string().trim().min(2, 'Workshop name').max(100),
  city: z.string().trim().min(2).max(60),
  details: z.string().trim().max(500).optional(),
})

/** "Apply for workshop prices" — staff approve by switching the account type to Workshop. */
export async function applyForWorkshop(_: { ok: boolean; message: string } | null, form: FormData) {
  const customer = await getCustomer()
  if (!customer) return { ok: false, message: 'Please log in first.' }
  const parsed = workshopSchema.safeParse(Object.fromEntries(form))
  if (!parsed.success) return { ok: false, message: 'Please add your workshop name and city.' }
  if (!(await rateLimit('workshop', 3))) return { ok: false, message: 'Please try again in a minute.' }
  const payload = await getPayloadClient()
  await payload.update({
    collection: 'customers',
    id: customer.id,
    data: { workshopApplication: `${parsed.data.businessName} — ${parsed.data.city}${parsed.data.details ? `\n${parsed.data.details}` : ''}`, workshopRequestedAt: new Date().toISOString() },
    overrideAccess: true,
  })
  await payload.create({
    collection: 'part-requests',
    data: { name: `${customer.name} (workshop application)`, phone: customer.phone, partName: 'Workshop account', message: `${parsed.data.businessName}, ${parsed.data.city}. ${parsed.data.details ?? ''}`, status: 'new' },
    overrideAccess: true,
  })
  return { ok: true, message: 'Thanks! We’ll verify your workshop and switch on trade prices, usually within one working day.' }
}

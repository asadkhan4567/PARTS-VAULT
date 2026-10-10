import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

/**
 * Security rules from the brief: cost price never reaches the public, staff roles are
 * enforced, and private collections stay private. Runs against the real database.
 */
let payload: Payload
const created: { users: number[]; products: number[] } = { users: [], products: [] }
const stamp = Date.now()
let seq = 0

async function staffUser(role: 'owner' | 'manager' | 'staff') {
  const u = await payload.create({
    collection: 'users',
    data: { email: `${role}-${stamp}-${seq++}@partsyaar.test`, password: 'pw-123456', name: role, role },
    overrideAccess: true,
  })
  created.users.push(u.id)
  return { ...u, collection: 'users' as const }
}

describe('access control', () => {
  let productId: number

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const brand = await payload.create({ collection: 'part-brands', data: { name: `Test Brand ${stamp}` }, overrideAccess: true })
    const category = await payload.create({ collection: 'categories', data: { name: `Test Cat ${stamp}` }, overrideAccess: true })
    const p = await payload.create({
      collection: 'products',
      overrideAccess: true,
      data: {
        _status: 'published',
        title: `Access Test Pads ${stamp}`,
        sku: `TEST-${stamp}`,
        price: 1000,
        workshopPrice: 900,
        costPrice: 600,
        stock: 5,
        partBrand: brand.id,
        categories: [category.id],
        condition: 'genuine',
      },
    })
    productId = p.id
    created.products.push(p.id)
  })

  afterAll(async () => {
    for (const id of created.products) await payload.delete({ collection: 'products', id, overrideAccess: true })
    for (const id of created.users) await payload.delete({ collection: 'users', id, overrideAccess: true })
    await payload.delete({ collection: 'part-brands', where: { name: { equals: `Test Brand ${stamp}` } }, overrideAccess: true })
    await payload.delete({ collection: 'categories', where: { name: { equals: `Test Cat ${stamp}` } }, overrideAccess: true })
  })

  it('hides cost and workshop prices from the public', async () => {
    const doc = await payload.findByID({ collection: 'products', id: productId, overrideAccess: false })
    expect(doc.price).toBe(1000)
    expect(doc.costPrice).toBeUndefined()
    expect(doc.workshopPrice).toBeUndefined()
  })

  it('shows cost price to managers but not to staff', async () => {
    const manager = await staffUser('manager')
    const staff = await staffUser('staff')
    const asManager = await payload.findByID({ collection: 'products', id: productId, overrideAccess: false, user: manager })
    const asStaff = await payload.findByID({ collection: 'products', id: productId, overrideAccess: false, user: staff })
    expect(asManager.costPrice).toBe(600)
    expect(asStaff.costPrice).toBeUndefined()
  })

  it('lets staff change stock but not the price', async () => {
    const staff = await staffUser('staff')
    const updated = await payload.update({
      collection: 'products',
      id: productId,
      data: { price: 1, stock: 9 },
      overrideAccess: false,
      user: staff,
    })
    expect(updated.stock).toBe(9)
    expect(updated.price).toBe(1000)
  })

  it('records price changes in the audit log', async () => {
    const manager = await staffUser('manager')
    await payload.update({ collection: 'products', id: productId, data: { price: 1100 }, overrideAccess: false, user: manager })
    const logs = await payload.find({
      collection: 'audit-logs',
      where: { and: [{ collectionSlug: { equals: 'products' } }, { documentId: { equals: String(productId) } }] },
      overrideAccess: true,
    })
    const priceLog = logs.docs.find((l) => (l.changes as Record<string, unknown>)?.price)
    expect(priceLog?.changes).toMatchObject({ price: { from: 1000, to: 1100 } })
    expect(priceLog?.userLabel).toBe('manager')
  })

  it('keeps orders, coupons and the audit log private', async () => {
    for (const collection of ['orders', 'coupons', 'audit-logs', 'customers', 'users'] as const) {
      await expect(payload.find({ collection, overrideAccess: false })).rejects.toThrow()
    }
  })

  it('never exposes payment secrets publicly', async () => {
    const settings = await payload.findGlobal({ slug: 'payment-settings', overrideAccess: false })
    expect(settings.card?.secretKey).toBeUndefined()
    expect(settings.jazzcash?.integritySalt).toBeUndefined()
  })
})

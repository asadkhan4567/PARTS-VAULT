import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { priceCart } from '@/lib/checkout/pricing'

let payload: Payload
const stamp = Date.now()
const made: Array<[string, number]> = []

async function make<T extends { id: number }>(collection: Parameters<Payload['create']>[0]['collection'], data: Record<string, unknown>): Promise<T> {
  const doc = (await payload.create({ collection, data: data as never, overrideAccess: true, context: { skipAudit: true } })) as unknown as T
  made.push([collection, doc.id])
  return doc
}

describe('priceCart', () => {
  let a: { id: number }
  let b: { id: number }

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const brand = await make<{ id: number }>('part-brands', { name: `PB ${stamp}` })
    const cat = await make<{ id: number }>('categories', { name: `PC ${stamp}` })
    const base = { _status: 'published', partBrand: brand.id, categories: [cat.id], condition: 'genuine' }
    b = await make('products', { ...base, title: `Item B ${stamp}`, sku: `B-${stamp}`, price: 1000, stock: 10 })
    a = await make('products', { ...base, title: `Item A ${stamp}`, sku: `A-${stamp}`, price: 4000, workshopPrice: 3500, stock: 2, boughtTogether: [b.id], bundleDiscountPercent: 10 })
    await make('coupons', { code: `TEN${stamp}`, type: 'percent', value: 10, maxDiscount: 300, minOrder: 1000, active: true })
    await make('coupons', { code: `SHIP${stamp}`, type: 'free_delivery', active: true })
    await make('coupons', { code: `OLD${stamp}`, type: 'fixed', value: 500, active: true, endsAt: '2020-01-01T00:00:00.000Z' })
  })

  afterAll(async () => {
    for (const [collection, id] of made.reverse()) await payload.delete({ collection: collection as never, id, overrideAccess: true }).catch(() => undefined)
  })

  it('re-prices from the database and clamps quantity to stock', async () => {
    const q = await priceCart(payload, { items: [{ productId: a.id, quantity: 5 }], city: 'Lahore' })
    expect(q.lines[0]).toMatchObject({ unitPrice: 4000, quantity: 2, requested: 5 })
    expect(q.warnings[0]).toMatch(/Only 2/)
  })

  it('applies the bundle discount only when the set is in the cart', async () => {
    const alone = await priceCart(payload, { items: [{ productId: a.id, quantity: 1 }] })
    expect(alone.bundleDiscount).toBe(0)
    const both = await priceCart(payload, { items: [{ productId: a.id, quantity: 1 }, { productId: b.id, quantity: 1 }] })
    expect(both.bundleDiscount).toBe(400 + 100)
  })

  it('applies a capped percent coupon, free delivery and rejects expired codes', async () => {
    const items = [{ productId: a.id, quantity: 1 }]
    const pct = await priceCart(payload, { items, couponCode: `ten${stamp}`, city: 'Lahore' })
    expect(pct.couponDiscount).toBe(300)
    const ship = await priceCart(payload, { items, couponCode: `SHIP${stamp}`, city: 'Lahore' })
    expect(ship.deliveryFee).toBe(0)
    const old = await priceCart(payload, { items, couponCode: `OLD${stamp}` })
    expect(old.couponValid).toBe(false)
    expect(old.couponMessage).toMatch(/expired/)
  })

  it('gives workshop accounts the B2B price', async () => {
    const workshop = { id: 1, type: 'workshop', name: 'W', phone: '0300-0000000', email: 'w@x.test', updatedAt: '', createdAt: '' }
    const q = await priceCart(payload, { items: [{ productId: a.id, quantity: 1 }], customer: workshop as never })
    expect(q.lines[0].unitPrice).toBe(3500)
  })
})

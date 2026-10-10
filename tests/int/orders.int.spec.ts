import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { nextOrderNumber } from '@/lib/orders/status'

let payload: Payload
const ids: number[] = []

describe('orders', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })
  afterAll(async () => {
    for (const id of ids) await payload.delete({ collection: 'orders', id, overrideAccess: true })
  })

  it('numbers orders PY-100001, PY-100002, …', () => {
    expect(nextOrderNumber(null)).toBe('PY-100001')
    expect(nextOrderNumber('PY-100245')).toBe('PY-100246')
  })

  it('recomputes totals server-side and starts a timeline', async () => {
    const order = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      data: {
        customerName: 'Test',
        phone: '0300-0000000',
        city: 'Lahore',
        address: 'Test address',
        paymentMethod: 'cod',
        status: 'pending',
        paymentStatus: 'unpaid',
        deliveryFee: 200,
        discount: 100,
        total: 1, // ignored
        items: [
          { title: 'A', unitPrice: 1000, quantity: 2 },
          { title: 'B', unitPrice: 500, quantity: 1 },
        ],
      },
    })
    ids.push(order.id)
    expect(order.orderNumber).toMatch(/^PY-\d{6}$/)
    expect(order.subtotal).toBe(2500)
    expect(order.total).toBe(2600)
    expect(order.timeline).toHaveLength(1)

    const delivered = await payload.update({ collection: 'orders', id: order.id, data: { status: 'delivered' }, overrideAccess: true })
    expect(delivered.timeline?.map((t) => t.status)).toEqual(['pending', 'delivered'])
  })
})

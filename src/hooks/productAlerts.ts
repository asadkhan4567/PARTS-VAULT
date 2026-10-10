import type { CollectionAfterChangeHook, Where } from 'payload'

import { absoluteUrl } from '@/lib/url'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/payload-types'

const isEmail = (s: string) => /\S+@\S+\.\S+/.test(s)

/**
 * Back in stock (stock 0 → >0) and price drop (price lowered below what the shopper saw):
 * email shoppers who left an email; phone-only requests stay in Marketing → Product alerts
 * for staff to WhatsApp.
 */
export const notifyProductAlerts: CollectionAfterChangeHook<Product> = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== 'update' || !previousDoc || req.context?.skipAlerts) return doc
  const backInStock = (previousDoc.stock ?? 0) <= 0 && doc.stock > 0
  const priceDrop = doc.price < (previousDoc.price ?? doc.price)
  if (!backInStock && !priceDrop) return doc

  const or: Where[] = [
    ...(backInStock ? [{ type: { equals: 'back_in_stock' } }] : []),
    ...(priceDrop ? [{ and: [{ type: { equals: 'price_drop' } }, { priceAtRequest: { greater_than: doc.price } }] }] : []),
  ]
  const { docs } = await req.payload.find({
    collection: 'stock-alerts',
    where: { and: [{ product: { equals: doc.id } }, { notified: { equals: false } }, { or }] },
    limit: 500,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const url = absoluteUrl(`/product/${doc.slug}`)
  const name = doc.title.split(' – ').slice(0, 2).join(' – ')
  for (const alert of docs) {
    if (!isEmail(alert.contact)) continue
    const subject = alert.type === 'back_in_stock' ? `Back in stock: ${name}` : `Price drop: ${name} now ${formatPrice(doc.price)}`
    const html = `<p>Good news!</p><p><strong>${name}</strong> is ${alert.type === 'back_in_stock' ? 'back in stock' : `now ${formatPrice(doc.price)}`}.</p><p><a href="${url}">Order now on Partsyaar.com</a></p>`
    try {
      await req.payload.sendEmail({ to: alert.contact, subject, html })
      await req.payload.update({ collection: 'stock-alerts', id: alert.id, data: { notified: true }, overrideAccess: true, req })
    } catch (err) {
      req.payload.logger.error({ err }, 'product alert email failed')
    }
  }
  return doc
}

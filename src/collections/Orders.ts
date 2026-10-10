import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { fieldStaff, managers, staff, staffOrOwnCustomer } from '@/access'
import { auditFields } from '@/hooks/audit'
import { statusUpdateEmail } from '@/lib/email/templates'
import { ORDER_STATUSES, PAYMENT_METHODS, nextOrderNumber } from '@/lib/orders/status'
import { absoluteUrl } from '@/lib/url'
import type { Order } from '@/payload-types'

const idOf = (r: unknown) => (typeof r === 'object' && r ? (r as { id: number }).id : (r as number | null | undefined))

/** Restock on cancel/return, credit loyalty points on delivery, email the customer. */
const afterStatusChange: CollectionAfterChangeHook<Order> = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== 'update' || doc.status === previousDoc?.status || req.context?.skipOrderEffects) return doc
  const payload = req.payload

  if ((doc.status === 'cancelled' || doc.status === 'returned') && !doc.stockRestored) {
    for (const item of doc.items ?? []) {
      const id = idOf(item.product)
      if (!id) continue
      const p = await payload.findByID({ collection: 'products', id, depth: 0, overrideAccess: true, req }).catch(() => null)
      if (!p) continue
      await payload.update({
        collection: 'products',
        id,
        data: { stock: p.stock + item.quantity, salesCount: Math.max(0, (p.salesCount ?? 0) - item.quantity) },
        overrideAccess: true,
        req,
      })
    }
    await payload.update({ collection: 'orders', id: doc.id, data: { stockRestored: true }, overrideAccess: true, req, context: { skipOrderEffects: true } })
  }

  const customerId = idOf(doc.customer)
  if (doc.status === 'delivered' && customerId && !doc.pointsCredited) {
    const loyalty = await payload.findGlobal({ slug: 'loyalty-settings', overrideAccess: true, req })
    if (loyalty.enabled) {
      const customer = await payload.findByID({ collection: 'customers', id: customerId, depth: 0, overrideAccess: true, req }).catch(() => null)
      if (customer) {
        const tier = [...(loyalty.tiers ?? [])].sort((a, b) => b.minPoints - a.minPoints).find((t) => (customer.points ?? 0) >= t.minPoints)
        const earned = Math.floor(((doc.total ?? 0) / 100) * (loyalty.pointsPer100 ?? 1) * (tier?.multiplier ?? 1))
        await payload.update({ collection: 'customers', id: customerId, data: { points: (customer.points ?? 0) + earned }, overrideAccess: true, req })
        await payload.update({ collection: 'orders', id: doc.id, data: { pointsCredited: true, pointsEarned: earned }, overrideAccess: true, req, context: { skipOrderEffects: true } })
      }
    }
  }

  if (doc.email) {
    const mail = statusUpdateEmail(doc, absoluteUrl(`/track?order=${doc.orderNumber}`))
    // Never fail a status change because email is down.
    await payload.sendEmail({ to: doc.email, subject: mail.subject, html: mail.html }).catch((err: unknown) => payload.logger.error({ err }, 'status email failed'))
  }
  return doc
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customerName', 'phone', 'city', 'total', 'paymentMethod', 'status', 'createdAt'],
    group: 'Orders & Customers',
    listSearchableFields: ['orderNumber', 'customerName', 'phone', 'email'],
    description: 'Change the Status and press Save — the customer timeline updates automatically.',
    pagination: { defaultLimit: 50 },
  },
  defaultSort: '-createdAt',
  access: {
    read: staffOrOwnCustomer('customer'),
    // Orders are created by the checkout server action (overrideAccess) or by staff for phone orders.
    create: staff,
    update: staff,
    delete: managers,
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [...ORDER_STATUSES],
      admin: { position: 'sidebar' },
    },
    {
      // Secret for the guest confirmation link (/order/PY-…?t=…). Staff-only.
      name: 'accessToken',
      type: 'text',
      access: { read: fieldStaff, update: () => false },
      admin: { hidden: true },
    },
    { name: 'stockRestored', type: 'checkbox', defaultValue: false, admin: { hidden: true } },
    { name: 'pointsCredited', type: 'checkbox', defaultValue: false, admin: { hidden: true } },
    {
      name: 'paymentStatus',
      type: 'select',
      required: true,
      defaultValue: 'unpaid',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Awaiting confirmation', value: 'awaiting' },
        { label: 'Paid', value: 'paid' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Customer & delivery',
          fields: [
            { name: 'customer', type: 'relationship', relationTo: 'customers', admin: { description: 'Empty for guest checkout' } },
            {
              type: 'row',
              fields: [
                { name: 'customerName', type: 'text', required: true },
                { name: 'phone', type: 'text', required: true, index: true },
                { name: 'email', type: 'email' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'city', type: 'text', required: true },
                { name: 'area', type: 'text' },
              ],
            },
            { name: 'address', type: 'textarea', required: true },
            { name: 'vehicle', type: 'text', admin: { description: 'Vehicle selected while shopping' } },
            { name: 'customerNote', type: 'textarea' },
            {
              type: 'row',
              fields: [
                { name: 'riderName', type: 'text' },
                { name: 'riderPhone', type: 'text' },
              ],
            },
            { name: 'deliveryEta', type: 'text' },
          ],
        },
        {
          label: 'Items & totals',
          fields: [
            {
              name: 'items',
              type: 'array',
              required: true,
              minRows: 1,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'product', type: 'relationship', relationTo: 'products' },
                    { name: 'title', type: 'text', required: true },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'sku', type: 'text' },
                    { name: 'unitPrice', type: 'number', required: true, min: 0 },
                    { name: 'quantity', type: 'number', required: true, min: 1, defaultValue: 1 },
                    { name: 'lineTotal', type: 'number', admin: { readOnly: true } },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'subtotal', type: 'number', admin: { readOnly: true } },
                { name: 'deliveryFee', type: 'number', defaultValue: 0, min: 0 },
                { name: 'codFee', label: 'COD fee', type: 'number', defaultValue: 0, min: 0 },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'couponCode', type: 'text' },
                { name: 'discount', type: 'number', defaultValue: 0, min: 0 },
                { name: 'pointsRedeemed', type: 'number', defaultValue: 0, min: 0 },
                { name: 'total', type: 'number', admin: { readOnly: true } },
              ],
            },
            { name: 'pointsEarned', type: 'number', defaultValue: 0, admin: { readOnly: true } },
          ],
        },
        {
          label: 'Payment',
          fields: [
            { name: 'paymentMethod', type: 'select', required: true, defaultValue: 'cod', options: [...PAYMENT_METHODS] },
            { name: 'paymentReference', type: 'text', admin: { description: 'Bank / wallet transaction ID' } },
            { name: 'paymentProof', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Timeline & notes',
          fields: [
            { name: 'internalNotes', type: 'textarea', admin: { description: 'Only staff see this.' } },
            {
              name: 'timeline',
              type: 'array',
              admin: { readOnly: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'status', type: 'select', options: [...ORDER_STATUSES] },
                    { name: 'at', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
                    { name: 'by', type: 'text' },
                  ],
                },
                { name: 'note', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        const next = { ...data }
        // Totals are always recomputed server-side; never trust posted totals.
        const items = (next.items ?? originalDoc?.items ?? []) as Array<{ unitPrice: number; quantity: number; lineTotal?: number }>
        let subtotal = 0
        next.items = items.map((it) => {
          const lineTotal = Math.round((it.unitPrice || 0) * (it.quantity || 0))
          subtotal += lineTotal
          return { ...it, lineTotal }
        })
        const pick = (k: string) => Number(next[k] ?? originalDoc?.[k] ?? 0)
        next.subtotal = subtotal
        next.total = Math.max(0, subtotal + pick('deliveryFee') + pick('codFee') - pick('discount') - pick('pointsRedeemed'))

        if (operation === 'create' && !next.orderNumber) {
          const latest = await req.payload.find({
            collection: 'orders',
            sort: '-createdAt',
            limit: 1,
            depth: 0,
            overrideAccess: true,
            req,
          })
          next.orderNumber = nextOrderNumber(latest.docs[0]?.orderNumber)
        }

        const prevStatus = originalDoc?.status
        const status = next.status ?? prevStatus ?? 'pending'
        if (operation === 'create' || status !== prevStatus) {
          const user = req.user as { collection?: string; name?: string; email?: string } | null
          const timeline = [...((next.timeline ?? originalDoc?.timeline ?? []) as unknown[])]
          timeline.push({
            status,
            at: new Date().toISOString(),
            by: user?.collection === 'users' ? (user.name ?? user.email) : 'customer',
          })
          next.timeline = timeline
        }
        return next
      },
    ],
    afterChange: [auditFields(['status', 'paymentStatus', 'total'], 'orderNumber'), afterStatusChange],
  },
}

import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { staff } from '@/access'

/** Keeps product ratingAvg / ratingCount in sync with approved reviews. */
const refreshRating: CollectionAfterChangeHook = async ({ doc, req }) => {
  const productId = typeof doc.product === 'object' ? doc.product?.id : doc.product
  if (!productId) return doc
  const { docs } = await req.payload.find({
    collection: 'reviews',
    where: { and: [{ product: { equals: productId } }, { approved: { equals: true } }] },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const count = docs.length
  const avg = count ? docs.reduce((s, r) => s + (r.rating ?? 0), 0) / count : 0
  await req.payload.update({
    collection: 'products',
    id: productId,
    data: { ratingAvg: Math.round(avg * 10) / 10, ratingCount: count },
    overrideAccess: true,
    context: { skipAudit: true },
    req,
  })
  return doc
}

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'product', 'rating', 'name', 'approved', 'createdAt'],
    group: 'Marketing',
    description: 'Tick "Approved" to show a review on the website.',
  },
  defaultSort: '-createdAt',
  access: {
    read: ({ req }) => (req.user?.collection === 'users' ? true : { approved: { equals: true } }),
    create: staff,
    update: staff,
    delete: staff,
  },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products', required: true, index: true },
    { name: 'customer', type: 'relationship', relationTo: 'customers' },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'city', type: 'text' },
        { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
      ],
    },
    { name: 'title', type: 'text', required: true },
    { name: 'text', type: 'textarea', required: true },
    { name: 'photos', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'verifiedBuyer', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'approved', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'featured', label: 'Show on homepage', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
  ],
  hooks: { afterChange: [refreshRating] },
}

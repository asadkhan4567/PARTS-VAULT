import 'server-only'

import { cache } from 'react'

import type { Banner } from '@/payload-types'

import { getPayloadClient } from '../payload'

const pub = { overrideAccess: false } as const

export async function getBanners(placement: Banner['placement'], ids?: Array<number | Banner> | null): Promise<Banner[]> {
  const payload = await getPayloadClient()
  const picked = (ids ?? []).map((b) => (typeof b === 'object' ? b.id : b))
  const { docs } = await payload.find({
    collection: 'banners',
    ...pub,
    where: picked.length ? { id: { in: picked } } : { placement: { equals: placement } },
    sort: 'order',
    depth: 1,
    limit: 12,
  })
  return docs
}

export async function getReviews(limit = 8, productId?: number) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'reviews',
    ...pub,
    where: productId ? { product: { equals: productId } } : { featured: { equals: true } },
    sort: '-createdAt',
    depth: 1,
    limit,
  })
  return docs
}

export const getBlogPosts = cache(async (limit = 12, page = 1) => {
  const payload = await getPayloadClient()
  return payload.find({ collection: 'blog-posts', ...pub, sort: '-publishedAt', depth: 1, limit, page })
})

export const getBlogPostBySlug = cache(async (slug: string, draft = false) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'blog-posts', where: { slug: { equals: slug } }, overrideAccess: draft, draft, depth: 2, limit: 1 })
  return docs[0] ?? null
})

export const getPageBySlug = cache(async (slug: string, draft = false) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, overrideAccess: draft, draft, depth: 2, limit: 1 })
  return docs[0] ?? null
})

export const getHomepage = cache(async (draft = false) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'homepage', overrideAccess: draft, draft, depth: 2 })
})

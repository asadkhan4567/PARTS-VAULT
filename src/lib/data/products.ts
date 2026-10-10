import 'server-only'

import type { Where } from 'payload'
import { cache } from 'react'

import type { Product } from '@/payload-types'

import { fitsVehicle } from '../fitment'
import { getPayloadClient } from '../payload'
import { compactPartNumber, looksLikePartNumber, normalizeQuery } from '../search'
import { getCustomer } from '../session'
import type { Vehicle } from '../vehicle'

export type SortKey = 'relevance' | 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'rating'

export type ProductFilters = {
  q?: string
  categoryIds?: number[]
  brandIds?: number[]
  conditions?: string[]
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  onSale?: boolean
  featured?: boolean
  bestSeller?: boolean
  ids?: number[]
  excludeIds?: number[]
  /** Only parts that fit this vehicle */
  vehicle?: Vehicle | null
  sort?: SortKey
  page?: number
  limit?: number
}

export type ProductList = { docs: Product[]; total: number; page: number; pages: number; usedFallback: boolean }

const SORTS: Record<Exclude<SortKey, 'relevance'>, string> = {
  popular: '-salesCount',
  price_asc: 'price',
  price_desc: '-price',
  newest: '-createdAt',
  rating: '-ratingAvg',
}

function baseWhere(f: ProductFilters): Where[] {
  const and: Where[] = []
  if (f.categoryIds?.length) and.push({ categories: { in: f.categoryIds } })
  if (f.brandIds?.length) and.push({ partBrand: { in: f.brandIds } })
  if (f.conditions?.length) and.push({ condition: { in: f.conditions } })
  if (f.minPrice != null) and.push({ price: { greater_than_equal: f.minPrice } })
  if (f.maxPrice != null) and.push({ price: { less_than_equal: f.maxPrice } })
  if (f.inStock) and.push({ stock: { greater_than: 0 } })
  if (f.onSale) and.push({ compareAtPrice: { greater_than: 0 } })
  if (f.featured) and.push({ featured: { equals: true } })
  if (f.bestSeller) and.push({ bestSeller: { equals: true } })
  if (f.ids) and.push({ id: { in: f.ids.length ? f.ids : [-1] } })
  if (f.excludeIds?.length) and.push({ id: { not_in: f.excludeIds } })
  if (f.vehicle) {
    and.push({ or: [{ universalFit: { equals: true } }, { 'fitments.make': { equals: f.vehicle.makeId } }] })
  }
  return and
}

const tokenWhere = (t: string): Where => ({ searchText: { contains: looksLikePartNumber(t) ? compactPartNumber(t) : t } })

function score(p: Product, tokens: string[]): number {
  const title = p.title.toLowerCase()
  const text = (p.searchText ?? '').toLowerCase()
  let s = 0
  for (const t of tokens) {
    const needle = looksLikePartNumber(t) ? compactPartNumber(t) : t
    if (title.includes(t)) s += 3
    if (text.includes(needle)) s += 2
    if (p.oemNumber && compactPartNumber(p.oemNumber).toLowerCase() === compactPartNumber(t)) s += 10
  }
  return s + Math.min(2, (p.salesCount ?? 0) / 100) + (p.stock > 0 ? 1 : 0)
}

/**
 * Product listing used by category, model, search and home blocks. Reads go through
 * `overrideAccess: false` with the logged-in customer so cost/workshop price rules apply.
 */
export async function listProducts(filters: ProductFilters): Promise<ProductList> {
  const payload = await getPayloadClient()
  const customer = await getCustomer()
  const limit = filters.limit ?? 24
  const page = Math.max(1, filters.page ?? 1)
  const tokens = filters.q ? normalizeQuery(filters.q) : []
  const sort = filters.sort ?? (tokens.length ? 'relevance' : 'popular')
  const common = { collection: 'products' as const, overrideAccess: false, user: customer ?? undefined, depth: 2 }

  // Searching, relevance sort and vehicle filtering are ranked/filtered in memory over the
  // matching set (a parts catalogue is thousands of rows, not millions).
  const inMemory = tokens.length > 0 || filters.vehicle || sort === 'relevance'
  if (!inMemory) {
    const res = await payload.find({ ...common, where: { and: baseWhere(filters) }, sort: SORTS[sort as keyof typeof SORTS], limit, page })
    return { docs: res.docs, total: res.totalDocs, page: res.page ?? 1, pages: res.totalPages, usedFallback: false }
  }

  const run = async (where: Where) =>
    (await payload.find({ ...common, where, pagination: false, limit: 0 })).docs as Product[]
  const base = baseWhere(filters)
  let usedFallback = false
  let docs = await run({ and: [...base, ...tokens.map(tokenWhere)] })
  if (!docs.length && tokens.length > 1) {
    // Typo/extra-word tolerance: accept any token, rank by how many matched.
    docs = await run({ and: [...base, { or: tokens.map(tokenWhere) }] })
    usedFallback = docs.length > 0
  }
  if (filters.vehicle) docs = docs.filter((p) => fitsVehicle(p, filters.vehicle) === true)

  if (sort === 'relevance') docs.sort((a, b) => score(b, tokens) - score(a, tokens))
  else {
    const key = SORTS[sort]
    const desc = key.startsWith('-')
    const field = key.replace('-', '') as keyof Product
    docs.sort((a, b) => {
      const av = field === 'createdAt' ? Date.parse(a.createdAt) : Number(a[field] ?? 0)
      const bv = field === 'createdAt' ? Date.parse(b.createdAt) : Number(b[field] ?? 0)
      return desc ? bv - av : av - bv
    })
  }
  const total = docs.length
  return { docs: docs.slice((page - 1) * limit, page * limit), total, page, pages: Math.max(1, Math.ceil(total / limit)), usedFallback }
}

export const getProductBySlug = cache(async (slug: string, draft = false): Promise<Product | null> => {
  const payload = await getPayloadClient()
  const customer = await getCustomer()
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    overrideAccess: false,
    user: customer ?? undefined,
    draft,
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
})

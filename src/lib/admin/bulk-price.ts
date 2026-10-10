import type { Payload, PayloadRequest, Where } from 'payload'

export type BulkFilter = {
  categoryIds?: number[]
  brandIds?: number[]
  makeId?: number | null
  search?: string
  inStockOnly?: boolean
}

export type BulkChange = {
  field: 'price' | 'compareAtPrice' | 'workshopPrice'
  mode: 'increase_percent' | 'decrease_percent' | 'increase_fixed' | 'decrease_fixed' | 'set'
  amount: number
  /** Round results to the nearest N rupees (1, 5, 10, 50, 100). */
  roundTo?: number
  /** When lowering the price, keep the current price as the "old price" so the site shows "Save Rs X". */
  keepOldAsCompareAt?: boolean
}

export type BulkRow = { id: number; title: string; sku: string; from: number | null; to: number }

/** New value for one product. Never negative; rounded to the requested step. */
export function applyChange(current: number | null | undefined, change: BulkChange): number {
  const base = current ?? 0
  let v: number
  switch (change.mode) {
    case 'increase_percent':
      v = base * (1 + change.amount / 100)
      break
    case 'decrease_percent':
      v = base * (1 - change.amount / 100)
      break
    case 'increase_fixed':
      v = base + change.amount
      break
    case 'decrease_fixed':
      v = base - change.amount
      break
    case 'set':
      v = change.amount
      break
  }
  const step = Math.max(1, change.roundTo ?? 1)
  return Math.max(0, Math.round(v / step) * step)
}

async function categoryWithChildren(payload: Payload, ids: number[]): Promise<number[]> {
  if (!ids.length) return []
  const { docs } = await payload.find({ collection: 'categories', where: { parent: { in: ids } }, limit: 1000, depth: 0, overrideAccess: true })
  return [...ids, ...docs.map((d) => d.id)]
}

export async function selectProducts(payload: Payload, f: BulkFilter) {
  const and: Where[] = []
  const cats = await categoryWithChildren(payload, f.categoryIds ?? [])
  if (cats.length) and.push({ categories: { in: cats } })
  if (f.brandIds?.length) and.push({ partBrand: { in: f.brandIds } })
  if (f.makeId) and.push({ 'fitments.make': { equals: f.makeId } })
  if (f.search?.trim()) and.push({ searchText: { like: f.search.trim().toLowerCase() } })
  if (f.inStockOnly) and.push({ stock: { greater_than: 0 } })
  const { docs } = await payload.find({
    collection: 'products',
    where: and.length ? { and } : {},
    limit: 0,
    pagination: false,
    depth: 0,
    overrideAccess: true,
    select: { title: true, sku: true, price: true, compareAtPrice: true, workshopPrice: true },
  })
  return docs
}

export async function previewBulk(payload: Payload, filter: BulkFilter, change: BulkChange): Promise<BulkRow[]> {
  const docs = await selectProducts(payload, filter)
  return docs.map((d) => ({ id: d.id, title: d.title, sku: d.sku, from: (d[change.field] as number | null) ?? null, to: applyChange(d[change.field] as number | null, change) }))
}

/** Applies the change as the logged-in user, so every price change lands in the audit log under their name. */
export async function applyBulk(req: PayloadRequest, filter: BulkFilter, change: BulkChange): Promise<{ updated: number }> {
  const rows = await previewBulk(req.payload, filter, change)
  let updated = 0
  for (const row of rows) {
    if (row.from === row.to) continue
    const data: Record<string, number> = { [change.field]: row.to }
    if (change.field === 'price' && change.keepOldAsCompareAt && row.from != null && row.to < row.from) data.compareAtPrice = row.from
    await req.payload.update({ collection: 'products', id: row.id, data, req, overrideAccess: false, user: req.user })
    updated++
  }
  return { updated }
}

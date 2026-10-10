import Papa from 'papaparse'
import type { Payload, PayloadRequest } from 'payload'

import type { Product } from '@/payload-types'

/** Spreadsheet columns, in order. Fitments: "Make|Model|From|To|Engine; …" (To/Engine optional). */
export const CSV_COLUMNS = [
  'sku',
  'title',
  'oem_number',
  'brand',
  'condition',
  'categories',
  'price',
  'compare_at_price',
  'workshop_price',
  'cost_price',
  'stock',
  'low_stock_threshold',
  'fitments',
  'universal_fit',
  'tags',
  'status',
] as const

type Row = Partial<Record<(typeof CSV_COLUMNS)[number], string>>

const name = (r: unknown) => (typeof r === 'object' && r ? ((r as { name?: string }).name ?? '') : '')

export async function exportProductsCsv(payload: Payload, includeCost: boolean): Promise<string> {
  const { docs } = await payload.find({ collection: 'products', limit: 0, pagination: false, depth: 1, overrideAccess: true, draft: true })
  const rows = docs.map((p: Product) => ({
    sku: p.sku,
    title: p.title,
    oem_number: p.oemNumber ?? '',
    brand: name(p.partBrand),
    condition: p.condition,
    categories: (p.categories ?? []).map(name).join('|'),
    price: p.price,
    compare_at_price: p.compareAtPrice ?? '',
    workshop_price: p.workshopPrice ?? '',
    cost_price: includeCost ? (p.costPrice ?? '') : '',
    stock: p.stock,
    low_stock_threshold: p.lowStockThreshold ?? '',
    fitments: (p.fitments ?? []).map((f) => [name(f.make), name(f.model), f.yearFrom, f.yearTo ?? '', f.engine ?? ''].join('|')).join('; '),
    universal_fit: p.universalFit ? 'yes' : '',
    tags: (p.tags ?? []).join('|'),
    status: p._status ?? 'published',
  }))
  return Papa.unparse({ fields: [...CSV_COLUMNS], data: rows.map((r) => CSV_COLUMNS.map((c) => r[c as keyof typeof r])) })
}

export type ImportResult = { created: number; updated: number; skipped: number; errors: Array<{ row: number; sku?: string; message: string }>; dryRun: boolean }

const num = (v: string | undefined) => {
  if (v == null || v.trim() === '') return undefined
  const n = Number(v.replace(/[,\s]|rs\.?/gi, ''))
  return Number.isFinite(n) ? n : NaN
}

/**
 * Upserts products by SKU. Blank cells leave existing values unchanged, so the owner can export,
 * edit just the price column in Excel and re-import.
 */
export async function importProductsCsv(req: PayloadRequest, csv: string, opts: { dryRun: boolean; allowCost: boolean }): Promise<ImportResult> {
  const payload = req.payload
  const parsed = Papa.parse<Row>(csv.replace(/^﻿/, ''), { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_') })
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [], dryRun: opts.dryRun }

  const [brands, categories, makes, models] = await Promise.all([
    payload.find({ collection: 'part-brands', limit: 0, pagination: false, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'categories', limit: 0, pagination: false, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'makes', limit: 0, pagination: false, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'models', limit: 0, pagination: false, depth: 0, overrideAccess: true }),
  ])
  const lc = (s: string) => s.trim().toLowerCase()
  const brandBy = new Map(brands.docs.map((b) => [lc(b.name), b.id]))
  const catBy = new Map(categories.docs.flatMap((c) => [[lc(c.name), c.id] as const, [lc(c.slug ?? ''), c.id] as const]))
  const makeBy = new Map(makes.docs.map((m) => [lc(m.name), m.id]))

  for (const [i, row] of parsed.data.entries()) {
    const line = i + 2 // header is line 1
    const sku = row.sku?.trim()
    const fail = (message: string) => result.errors.push({ row: line, sku, message })
    if (!sku) {
      fail('Missing SKU')
      continue
    }
    const data: Record<string, unknown> = {}
    if (row.title?.trim()) data.title = row.title.trim()
    if (row.oem_number !== undefined && row.oem_number.trim()) data.oemNumber = row.oem_number.trim()
    if (row.condition?.trim()) {
      const c = lc(row.condition)
      if (!['genuine', 'oem', 'aftermarket'].includes(c)) {
        fail(`Condition must be genuine, oem or aftermarket (got "${row.condition}")`)
        continue
      }
      data.condition = c
    }
    if (row.brand?.trim()) {
      const id = brandBy.get(lc(row.brand))
      if (!id) {
        fail(`Unknown brand "${row.brand}" — add it under Part brands first`)
        continue
      }
      data.partBrand = id
    }
    if (row.categories?.trim()) {
      const ids = row.categories.split('|').map((c) => catBy.get(lc(c)))
      if (ids.some((x) => !x)) {
        fail(`Unknown category in "${row.categories}"`)
        continue
      }
      data.categories = ids
    }
    let bad = false
    for (const [col, field] of [
      ['price', 'price'],
      ['compare_at_price', 'compareAtPrice'],
      ['workshop_price', 'workshopPrice'],
      ['cost_price', 'costPrice'],
      ['stock', 'stock'],
      ['low_stock_threshold', 'lowStockThreshold'],
    ] as const) {
      const v = num(row[col])
      if (v === undefined) continue
      if (Number.isNaN(v) || v < 0) {
        fail(`${col} must be a number ≥ 0 (got "${row[col]}")`)
        bad = true
        break
      }
      if (field === 'costPrice' && !opts.allowCost) continue
      data[field] = Math.round(v)
    }
    if (bad) continue
    if (row.fitments?.trim()) {
      const fits = []
      for (const part of row.fitments.split(';').map((s) => s.trim()).filter(Boolean)) {
        const [mk, md, from, to, engine] = part.split('|').map((s) => s?.trim())
        const makeId = makeBy.get(lc(mk ?? ''))
        const yf = Number(from)
        const yt = to ? Number(to) : null
        const gens = models.docs.filter((m) => m.make === makeId && lc(m.name) === lc(md ?? ''))
        const gen = gens.find((g) => yf <= (g.yearTo ?? 9999) && (yt ?? 9999) >= g.yearFrom) ?? gens[0]
        if (!makeId || !gen || !Number.isInteger(yf)) {
          fail(`Can't read fitment "${part}" — use Make|Model|FromYear|ToYear|Engine`)
          bad = true
          break
        }
        fits.push({ make: makeId, model: gen.id, yearFrom: yf, yearTo: yt, engine: engine || undefined })
      }
      if (bad) continue
      data.fitments = fits
    }
    if (row.universal_fit?.trim()) data.universalFit = ['yes', 'true', '1', 'y'].includes(lc(row.universal_fit))
    if (row.tags?.trim()) data.tags = row.tags.split('|').map((t) => t.trim()).filter(Boolean)
    if (row.status?.trim()) data._status = lc(row.status) === 'draft' ? 'draft' : 'published'

    const existing = await payload.find({ collection: 'products', where: { sku: { equals: sku } }, limit: 1, depth: 0, overrideAccess: true, draft: true })
    if (!existing.docs[0]) {
      const missing = ['title', 'price', 'partBrand', 'categories'].filter((k) => data[k] === undefined)
      if (missing.length) {
        fail(`New product needs: ${missing.join(', ').replace('partBrand', 'brand')}`)
        continue
      }
    }
    if (!Object.keys(data).length) {
      result.skipped++
      continue
    }
    if (opts.dryRun) {
      if (existing.docs[0]) result.updated++
      else result.created++
      continue
    }
    try {
      if (existing.docs[0]) {
        await payload.update({ collection: 'products', id: existing.docs[0].id, data, req, user: req.user, overrideAccess: false })
        result.updated++
      } else {
        await payload.create({ collection: 'products', data: { sku, stock: 0, condition: 'genuine', _status: 'published', ...data } as never, req, user: req.user, overrideAccess: false })
        result.created++
      }
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Could not save')
    }
  }
  return result
}

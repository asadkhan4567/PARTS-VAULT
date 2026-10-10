import { createLocalReq, getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { exportProductsCsv, importProductsCsv } from '@/lib/admin/csv'

let payload: Payload
const sku = `CSV-${Date.now()}`

describe('CSV import/export', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })
  afterAll(async () => {
    await payload.delete({ collection: 'products', where: { sku: { equals: sku } }, overrideAccess: true })
  })

  it('exports a header row matching the import columns', async () => {
    const csv = await exportProductsCsv(payload, false)
    expect(csv.split(/\r?\n/)[0]).toBe('sku,title,oem_number,brand,condition,categories,price,compare_at_price,workshop_price,cost_price,stock,low_stock_threshold,fitments,universal_fit,tags,status')
  })

  it('validates rows in a dry run, then creates and updates by SKU', async () => {
    const owner = (await payload.find({ collection: 'users', where: { role: { equals: 'owner' } }, limit: 1, overrideAccess: true })).docs[0]
    const req = await createLocalReq({ user: { ...owner, collection: 'users' } }, payload)
    const header = 'sku,title,brand,categories,price,stock,fitments'
    const bad = `${header}\n${sku},Test,NoSuchBrand,Brake Pads,100,1,`
    const dry = await importProductsCsv(req, bad, { dryRun: true, allowCost: true })
    expect(dry.errors[0].message).toMatch(/Unknown brand/)

    const good = `${header}\n${sku},CSV Brake Pads,Hitachi,Brake Pads,"1,500",4,Toyota|Corolla|2014|2022|1.8L`
    const check = await importProductsCsv(req, good, { dryRun: true, allowCost: true })
    expect(check).toMatchObject({ created: 1, errors: [] })
    await importProductsCsv(req, good, { dryRun: false, allowCost: true })
    const created = (await payload.find({ collection: 'products', where: { sku: { equals: sku } }, overrideAccess: true, depth: 0 })).docs[0]
    expect(created).toMatchObject({ price: 1500, stock: 4 })
    expect(created.fitments?.[0]).toMatchObject({ yearFrom: 2014, yearTo: 2022, engine: '1.8L' })

    const res = await importProductsCsv(req, `sku,price\n${sku},1650`, { dryRun: false, allowCost: true })
    expect(res.updated).toBe(1)
    const updated = await payload.findByID({ collection: 'products', id: created.id, overrideAccess: true, depth: 0 })
    expect(updated.price).toBe(1650)
    expect(updated.stock).toBe(4)
  })
})

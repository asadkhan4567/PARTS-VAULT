import { addDataAndFileToRequest, type Endpoint, type PayloadRequest } from 'payload'
import { z } from 'zod'

import { isManagerReq, isStaffReq } from '@/access'
import { applyBulk, previewBulk } from '@/lib/admin/bulk-price'
import { exportProductsCsv, importProductsCsv } from '@/lib/admin/csv'
import { orderPdf } from '@/lib/admin/invoice'

const deny = (status = 403) => Response.json({ error: status === 401 ? 'Please log in' : 'Not allowed' }, { status })

const bulkSchema = z.object({
  apply: z.boolean().default(false),
  filter: z.object({
    categoryIds: z.array(z.number().int()).optional(),
    brandIds: z.array(z.number().int()).optional(),
    makeId: z.number().int().nullable().optional(),
    search: z.string().max(100).optional(),
    inStockOnly: z.boolean().optional(),
  }),
  change: z.object({
    field: z.enum(['price', 'compareAtPrice', 'workshopPrice']),
    mode: z.enum(['increase_percent', 'decrease_percent', 'increase_fixed', 'decrease_fixed', 'set']),
    amount: z.number().min(0).max(10_000_000),
    roundTo: z.number().int().min(1).max(1000).optional(),
    keepOldAsCompareAt: z.boolean().optional(),
  }),
})

/** Owner tools behind /api/tools/* — each checks the staff role itself. */
export const toolEndpoints: Endpoint[] = [
  {
    path: '/tools/bulk-price',
    method: 'post',
    handler: async (req: PayloadRequest) => {
      if (!req.user) return deny(401)
      if (!isManagerReq(req)) return deny()
      const body = bulkSchema.safeParse(await req.json?.())
      if (!body.success) return Response.json({ error: 'Invalid request', issues: body.error.issues }, { status: 400 })
      const { apply, filter, change } = body.data
      if (change.mode.endsWith('percent') && change.amount > 90 && change.mode.startsWith('decrease')) return Response.json({ error: 'A decrease above 90% looks like a mistake.' }, { status: 400 })
      if (!apply) {
        const rows = await previewBulk(req.payload, filter, change)
        return Response.json({ count: rows.length, rows: rows.slice(0, 500) })
      }
      return Response.json(await applyBulk(req, filter, change))
    },
  },
  {
    path: '/tools/products-export',
    method: 'get',
    handler: async (req) => {
      if (!req.user) return deny(401)
      if (!isManagerReq(req)) return deny()
      const csv = await exportProductsCsv(req.payload, true)
      return new Response(`﻿${csv}`, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="partsyaar-products-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      })
    },
  },
  {
    path: '/tools/products-import',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return deny(401)
      if (!isManagerReq(req)) return deny()
      await addDataAndFileToRequest(req)
      const file = req.file
      if (!file?.data) return Response.json({ error: 'Choose a CSV file' }, { status: 400 })
      if (file.size > 5 * 1024 * 1024) return Response.json({ error: 'CSV must be under 5 MB' }, { status: 400 })
      const dryRun = String((req.data as Record<string, unknown>)?.dryRun ?? 'true') !== 'false'
      const result = await importProductsCsv(req, file.data.toString('utf8'), { dryRun, allowCost: true })
      return Response.json(result)
    },
  },
  {
    path: '/tools/order-pdf/:id',
    method: 'get',
    handler: async (req) => {
      if (!req.user) return deny(401)
      if (!isStaffReq(req)) return deny()
      const id = Number(req.routeParams?.id)
      const kind = req.searchParams.get('type') === 'slip' ? 'slip' : 'invoice'
      const order = await req.payload.findByID({ collection: 'orders', id, depth: 0, overrideAccess: true }).catch(() => null)
      if (!order) return Response.json({ error: 'Order not found' }, { status: 404 })
      const site = await req.payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
      const bytes = await orderPdf(order, site, kind)
      return new Response(Buffer.from(bytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${kind === 'slip' ? 'packing-slip' : 'invoice'}-${order.orderNumber}.pdf"`,
        },
      })
    },
  },
]

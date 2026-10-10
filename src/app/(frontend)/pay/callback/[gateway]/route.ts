import { NextResponse, type NextRequest } from 'next/server'

import { getAdapter } from '@/lib/payments'
import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl } from '@/lib/url'

async function handle(req: NextRequest, gateway: string) {
  const params: Record<string, string> = Object.fromEntries(req.nextUrl.searchParams)
  if (req.method === 'POST') {
    const form = await req.formData().catch(() => null)
    form?.forEach((v, k) => {
      if (typeof v === 'string') params[k] = v
    })
  }
  const adapter = getAdapter(gateway)
  if (!adapter?.verify) return NextResponse.redirect(absoluteUrl('/'), 303)
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'payment-settings', overrideAccess: true })
  const result = await adapter.verify(params, settings)
  const { docs } = await payload.find({ collection: 'orders', where: { orderNumber: { equals: result.orderNumber } }, limit: 1, overrideAccess: true, depth: 0 })
  const order = docs[0]
  if (!order || order.paymentMethod !== gateway) return NextResponse.redirect(absoluteUrl('/track'), 303)
  if (order.paymentStatus !== 'paid') {
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { paymentStatus: result.paid ? 'paid' : 'failed', paymentReference: result.reference ?? order.paymentReference, ...(result.paid && order.status === 'pending' ? { status: 'confirmed' } : {}) },
      overrideAccess: true,
    })
  }
  return NextResponse.redirect(absoluteUrl(`/order/${order.orderNumber}?t=${order.accessToken}${result.paid ? '' : '&payment=failed'}`), 303)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ gateway: string }> }) {
  return handle(req, (await params).gateway)
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ gateway: string }> }) {
  return handle(req, (await params).gateway)
}

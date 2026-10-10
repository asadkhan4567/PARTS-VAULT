import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { AutoSubmit } from '@/components/cart/AutoSubmit'
import { getAdapter } from '@/lib/payments'
import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl } from '@/lib/url'

export const metadata: Metadata = { title: 'Redirecting to payment', robots: { index: false } }

/** Builds the signed gateway request server-side and hands the shopper to the gateway. */
export default async function PayPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> }) {
  const [{ number }, { t }] = await Promise.all([params, searchParams])
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'orders', where: { orderNumber: { equals: number } }, limit: 1, overrideAccess: true, depth: 0 })
  const order = docs[0]
  if (!order || !t || t !== order.accessToken) notFound()
  const back = `/order/${order.orderNumber}?t=${t}`
  if (order.paymentStatus === 'paid') redirect(back)
  const adapter = getAdapter(order.paymentMethod)
  const settings = await payload.findGlobal({ slug: 'payment-settings', overrideAccess: true })
  let start
  try {
    start = await adapter?.start?.(order, settings, { returnUrl: absoluteUrl(`/pay/callback/${order.paymentMethod}`) })
  } catch (err) {
    payload.logger.error({ err }, 'payment start failed')
  }
  if (!start) {
    return (
      <div className="container-py max-w-xl space-y-4 py-16 text-center">
        <h1 className="text-3xl">Payment page unavailable</h1>
        <p className="text-muted-foreground">Your order {order.orderNumber} is saved. You can pay by Cash on Delivery or bank transfer — we’ll call you to confirm.</p>
        <Link href={back} className="font-semibold text-navy-500 hover:underline">
          View your order →
        </Link>
      </div>
    )
  }
  if (start.kind === 'redirect') redirect(start.url)
  return (
    <div className="container-py max-w-xl space-y-4 py-16 text-center">
      <h1 className="text-3xl">Taking you to secure payment…</h1>
      <p className="text-muted-foreground">Order {order.orderNumber}. Please don’t close this page.</p>
      <AutoSubmit action={start.action} fields={start.fields} />
    </div>
  )
}

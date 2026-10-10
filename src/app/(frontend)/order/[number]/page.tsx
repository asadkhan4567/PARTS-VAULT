import { CheckCircle2, Package } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat'
import { Button } from '@/components/ui/button'
import { getSettings } from '@/lib/data/settings'
import { statusLabel } from '@/lib/orders/status'
import { getAdapter } from '@/lib/payments'
import { getPayloadClient } from '@/lib/payload'
import { getCustomer } from '@/lib/session'
import { formatPrice } from '@/lib/utils'
import { whatsappLink } from '@/lib/whatsapp'

export const metadata: Metadata = { title: 'Order confirmed', robots: { index: false } }

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> }

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ number }, { t }] = await Promise.all([params, searchParams])
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'orders', where: { orderNumber: { equals: number.toUpperCase() } }, limit: 1, overrideAccess: true, depth: 0 })
  const order = docs[0]
  const customer = await getCustomer()
  const ownerId = typeof order?.customer === 'object' ? order.customer?.id : order?.customer
  // Visible with the secret link from checkout, or to the logged-in customer who placed it.
  if (!order || !((t && t === order.accessToken) || (customer && customer.id === ownerId))) notFound()

  const { site, payments } = await getSettings()
  const instructions = getAdapter(order.paymentMethod)?.instructions(payments)
  const wa = whatsappLink(site.whatsapp, `Assalam o Alaikum! I just placed order ${order.orderNumber} (${formatPrice(order.total ?? 0)}). Please confirm.`)

  return (
    <div className="bg-navy-100/40 py-10">
      <div className="container-py max-w-3xl space-y-6">
        <div className="bg-hero rounded-2xl p-8 text-white">
          <CheckCircle2 className="mb-3 size-12 text-success" />
          <h1 className="text-4xl">Thank you, {order.customerName.split(' ')[0]}!</h1>
          <p className="mt-2 text-steel-400">
            Order <strong className="font-mono text-white" data-testid="order-number">{order.orderNumber}</strong> is locked in. We’ll call or WhatsApp you on {order.phone} to confirm.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="bg-[#25D366] text-navy-950 hover:bg-[#1fb757]">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-5" /> Confirm on WhatsApp
              </a>
            </Button>
            <Button asChild variant="glass">
              <Link href={`/track?order=${order.orderNumber}`}>
                <Package className="size-4" /> Track order
              </Link>
            </Button>
          </div>
        </div>

        {instructions && order.paymentMethod !== 'cod' ? (
          <div className="rounded-brand border-2 border-warning bg-warning/10 p-5">
            <p className="mb-2 font-heading text-xl font-bold">Complete your payment</p>
            <p className="whitespace-pre-line text-sm">{instructions}</p>
            <p className="mt-2 text-sm">
              Use <strong className="font-mono">{order.orderNumber}</strong> as the reference and send the receipt on WhatsApp.
            </p>
          </div>
        ) : null}

        <div className="space-y-4 rounded-brand border bg-white p-5">
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <span>
              Status: <strong>{statusLabel(order.status)}</strong>
            </span>
            <span>{order.deliveryEta}</span>
          </div>
          <ul className="divide-y text-sm">
            {(order.items ?? []).map((i) => (
              <li key={i.id ?? i.title} className="flex justify-between gap-3 py-3">
                <span>
                  {i.title} <span className="text-muted-foreground">× {i.quantity}</span>
                </span>
                <span className="font-semibold">{formatPrice(i.lineTotal ?? i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1 border-t pt-3 text-sm">
            {[
              ['Subtotal', order.subtotal ?? 0],
              ...(order.discount ? [[`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`, -order.discount]] : []),
              ['Delivery', order.deliveryFee ?? 0],
              ...(order.codFee ? [['COD fee', order.codFee]] : []),
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between">
                <dt>{k}</dt>
                <dd>{formatPrice(Number(v))}</dd>
              </div>
            ))}
            <div className="flex justify-between pt-2 text-lg font-bold">
              <dt>Total</dt>
              <dd className="text-red-600">{formatPrice(order.total ?? 0)}</dd>
            </div>
          </dl>
          <p className="text-sm text-muted-foreground">
            Delivering to {order.address}, {order.area ? `${order.area}, ` : ''}
            {order.city}
          </p>
        </div>
      </div>
    </div>
  )
}

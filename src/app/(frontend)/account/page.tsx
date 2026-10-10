import { Gift, MapPin, Package } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/account/LogoutButton'
import { WorkshopApply } from '@/components/account/WorkshopApply'
import { getSettings } from '@/lib/data/settings'
import { statusLabel } from '@/lib/orders/status'
import { getPayloadClient } from '@/lib/payload'
import { getCustomer } from '@/lib/session'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = { title: 'My account', robots: { index: false } }

export default async function AccountPage() {
  const customer = await getCustomer()
  if (!customer) redirect('/account/login')
  const payload = await getPayloadClient()
  const [{ docs: orders }, { loyalty }] = await Promise.all([
    payload.find({ collection: 'orders', where: { customer: { equals: customer.id } }, sort: '-createdAt', limit: 50, depth: 0, overrideAccess: false, user: customer }),
    getSettings(),
  ])
  const tier = [...(loyalty.tiers ?? [])].sort((a, b) => b.minPoints - a.minPoints).find((t) => (customer.points ?? 0) >= t.minPoints)
  return (
    <div className="bg-navy-100/40 py-10">
      <div className="container-py space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl">Assalam o Alaikum, {customer.name.split(' ')[0]}</h1>
            <p className="text-muted-foreground">
              {customer.phone} · {customer.email}
              {customer.type === 'workshop' ? <span className="ml-2 rounded-full bg-navy-900 px-2 py-0.5 text-xs font-semibold text-white">Workshop account</span> : null}
            </p>
          </div>
          <LogoutButton />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-hero rounded-brand p-5 text-white">
            <p className="flex items-center gap-2 text-sm text-steel-400">
              <Gift className="size-4 text-red-600" /> Yaar Points
            </p>
            <p className="mt-1 font-heading text-4xl font-bold" data-testid="points">
              {customer.points ?? 0}
            </p>
            <p className="text-xs text-steel-400">
              {tier ? `${tier.name} member · ` : ''}worth {formatPrice((customer.points ?? 0) * (loyalty.pointValue ?? 1))}
            </p>
          </div>
          <Link href="/account/wishlist" className="rounded-brand border bg-white p-5 hover:border-red-600">
            <p className="font-heading text-xl font-bold">Wishlist</p>
            <p className="text-sm text-muted-foreground">Parts you saved for later</p>
          </Link>
          <Link href="/garage" className="rounded-brand border bg-white p-5 hover:border-red-600">
            <p className="font-heading text-xl font-bold">My Garage</p>
            <p className="text-sm text-muted-foreground">Your saved vehicles</p>
          </Link>
        </div>
        <section className="rounded-brand border bg-white p-5">
          <h2 className="mb-4 flex items-center gap-2 text-2xl">
            <Package className="size-5 text-red-600" /> Orders
          </h2>
          {orders.length ? (
            <ul className="divide-y">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <Link href={`/order/${o.orderNumber}`} className="font-mono font-semibold text-navy-500 hover:underline">
                    {o.orderNumber}
                  </Link>
                  <span className="text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('en-PK')}</span>
                  <span className="rounded-full bg-navy-100 px-2 py-0.5 font-semibold">{statusLabel(o.status)}</span>
                  <span className="font-bold">{formatPrice(o.total ?? 0)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          )}
        </section>
        {customer.type !== 'workshop' ? (
          <section className="rounded-brand border bg-white p-5">
            <h2 className="mb-1 text-2xl">Own a workshop?</h2>
            <p className="mb-4 text-sm text-muted-foreground">Get trade prices on every part, priority delivery and monthly statements.</p>
            <WorkshopApply pending={Boolean(customer.workshopRequestedAt)} />
          </section>
        ) : null}
        {customer.addresses?.length ? (
          <section className="rounded-brand border bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 text-2xl">
              <MapPin className="size-5 text-red-600" /> Addresses
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {customer.addresses.map((a) => (
                <li key={a.id} className="rounded-lg bg-navy-100/50 p-3 text-sm">
                  <strong>{a.label ?? 'Address'}</strong>
                  <br />
                  {a.address}, {a.area ? `${a.area}, ` : ''}
                  {a.city}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  )
}

import Link from 'next/link'
import type { Payload } from 'payload'

import { statusLabel } from '@/lib/orders/status'

const rs = (n: number) => `Rs ${Math.round(n).toLocaleString('en-PK')}`

const ACTIONS = [
  { href: '/admin/collections/orders', title: 'Orders', text: 'New orders, update status, invoices' },
  { href: '/admin/collections/products/create', title: 'Add a product', text: 'Photos, price, stock, fitment' },
  { href: '/admin/collections/products', title: 'Prices & stock', text: 'Search by name, SKU or OEM' },
  { href: '/admin/bulk-prices', title: 'Bulk price update', text: 'Raise or cut prices by % or Rs' },
  { href: '/admin/import-export', title: 'Excel import/export', text: 'Update 1,000 prices at once' },
  { href: '/admin/globals/site-settings', title: 'Phone & WhatsApp', text: 'Numbers, address, hours' },
  { href: '/admin/globals/homepage', title: 'Homepage', text: 'Reorder or hide sections' },
  { href: '/admin/collections/banners', title: 'Banners', text: 'Homepage & category offers' },
  { href: '/admin/collections/pages', title: 'Pages', text: 'About Us, FAQ, policies' },
  { href: '/admin/globals/delivery-settings', title: 'Delivery', text: 'Fees, cities, cutoff time' },
]

async function revenueSince(payload: Payload, since: Date) {
  const { docs } = await payload.find({
    collection: 'orders',
    where: { and: [{ createdAt: { greater_than_equal: since.toISOString() } }, { status: { not_in: ['cancelled', 'returned'] } }] },
    limit: 0,
    pagination: false,
    depth: 0,
    overrideAccess: true,
    select: { total: true },
  })
  return { count: docs.length, revenue: docs.reduce((s, o) => s + (o.total ?? 0), 0) }
}

/** Owner dashboard: today's numbers, what needs attention, and big shortcuts. */
export default async function Dashboard({ payload, user }: { payload: Payload; user?: { role?: string; name?: string } | null }) {
  const pkMidnight = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }))
  pkMidnight.setHours(0, 0, 0, 0)
  const offset = new Date().getTime() - new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })).getTime()
  const todayStart = new Date(pkMidnight.getTime() + offset)
  const days = (n: number) => new Date(Date.now() - n * 86400000)
  const showMoney = user?.role === 'owner' || user?.role === 'manager'

  const [today, week, month, pending, lowStock, requests, recent, top] = await Promise.all([
    revenueSince(payload, todayStart),
    revenueSince(payload, days(7)),
    revenueSince(payload, days(30)),
    payload.count({ collection: 'orders', where: { status: { in: ['pending', 'confirmed', 'packed'] } }, overrideAccess: true }),
    payload.find({ collection: 'products', where: { stock: { less_than_equal: 3 } }, sort: 'stock', limit: 8, depth: 0, overrideAccess: true, select: { title: true, stock: true, lowStockThreshold: true, sku: true } }),
    payload.find({ collection: 'part-requests', where: { status: { equals: 'new' } }, sort: '-createdAt', limit: 5, depth: 0, overrideAccess: true }),
    payload.find({ collection: 'orders', sort: '-createdAt', limit: 6, depth: 0, overrideAccess: true, select: { orderNumber: true, customerName: true, total: true, status: true, city: true } }),
    payload.find({ collection: 'products', sort: '-salesCount', limit: 5, depth: 0, overrideAccess: true, select: { title: true, salesCount: true } }),
  ])

  const stat = (label: string, value: string, sub?: string, href?: string) => {
    const body = (
      <>
        <span className="py-stat__label">{label}</span>
        <strong className="py-stat__value">{value}</strong>
        {sub ? <span className="py-stat__sub">{sub}</span> : null}
      </>
    )
    return href ? (
      <Link href={href} className="py-stat">
        {body}
      </Link>
    ) : (
      <div className="py-stat">{body}</div>
    )
  }

  return (
    <section className="py-dash">
      <div className="py-welcome">
        <h2>Assalam o Alaikum{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</h2>
        <p>Here’s your store today. What would you like to do?</p>
        <div className="py-stats">
          {stat('Orders today', String(today.count), showMoney ? rs(today.revenue) : undefined, '/admin/collections/orders')}
          {stat('Waiting to ship', String(pending.totalDocs), 'pending · confirmed · packed', '/admin/collections/orders?where[status][in][0]=pending&where[status][in][1]=confirmed&where[status][in][2]=packed')}
          {showMoney ? stat('Last 7 days', rs(week.revenue), `${week.count} orders`) : null}
          {showMoney ? stat('Last 30 days', rs(month.revenue), `${month.count} orders`) : null}
        </div>
        <div className="py-welcome__grid">
          {ACTIONS.map((a) => (
            <Link key={a.href} href={a.href} className="py-welcome__card">
              <strong>{a.title}</strong>
              <span>{a.text}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="py-panels">
        <div className="py-panel">
          <h3>⚠️ Low stock</h3>
          {lowStock.docs.length ? (
            <ul>
              {lowStock.docs.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/collections/products/${p.id}`}>{p.title.split(' – ').slice(0, 2).join(' – ')}</Link>
                  <span className={p.stock <= 0 ? 'py-pill py-pill--red' : 'py-pill py-pill--amber'}>{p.stock <= 0 ? 'Out' : `${p.stock} left`}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-muted">All products are well stocked.</p>
          )}
        </div>
        <div className="py-panel">
          <h3>🧾 Latest orders</h3>
          <ul>
            {recent.docs.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/collections/orders/${o.id}`}>
                  {o.orderNumber} · {o.customerName} · {o.city}
                </Link>
                <span className="py-pill">{statusLabel(o.status)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="py-panel">
          <h3>📸 New part requests</h3>
          {requests.docs.length ? (
            <ul>
              {requests.docs.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/collections/part-requests/${r.id}`}>
                    {r.name} · {r.partName || r.vehicle || 'part request'}
                  </Link>
                  <a className="py-pill py-pill--green" href={`https://wa.me/92${r.phone.replace(/\D/g, '').replace(/^0/, '')}`} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-muted">No new requests.</p>
          )}
        </div>
        <div className="py-panel">
          <h3>🏆 Top sellers</h3>
          <ul>
            {top.docs.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/collections/products/${p.id}`}>{p.title.split(' – ').slice(0, 2).join(' – ')}</Link>
                <span className="py-pill">{p.salesCount ?? 0} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

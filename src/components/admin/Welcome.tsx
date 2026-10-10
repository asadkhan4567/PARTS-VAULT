import Link from 'next/link'

const ACTIONS = [
  { href: '/admin/collections/orders', title: 'Orders', text: 'See new orders and update their status' },
  { href: '/admin/collections/products/create', title: 'Add a product', text: 'Photos, price, stock and which cars it fits' },
  { href: '/admin/collections/products', title: 'Change prices & stock', text: 'Search by name, SKU or OEM number' },
  { href: '/admin/globals/site-settings', title: 'Phone & WhatsApp', text: 'Numbers, address, hours, social links' },
  { href: '/admin/globals/homepage', title: 'Homepage', text: 'Reorder or hide sections' },
  { href: '/admin/collections/banners', title: 'Banners', text: 'Add or schedule homepage offers' },
  { href: '/admin/collections/pages', title: 'Pages', text: 'About Us, FAQ, policies' },
  { href: '/admin/globals/delivery-settings', title: 'Delivery', text: 'Fees, cities, same-day cutoff' },
]

/** Shown above the default dashboard: big, plain-language shortcuts for the owner. */
export default function Welcome() {
  return (
    <section className="py-welcome">
      <h2>Welcome to your Partsyaar admin</h2>
      <p>What would you like to do?</p>
      <div className="py-welcome__grid">
        {ACTIONS.map((a) => (
          <Link key={a.href} href={a.href} className="py-welcome__card">
            <strong>{a.title}</strong>
            <span>{a.text}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

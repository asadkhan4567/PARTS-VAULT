import Link from 'next/link'

export default function NavLinks() {
  return (
    <div className="py-navlinks">
      <p className="py-navlinks__title">Tools</p>
      <Link href="/admin/bulk-prices">💸 Bulk price update</Link>
      <Link href="/admin/import-export">📊 Excel import / export</Link>
      <Link href="/" target="_blank">
        🌐 View website
      </Link>
    </div>
  )
}

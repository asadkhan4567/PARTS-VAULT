'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { formatPrice } from '@/lib/utils'
import { readRecentlyViewed } from '@/lib/wishlist'

type Mini = { id: number; title: string; slug: string; price: number; image: string | null }

/** Recently viewed products (ids in localStorage, details fetched from /products/mini). */
export function RecentlyViewed({ excludeId }: { excludeId: number }) {
  const [items, setItems] = useState<Mini[]>([])
  useEffect(() => {
    const ids = readRecentlyViewed().filter((id) => id !== excludeId).slice(0, 8)
    if (!ids.length) return
    fetch(`/products/mini?ids=${ids.join(',')}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Mini[]) => setItems(ids.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as Mini[]))
      .catch(() => undefined)
  }, [excludeId])
  if (!items.length) return null
  return (
    <section className="container-py py-10">
      <h2 className="mb-4 text-2xl">Recently viewed</h2>
      <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4">
        {items.map((p) => (
          <Link key={p.id} href={`/product/${p.slug}`} className="w-40 shrink-0 rounded-brand border bg-white p-2 hover:border-red-600">
            <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-navy-100">{p.image ? <Image src={p.image} alt="" fill sizes="160px" className="object-cover" /> : null}</div>
            <p className="line-clamp-2 text-xs font-semibold">{p.title.split(' – ').slice(0, 2).join(' – ')}</p>
            <p className="text-sm font-bold text-red-600">{formatPrice(p.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

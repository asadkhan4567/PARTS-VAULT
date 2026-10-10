'use client'

import { Heart, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { AddToCartButton } from '@/components/product/AddToCartButton'
import { formatPrice } from '@/lib/utils'
import { useWishlist } from '@/lib/wishlist'

type Mini = { id: number; title: string; slug: string; sku: string; price: number; image: string | null; stock: number }

export function WishlistView() {
  const { ids, toggle } = useWishlist()
  const [items, setItems] = useState<Mini[] | null>(null)
  useEffect(() => {
    if (!ids.length) return setItems([])
    fetch(`/products/mini?ids=${ids.join(',')}`)
      .then((r) => r.json())
      .then((rows: Mini[]) => setItems(ids.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as Mini[]))
      .catch(() => setItems([]))
  }, [ids])
  if (items === null) return <div className="h-40 rounded-brand skeleton" />
  if (!items.length)
    return (
      <div className="flex flex-col items-center gap-3 rounded-brand border border-dashed p-12 text-center">
        <Heart className="size-10 text-steel-400" />
        <p className="font-semibold">No saved parts yet</p>
        <Link href="/search" className="text-sm font-semibold text-navy-500 hover:underline">
          Browse parts →
        </Link>
      </div>
    )
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <li key={p.id} className="flex gap-3 rounded-brand border bg-white p-3">
          <Link href={`/product/${p.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-navy-100">
            {p.image ? <Image src={p.image} alt="" fill sizes="96px" className="object-cover" /> : null}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Link href={`/product/${p.slug}`} className="line-clamp-2 text-sm font-semibold hover:underline">
              {p.title}
            </Link>
            <p className="font-bold text-red-600">{formatPrice(p.price)}</p>
            <div className="mt-auto flex items-center gap-2">
              <AddToCartButton item={{ productId: p.id, slug: p.slug, title: p.title, sku: p.sku, price: p.price, image: p.image, maxQuantity: p.stock }} disabled={p.stock <= 0} className="flex-1" />
              <button type="button" onClick={() => toggle(p.id)} className="p-2 text-steel-400 hover:text-red-600" aria-label="Remove from wishlist">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

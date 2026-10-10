'use client'

import Image from 'next/image'
import { useState } from 'react'

import { useCart, type CartItem } from '@/components/providers/CartProvider'
import { formatPrice } from '@/lib/utils'

type Entry = Omit<CartItem, 'quantity'> & { inStock: boolean }

/** "Frequently bought together": pick items, see the bundle price, add all at once. */
export function BundleBox({ main, others, discountPercent }: { main: Entry; others: Entry[]; discountPercent: number }) {
  const { add } = useCart()
  const [picked, setPicked] = useState(() => new Set(others.filter((o) => o.inStock).map((o) => o.productId)))
  const items = [main, ...others.filter((o) => picked.has(o.productId))]
  const total = items.reduce((s, i) => s + i.price, 0)
  const discount = items.length > 1 ? Math.round((total * discountPercent) / 100) : 0
  return (
    <div className="rounded-brand border bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {[main, ...others].map((it, i) => (
          <div key={it.productId} className="flex items-center gap-3">
            {i > 0 ? <span className="text-xl text-steel-400">+</span> : null}
            <div className="relative size-20 overflow-hidden rounded-lg border bg-navy-100">{it.image ? <Image src={it.image} alt="" fill sizes="80px" className="object-cover" /> : null}</div>
          </div>
        ))}
      </div>
      <ul className="space-y-2 text-sm">
        {[main, ...others].map((it, i) => (
          <li key={it.productId}>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-red-600"
                checked={i === 0 || picked.has(it.productId)}
                disabled={i === 0 || !it.inStock}
                onChange={() => {
                  const next = new Set(picked)
                  if (next.has(it.productId)) next.delete(it.productId)
                  else next.add(it.productId)
                  setPicked(next)
                }}
              />
              <span className="flex-1">
                {i === 0 ? <strong>This item: </strong> : null}
                {it.title}
              </span>
              <span className="font-semibold">{formatPrice(it.price)}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div>
          <p className="text-sm text-muted-foreground">Bundle price</p>
          <p className="text-2xl font-bold text-red-600">
            {formatPrice(total - discount)} {discount ? <span className="text-sm font-semibold text-[#0f7a37]">save {formatPrice(discount)}</span> : null}
          </p>
        </div>
        <button
          type="button"
          onClick={() => items.forEach((it, n) => add(it, 1, { openDrawer: n === items.length - 1 }))}
          className="h-11 rounded-lg bg-red-600 px-5 font-semibold text-white hover:bg-red-700"
        >
          Add {items.length} to cart
        </button>
      </div>
      {discountPercent ? <p className="mt-2 text-xs text-muted-foreground">{discountPercent}% bundle discount applied at checkout when bought together.</p> : null}
    </div>
  )
}

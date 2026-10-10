'use client'

import { ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { DeliveryConfig } from '@/lib/delivery'
import { formatPrice } from '@/lib/utils'

import { useCart } from '../providers/CartProvider'
import { FreeDeliveryBar, QuantityStepper } from './CartDrawer'
import { CouponField, Totals } from './Summary'
import { useQuote } from './useQuote'

export function CartPageView({ delivery }: { delivery: DeliveryConfig }) {
  const { items, setQuantity, remove, ready } = useCart()
  const cities = (delivery.zones ?? []).map((z) => z.city)
  const [city, setCity] = useState(cities[0] ?? '')
  useEffect(() => {
    try {
      const saved = localStorage.getItem('py_city')
      if (saved) setCity(saved)
    } catch {
      // ignore
    }
  }, [])
  const { quote, loading } = useQuote({ city })

  if (ready && !items.length)
    return (
      <div className="container-py flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag className="size-14 text-steel-400" />
        <h1 className="text-4xl">Your cart is empty</h1>
        <p className="text-muted-foreground">Pick your car and add parts that fit.</p>
        <Button asChild size="lg">
          <Link href="/search">Browse parts</Link>
        </Button>
      </div>
    )

  return (
    <div className="container-py py-10">
      <h1 className="mb-6 text-4xl">Your cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <FreeDeliveryBar delivery={delivery} subtotal={quote ? quote.subtotal - quote.bundleDiscount : 0} />
          <ul className="divide-y rounded-brand border bg-white">
            {items.map((i) => {
              const line = quote?.lines.find((l) => l.productId === i.productId)
              return (
                <li key={i.productId} className="flex gap-4 p-4">
                  <Link href={`/product/${i.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-navy-100">
                    {i.image ? <Image src={i.image} alt="" fill sizes="96px" className="object-cover" /> : null}
                  </Link>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Link href={`/product/${i.slug}`} className="font-semibold hover:underline">
                      {i.title}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">{i.sku}</p>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <QuantityStepper value={i.quantity} max={i.maxQuantity || 99} onChange={(n) => setQuantity(i.productId, n)} />
                      <div className="text-right">
                        <p className="font-bold text-red-600">{formatPrice((line?.unitPrice ?? i.price) * i.quantity)}</p>
                        {line?.bundleDiscount ? <p className="text-xs font-semibold text-[#0f7a37]">Bundle −{formatPrice(line.bundleDiscount)}</p> : null}
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => remove(i.productId)} className="self-start p-1 text-steel-400 hover:text-red-600" aria-label={`Remove ${i.title}`}>
                    <Trash2 className="size-5" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <aside className="h-fit space-y-4 rounded-brand border bg-white p-5 lg:sticky lg:top-36">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Delivery city</span>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="h-10 flex-1 rounded-lg border bg-white px-2 font-semibold">
              {cities.map((c) => (
                <option key={c}>{c}</option>
              ))}
              <option value="Other">Other city</option>
            </select>
          </label>
          <CouponField />
          <Totals quote={quote} loading={loading} />
          <Button asChild size="lg" className="w-full">
            <Link href="/checkout" data-testid="go-checkout">
              Proceed to checkout
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">Cash on Delivery available · 100% genuine guarantee</p>
        </aside>
      </div>
    </div>
  )
}

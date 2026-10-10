'use client'

import { useEffect, useRef, useState } from 'react'

import { quoteCart } from '@/app/(frontend)/checkout/actions'
import type { Quote } from '@/lib/checkout/types'

import { useCart } from '../providers/CartProvider'

/** Server-priced totals for the current cart, refreshed (debounced) when inputs change. */
export function useQuote(opts: { city?: string | null; paymentMethod?: string | null; phone?: string | null }) {
  const { items, coupon, ready } = useCart()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const seq = useRef(0)
  const key = JSON.stringify([items.map((i) => [i.productId, i.quantity]), coupon, opts.city, opts.paymentMethod, opts.phone])
  useEffect(() => {
    if (!ready) return
    const n = ++seq.current
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const q = await quoteCart({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          city: opts.city,
          couponCode: coupon,
          paymentMethod: opts.paymentMethod,
          phone: opts.phone,
        })
        if (n === seq.current) setQuote(q)
      } finally {
        if (n === seq.current) setLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready])
  return { quote, loading }
}

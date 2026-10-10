'use client'

import { Loader2, Tag, X } from 'lucide-react'
import { useState } from 'react'

import type { Quote } from '@/lib/checkout/types'
import { cn, formatPrice } from '@/lib/utils'

import { useCart } from '../providers/CartProvider'

export function CouponField() {
  const { coupon, setCoupon } = useCart()
  const [code, setCode] = useState('')
  if (coupon)
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed border-success bg-success/5 px-3 py-2 text-sm">
        <span className="flex items-center gap-2 font-mono font-semibold">
          <Tag className="size-4 text-success" /> {coupon}
        </span>
        <button type="button" onClick={() => setCoupon(null)} className="text-steel-400 hover:text-red-600" aria-label="Remove coupon">
          <X className="size-4" />
        </button>
      </div>
    )
  const apply = () => {
    if (code.trim()) setCoupon(code.trim().toUpperCase())
  }
  // Not a <form>: this field also sits inside the checkout form, and nested forms are invalid.
  return (
    <div className="flex gap-2">
      <label className="sr-only" htmlFor="coupon">
        Coupon code
      </label>
      <input
        id="coupon"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            apply()
          }
        }}
        placeholder="Coupon code"
        className="h-10 flex-1 rounded-lg border px-3 font-mono text-sm uppercase"
        data-testid="coupon-input"
      />
      <button type="button" onClick={apply} className="h-10 rounded-lg bg-navy-900 px-4 text-sm font-semibold text-white">
        Apply
      </button>
    </div>
  )
}

export function Totals({ quote, loading, className }: { quote: Quote | null; loading?: boolean; className?: string }) {
  const { coupon } = useCart()
  if (!quote) return <div className={cn('h-40 rounded-lg skeleton', className)} />
  const row = (label: React.ReactNode, value: React.ReactNode, cls = '') => (
    <div className={cn('flex items-center justify-between gap-3', cls)}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
  return (
    <div className={cn('space-y-2 text-sm', loading && 'opacity-70', className)} aria-live="polite" data-testid="totals">
      {row('Subtotal', formatPrice(quote.subtotal))}
      {quote.bundleDiscount ? row('Bundle discount', <span className="text-[#0f7a37]">−{formatPrice(quote.bundleDiscount)}</span>) : null}
      {coupon && quote.couponMessage ? (
        <p className={cn('text-xs font-semibold', quote.couponValid ? 'text-[#0f7a37]' : 'text-red-700')} data-testid="coupon-message">
          {quote.couponMessage}
        </p>
      ) : null}
      {quote.couponDiscount ? row(`Coupon (${quote.couponCode})`, <span className="text-[#0f7a37]">−{formatPrice(quote.couponDiscount)}</span>) : null}
      {row('Delivery', quote.deliveryFee ? formatPrice(quote.deliveryFee) : <span className="font-semibold text-[#0f7a37]">Free</span>)}
      {quote.codFee ? row('Cash on Delivery fee', formatPrice(quote.codFee)) : null}
      <div className="flex items-center justify-between border-t pt-3 text-lg font-bold">
        <span>Total</span>
        <span className="flex items-center gap-2 text-red-600" data-testid="order-total">
          {loading ? <Loader2 className="size-4 animate-spin text-steel-400" /> : null}
          {formatPrice(quote.total)}
        </span>
      </div>
      {quote.eta && quote.lines.length ? <p className="text-xs text-muted-foreground">Estimated delivery: {quote.eta}</p> : null}
      {quote.warnings.map((w) => (
        <p key={w} className="rounded-md bg-warning/15 px-3 py-2 text-xs font-semibold text-[#8a5300]" role="alert">
          {w}
        </p>
      ))}
    </div>
  )
}

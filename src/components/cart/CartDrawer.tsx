'use client'

import { Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { useCart } from '@/components/providers/CartProvider'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { freeDeliveryProgress, type DeliveryConfig } from '@/lib/delivery'
import { formatPrice } from '@/lib/utils'

export function QuantityStepper({ value, max, onChange, size = 'sm' }: { value: number; max: number; onChange: (n: number) => void; size?: 'sm' | 'lg' }) {
  const btn = size === 'lg' ? 'size-12' : 'size-9'
  return (
    <div className="inline-flex items-center rounded-lg border">
      <button type="button" className={`grid ${btn} place-items-center hover:bg-navy-100`} onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        <Minus className="size-4" />
      </button>
      <span className="w-8 text-center font-mono text-sm font-semibold" aria-live="polite">
        {value}
      </span>
      <button type="button" className={`grid ${btn} place-items-center hover:bg-navy-100 disabled:opacity-40`} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        <Plus className="size-4" />
      </button>
    </div>
  )
}

export function FreeDeliveryBar({ delivery, subtotal }: { delivery: DeliveryConfig; subtotal: number }) {
  const progress = freeDeliveryProgress(delivery, subtotal)
  if (!progress) return null
  return (
    <div className="rounded-lg bg-navy-100 p-3 text-sm" data-testid="free-delivery">
      <p className="mb-2 flex items-center gap-2 font-semibold">
        <Truck className="size-4 text-red-600" />
        {progress.remaining > 0 ? (
          <>Add {formatPrice(progress.remaining)} more for free delivery</>
        ) : (
          <>You’ve unlocked free delivery 🎉</>
        )}
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-red-600 transition-[width] duration-500" style={{ width: `${progress.percent}%` }} />
      </div>
    </div>
  )
}

export function CartDrawer({ delivery }: { delivery: DeliveryConfig }) {
  const { items, open, setOpen, subtotal, setQuantity, remove, count } = useCart()
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title={`Your cart (${count})`}
      footer={
        items.length ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-base">
              <span>Subtotal</span>
              <strong className="text-xl" data-testid="cart-subtotal">{formatPrice(subtotal)}</strong>
            </div>
            <p className="text-xs text-muted-foreground">Delivery and discounts are calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/cart" onClick={() => setOpen(false)}>View cart</Link>
              </Button>
              <Button asChild>
                <Link href="/checkout" onClick={() => setOpen(false)} data-testid="checkout-link">Checkout</Link>
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      <div className="space-y-4 p-5">
        {items.length ? (
          <>
            <FreeDeliveryBar delivery={delivery} subtotal={subtotal} />
            <ul className="divide-y">
              {items.map((i) => (
                <li key={i.productId} className="flex gap-3 py-4">
                  <Link href={`/product/${i.slug}`} onClick={() => setOpen(false)} className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-navy-100">
                    {i.image ? <Image src={i.image} alt="" fill sizes="80px" className="object-cover" /> : null}
                  </Link>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Link href={`/product/${i.slug}`} onClick={() => setOpen(false)} className="line-clamp-2 text-sm font-semibold hover:underline">
                      {i.title}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">{i.sku}</p>
                    <div className="flex items-center justify-between gap-2">
                      <QuantityStepper value={i.quantity} max={i.maxQuantity || 99} onChange={(n) => setQuantity(i.productId, n)} />
                      <span className="font-bold text-red-600">{formatPrice(i.price * i.quantity)}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => remove(i.productId)} className="self-start p-1 text-steel-400 hover:text-red-600" aria-label={`Remove ${i.title}`}>
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ShoppingBag className="size-12 text-steel-400" />
            <p className="font-heading text-xl font-bold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Select your vehicle and find parts that fit.</p>
            <Button asChild>
              <Link href="/search" onClick={() => setOpen(false)}>Browse parts</Link>
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  )
}

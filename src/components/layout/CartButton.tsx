'use client'

import { ShoppingCart } from 'lucide-react'

import { useCart } from '@/components/providers/CartProvider'
import { cn } from '@/lib/utils'

export function CartButton({ className, label = false }: { className?: string; label?: boolean }) {
  const { count, setOpen, addedTick, ready } = useCart()
  return (
    <button type="button" onClick={() => setOpen(true)} className={cn('relative inline-flex items-center gap-2', className)} aria-label={`Cart, ${count} items`} data-testid="cart-button" data-cart-target>
      <ShoppingCart className="size-6" />
      {label ? <span className="text-[11px] font-semibold">Cart</span> : null}
      {ready && count > 0 ? (
        <span key={addedTick} className="absolute -right-2 -top-1.5 grid min-w-5 animate-[py-bounce_.45s_ease-out] place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white" data-testid="cart-count">
          {count}
        </span>
      ) : null}
    </button>
  )
}

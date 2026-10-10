'use client'

import { Check, ShoppingCart } from 'lucide-react'
import { useRef, useState } from 'react'

import { useCart, type CartItem } from '@/components/providers/CartProvider'
import { useLang } from '@/components/providers/LangProvider'
import { flyToCart } from '@/lib/motion/fly-to-cart'
import { cn } from '@/lib/utils'

type Props = {
  item: Omit<CartItem, 'quantity'>
  quantity?: number
  disabled?: boolean
  className?: string
  size?: 'sm' | 'lg'
  label?: string
  openDrawer?: boolean
}

export function AddToCartButton({ item, quantity = 1, disabled, className, size = 'sm', label, openDrawer = true }: Props) {
  const { add } = useCart()
  const { t } = useLang()
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      data-testid="add-to-cart"
      onClick={() => {
        if (ref.current && item.image) flyToCart(ref.current, item.image)
        add(item, quantity, { openDrawer })
        setDone(true)
        setTimeout(() => setDone(false), 1400)
      }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-red-600 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-steel-400',
        size === 'lg' ? 'h-13 px-6 text-base' : 'h-10 px-3 text-sm',
        className,
      )}
    >
      {done ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
      {disabled ? t('out_of_stock') : done ? t('added') : (label ?? t('add_to_cart'))}
    </button>
  )
}

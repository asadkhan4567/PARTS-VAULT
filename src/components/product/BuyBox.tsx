'use client'

import { Heart, Share2, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { QuantityStepper } from '@/components/cart/CartDrawer'
import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat'
import { useCart, type CartItem } from '@/components/providers/CartProvider'
import { useLang } from '@/components/providers/LangProvider'
import { cn, formatPrice } from '@/lib/utils'
import { pushRecentlyViewed, useWishlist } from '@/lib/wishlist'

import { AddToCartButton } from './AddToCartButton'

type Props = {
  item: Omit<CartItem, 'quantity'>
  inStock: boolean
  whatsappHref: string
  shareUrl: string
}

/** Quantity, Add to cart, Buy now, Order on WhatsApp, Wishlist, Share + sticky mobile bar. */
export function BuyBox({ item, inStock, whatsappHref, shareUrl }: Props) {
  const router = useRouter()
  const { add } = useCart()
  const { t } = useLang()
  const wishlist = useWishlist()
  const [qty, setQty] = useState(1)
  const [shared, setShared] = useState(false)
  const [showSticky, setShowSticky] = useState(false)
  const anchor = useRef<HTMLDivElement>(null)

  useEffect(() => pushRecentlyViewed(item.productId), [item.productId])
  useEffect(() => {
    const el = anchor.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const buyNow = () => {
    add(item, qty, { openDrawer: false })
    router.push('/checkout')
  }
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: item.title, url: shareUrl })
      else {
        await navigator.clipboard.writeText(shareUrl)
        setShared(true)
        setTimeout(() => setShared(false), 1500)
      }
    } catch {
      // cancelled
    }
  }
  const saved = wishlist.has(item.productId)

  return (
    <div className="space-y-3">
      <div ref={anchor} className="flex flex-wrap items-center gap-3">
        {inStock ? <QuantityStepper value={qty} max={item.maxQuantity || 99} onChange={(n) => setQty(Math.max(1, n))} size="lg" /> : null}
        <AddToCartButton item={item} quantity={qty} disabled={!inStock} size="lg" className="flex-1" />
      </div>
      {inStock ? (
        <button type="button" onClick={buyNow} data-testid="buy-now" className="flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-navy-900 font-semibold text-white hover:bg-navy-700">
          <Zap className="size-4 text-red-600" /> {t('buy_now')}
        </button>
      ) : null}
      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" data-testid="order-whatsapp" className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-[#25D366] font-semibold text-navy-950 hover:bg-[#25D366]/10">
        <WhatsAppIcon className="size-5 text-[#25D366]" /> {t('order_whatsapp')}
      </a>
      <div className="flex gap-2">
        <button type="button" onClick={() => wishlist.toggle(item.productId)} aria-pressed={saved} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold hover:border-red-600">
          <Heart className={cn('size-4', saved && 'fill-red-600 text-red-600')} /> {saved ? '♥' : t('wishlist')}
        </button>
        <button type="button" onClick={share} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold hover:border-navy-500">
          <Share2 className="size-4" /> {shared ? '✓' : t('share')}
        </button>
      </div>

      {/* Sticky Add-to-Cart on phones once the main button scrolls away */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 border-t bg-white/95 p-3 shadow-[0_-8px_30px_-12px_rgb(6_18_42/0.4)] backdrop-blur transition-transform duration-300 md:hidden',
          showSticky ? 'translate-y-0' : 'pointer-events-none translate-y-[200%]',
        )}
        aria-hidden={!showSticky}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">{item.title.split(' – ')[0]}</p>
          <p className="font-bold text-red-600">{formatPrice(item.price)}</p>
        </div>
        <AddToCartButton item={item} quantity={qty} disabled={!inStock} label="Add" className="h-11 px-5" />
      </div>
    </div>
  )
}

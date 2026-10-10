'use client'

import { Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import type { CartItem } from '@/components/providers/CartProvider'
import { Sheet } from '@/components/ui/sheet'
import { formatPrice } from '@/lib/utils'

import { AddToCartButton } from './AddToCartButton'

type Props = {
  item: Omit<CartItem, 'quantity'>
  image: string | null
  brand: string
  oem: string | null
  compareAt: number | null
  inStock: boolean
  fitText: string | null
  fits: boolean | null
  specs: Array<{ label: string; value: string }>
}

/** "Quick view" slide-up on product cards (desktop hover; always tappable for keyboard users). */
export function QuickView({ item, image, brand, oem, compareAt, inStock, fitText, fits, specs }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute inset-x-3 bottom-3 z-10 hidden translate-y-[140%] items-center justify-center gap-2 rounded-lg bg-white/95 py-2 text-sm font-semibold text-navy-900 shadow-navy backdrop-blur transition-transform duration-300 group-hover/card:translate-y-0 focus-visible:translate-y-0 md:flex"
      >
        <Eye className="size-4" /> Quick view
      </button>
      <Sheet open={open} onOpenChange={setOpen} title="Quick view" side="center">
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-navy-100">{image ? <Image src={image} alt={item.title} fill sizes="(min-width:640px) 320px, 90vw" className="object-cover" /> : null}</div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-steel-400">{brand}</p>
            <h3 className="font-heading text-2xl leading-tight font-bold">{item.title.split(' – ').slice(0, 2).join(' – ')}</h3>
            {oem ? <p className="font-mono text-sm text-muted-foreground">OEM {oem}</p> : null}
            {fitText ? <p className={`text-sm font-semibold ${fits ? 'text-[#0f7a37]' : 'text-red-700'}`}>{fitText}</p> : null}
            <p className="text-3xl font-bold text-red-600">
              {formatPrice(item.price)} {compareAt && compareAt > item.price ? <span className="text-base font-normal text-muted-foreground line-through">{formatPrice(compareAt)}</span> : null}
            </p>
            {specs.length ? (
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                {specs.slice(0, 4).map((s) => (
                  <div key={s.label} className="contents">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <AddToCartButton item={item} disabled={!inStock} size="lg" className="w-full" />
            <Link href={`/product/${item.slug}`} onClick={() => setOpen(false)} className="block text-center text-sm font-semibold text-navy-500 hover:underline">
              See full details →
            </Link>
          </div>
        </div>
      </Sheet>
    </>
  )
}

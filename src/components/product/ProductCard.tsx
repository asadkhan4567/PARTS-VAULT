import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { fitsVehicle } from '@/lib/fitment'
import { mediaUrl } from '@/lib/media'
import {
  conditionLabel,
  priceFor,
  relName,
  savings,
  savingsPercent,
  stockState,
} from '@/lib/product'
import { cn, formatPrice } from '@/lib/utils'
import type { Vehicle } from '@/lib/vehicle'
import type { Customer, Product } from '@/payload-types'

import { AddToCartButton } from './AddToCartButton'
import { FitBadge, Stars, StockBadge } from './badges'
import { QuickView } from './QuickView'

export function toCartItem(p: Product, price: number) {
  return {
    productId: p.id,
    slug: p.slug ?? '',
    title: p.title,
    sku: p.sku,
    price,
    image: mediaUrl(p.images?.[0], 'thumb'),
    maxQuantity: Math.max(0, p.stock),
  }
}

type Props = {
  product: Product
  vehicle: Vehicle | null
  customer?: Pick<Customer, 'type'> | null
  priority?: boolean
  className?: string
}

/** Product tile: image, genuine badge, fit check, price + savings, stock, add to cart. */
export function ProductCard({ product: p, vehicle, customer, priority, className }: Props) {
  const price = priceFor(p, customer)
  const save = savings(price, p.compareAtPrice)
  const fits = fitsVehicle(p, vehicle)
  const stock = stockState(p)
  const img = mediaUrl(p.images?.[0], 'card')
  const img2 = mediaUrl(p.images?.[1], 'card')
  const href = `/product/${p.slug}`
  // Title format "Part – Vehicle – OEM – Brand": show part + vehicle, OEM separately.
  const [part, vehicleLabel] = p.title.split(' – ')

  return (
    <article
      className={cn(
        'group/card relative flex h-full flex-col overflow-hidden rounded-brand border bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-navy-500/30 hover:shadow-navy',
        fits === false && 'opacity-80',
        className,
      )}
      data-testid="product-card"
    >
      <div className="relative">
        <Link
          href={href}
          className="relative block aspect-square overflow-hidden bg-navy-100"
          tabIndex={-1}
          aria-hidden
        >
          {img ? (
            <Image
              src={img}
              alt=""
              fill
              sizes="(min-width:1024px) 22vw, (min-width:640px) 33vw, 50vw"
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
          ) : null}
          {img2 ? (
            <Image
              src={img2}
              alt=""
              fill
              sizes="(min-width:1024px) 22vw, 50vw"
              className="object-cover opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
            />
          ) : null}
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            <Badge
              variant={p.condition === 'aftermarket' ? 'outline' : 'navy'}
              className={p.condition === 'aftermarket' ? 'bg-white' : ''}
            >
              {conditionLabel(p.condition)}
            </Badge>
            {save ? <Badge>-{savingsPercent(price, p.compareAtPrice)}%</Badge> : null}
          </div>
        </Link>
        <QuickView
          item={toCartItem(p, price)}
          image={mediaUrl(p.images?.[0], 'large')}
          brand={relName(p.partBrand)}
          oem={p.oemNumber ?? null}
          compareAt={p.compareAtPrice ?? null}
          inStock={stock !== 'out'}
          fits={fits}
          fitText={
            fits === null || !vehicle
              ? null
              : fits
                ? `✓ Fits ${vehicle.modelName} ${vehicle.year}`
                : `✗ Doesn’t fit ${vehicle.modelName} ${vehicle.year}`
          }
          specs={(p.specs ?? []).map((sp) => ({ label: sp.label, value: sp.value }))}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {relName(p.partBrand)}
        </p>
        <h3 className="font-heading text-base leading-tight font-bold text-navy-950 sm:text-lg">
          <Link
            href={href}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {part}
          </Link>
        </h3>
        {vehicleLabel ? (
          <p className="line-clamp-1 text-xs text-muted-foreground">{vehicleLabel}</p>
        ) : null}
        {p.oemNumber ? (
          <p className="font-mono text-xs text-muted-foreground">OEM {p.oemNumber}</p>
        ) : null}
        <FitBadge
          fits={fits}
          vehicleName={vehicle ? `${vehicle.modelName} ${vehicle.year}` : undefined}
        />
        <Stars value={p.ratingAvg ?? 0} count={p.ratingCount ?? 0} />
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-1">
          <div>
            <p
              className="text-lg font-bold leading-none text-red-600 sm:text-xl"
              data-testid="product-price"
            >
              {formatPrice(price)}
            </p>
            {save ? (
              <p className="mt-1 text-xs text-muted-foreground line-through">
                {formatPrice(p.compareAtPrice!)}
              </p>
            ) : null}
            {customer?.type === 'workshop' && p.workshopPrice ? (
              <p className="mt-1 text-[11px] font-semibold text-navy-500">Workshop price</p>
            ) : null}
          </div>
          <StockBadge state={stock} stock={p.stock} />
        </div>
        <div className="relative z-10 pt-1">
          <AddToCartButton
            item={toCartItem(p, price)}
            disabled={stock === 'out'}
            className="w-full"
          />
        </div>
      </div>
    </article>
  )
}

export function ProductGrid({
  products,
  vehicle,
  customer,
  className,
}: {
  products: Product[]
  vehicle: Vehicle | null
  customer?: Pick<Customer, 'type'> | null
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4', className)}>
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          vehicle={vehicle}
          customer={customer}
          priority={i < 2}
        />
      ))}
    </div>
  )
}

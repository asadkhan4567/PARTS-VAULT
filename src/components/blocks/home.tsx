import { ArrowRight, MapPin, Store } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { NewsletterForm } from '@/components/layout/NewsletterForm'
import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat'
import { Countdown } from '@/components/motion/Countdown'
import { CountUp } from '@/components/motion/CountUp'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { FitBadge, Stars, StockBadge } from '@/components/product/badges'
import { ProductCard, toCartItem } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { T } from '@/components/providers/LangProvider'
import { HeroVisual } from '@/components/three/HeroVisual'
import { VehicleFinder } from '@/components/vehicle/VehicleFinder'
import { getCategoryTree, getMakes, getPartBrands } from '@/lib/data/catalog'
import { getBanners, getBlogPosts, getReviews } from '@/lib/data/content'
import { listProducts } from '@/lib/data/products'
import { fitsVehicle } from '@/lib/fitment'
import { iconFor } from '@/lib/icons'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { priceFor, relName, savings, stockState } from '@/lib/product'
import { cn, formatPrice } from '@/lib/utils'
import { whatsappLink } from '@/lib/whatsapp'
import type {
  Banner,
  BlogTeaserBlock,
  BrandMarqueeBlock,
  DealOfTheDayBlock,
  DeliveryStripBlock,
  FeatureBannersBlock,
  HeroBlock,
  NewsletterBlock,
  PartRequestBlock,
  PopularCategoriesBlock,
  Product,
  ProductTabsBlock,
  PromoBannersBlock,
  ReviewsBlock,
  ShopByMakeBlock,
  StatsBlock,
  TrustStripBlock,
} from '@/payload-types'

import { PartRequestForm } from './PartRequestForm'
import { ProductTabsClient } from './ProductTabsClient'
import { Section, SectionHeading } from './Section'
import type { BlockContext } from './types'

/** Resolve "#whatsapp" (and empty) CTA links to the store's WhatsApp. */
const ctaHref = (url: string | null | undefined, ctx: BlockContext) =>
  !url || url === '#whatsapp' ? whatsappLink(ctx.settings.site.whatsapp, 'Assalam o Alaikum! I need a part.') : url
const isExternal = (url: string) => url.startsWith('http')

// ——— Hero ———
export function Hero({ block, ctx }: { block: HeroBlock; ctx: BlockContext }) {
  const [before, after] = block.highlight && block.headline.includes(block.highlight) ? block.headline.split(block.highlight) : [block.headline, '']
  const bg = mediaUrl(block.backgroundImage, 'banner')
  const primary = block.primaryCta?.label ? block.primaryCta : null
  const secondary = block.secondaryCta?.label ? block.secondaryCta : null
  const video = mediaUrl(block.backgroundVideo)
  const show3D = block.show3D !== false
  const finder = block.showFinder ? (
    <div className="glass rounded-2xl p-4 shadow-2xl sm:p-6" id="finder">
      <p className="mb-1 font-heading text-2xl font-bold">
        <T k="find_parts" />
      </p>
      <p className="mb-4 text-sm text-steel-400">
        <T k="find_parts_hint" />
      </p>
      <VehicleFinder navigate tone="dark" wide={show3D} />
    </div>
  ) : null
  return (
    <section className="bg-hero relative isolate overflow-hidden text-white" data-hero>
      {bg ? <Image src={bg} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-30" /> : null}
      {/* Red light streak */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-1/4 top-[62%] h-[3px] w-[150%] -rotate-6 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-80 blur-[1px] motion-safe:animate-[py-streak_6s_ease-in-out_infinite]" />
        <div className="absolute -right-40 -top-40 size-[520px] rounded-full bg-navy-500/30 blur-3xl" />
      </div>
      <div className={cn('container-py grid items-center gap-8 py-10 md:py-16', show3D ? 'lg:grid-cols-2' : 'lg:grid-cols-[1.1fr_1fr]')}>
        <div className="space-y-6">
          {block.eyebrow ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90">
              <span className="size-2 animate-pulse rounded-full bg-success" /> {block.eyebrow}
            </p>
          ) : null}
          <h1 className="text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl" data-split>
            {before}
            {block.highlight && block.headline.includes(block.highlight) ? <span className="text-red-600">{block.highlight}</span> : null}
            {after}
          </h1>
          {block.subheadline ? <p className="max-w-xl text-base text-steel-400 md:text-lg">{block.subheadline}</p> : null}
          <div className="flex flex-wrap gap-3">
            {primary ? (
              <Button size="lg" asChild data-magnetic>
                <Link href={ctaHref(primary.url, ctx)}>
                  {primary.label} <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : null}
            {secondary ? (
              <Button size="lg" variant="glass" asChild>
                <a href={ctaHref(secondary.url, ctx)} target={isExternal(ctaHref(secondary.url, ctx)) ? '_blank' : undefined} rel="noopener noreferrer">
                  {secondary.url === '#whatsapp' ? <WhatsAppIcon className="size-5 text-[#25D366]" /> : null}
                  {secondary.label}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
        {show3D ? <div className={video ? 'h-56 sm:h-72 lg:h-[440px]' : 'hidden lg:block lg:h-[440px]'}><HeroVisual videoUrl={video} /></div> : finder}
        {show3D && finder ? <div className="lg:col-span-2">{finder}</div> : null}
      </div>
    </section>
  )
}

// ——— Trust strip ———
export function TrustStrip({ block }: { block: TrustStripBlock }) {
  return (
    <section className="border-b bg-white">
      <div className="container-py grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
        {block.items?.map((it) => {
          const Icon = iconFor(it.icon)
          return (
            <div key={it.title} className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-red-600/10 text-red-600">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-heading text-base font-bold leading-tight">{it.title}</p>
                {it.text ? <p className="text-xs text-muted-foreground">{it.text}</p> : null}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ——— Stats ———
export function Stats({ block }: { block: StatsBlock }) {
  return (
    <section className="bg-navy-900 text-white">
      <div className="container-py grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
        {block.items?.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-heading text-4xl font-bold text-white md:text-5xl">
              <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-sm text-steel-400">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ——— Shop by make ———
export async function ShopByMake({ block }: { block: ShopByMakeBlock }) {
  const all = await getMakes()
  const picked = (block.makes ?? []).map((m) => (typeof m === 'object' ? m.id : m))
  const makes = picked.length ? all.filter((m) => picked.includes(m.id)) : all
  const horizontal = block.layout !== 'grid'
  return (
    <Section data-pin-horizontal={horizontal || undefined}>
      <SectionHeading title={block.heading} subtitle={block.subheading} />
      <div className={cn(horizontal ? 'scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:gap-4' : 'grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6')} data-pin-track>
        {makes.map((m) => (
          <Link
            key={m.id}
            href={`/make/${m.slug}`}
            className={cn(
              'group flex snap-start flex-col items-center gap-2 rounded-brand border bg-white p-4 text-center transition-[transform,border-color,box-shadow] hover:-translate-y-1 hover:border-red-600 hover:shadow-navy',
              horizontal && 'w-32 shrink-0 md:w-40',
            )}
          >
            {mediaUrl(m.logo, 'thumb') ? (
              <Image src={mediaUrl(m.logo, 'thumb')!} alt={`${m.name} logo`} width={80} height={80} className="size-16 rounded-lg object-contain grayscale transition group-hover:grayscale-0 md:size-20" />
            ) : null}
            <span className="font-heading text-base font-bold">{m.name}</span>
          </Link>
        ))}
      </div>
    </Section>
  )
}

// ——— Banners ———
function BannerCard({ banner, className, ctx, large = false }: { banner: Banner; className?: string; ctx: BlockContext; large?: boolean }) {
  const desktop = mediaUrl(banner.imageDesktop, 'banner')
  const mobile = mediaUrl(banner.imageMobile, 'large') ?? desktop
  const tone = banner.theme ?? 'navy'
  const href = banner.ctaLink ? ctaHref(banner.ctaLink, ctx) : null
  const body = (
    <div
      className={cn(
        'group relative isolate flex h-full min-h-56 flex-col justify-end overflow-hidden rounded-brand p-6 md:p-8',
        tone === 'light' ? 'bg-navy-100 text-navy-950' : tone === 'red' ? 'bg-red-700 text-white' : 'bg-navy-900 text-white',
        large && 'min-h-72',
        className,
      )}
    >
      {desktop ? (
        <picture className="absolute inset-0 -z-10">
          {mobile && mobile !== desktop ? <source media="(max-width: 767px)" srcSet={mobile} /> : null}
          <Image src={desktop} alt={mediaAlt(banner.imageDesktop)} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        </picture>
      ) : null}
      <div className={cn('absolute inset-0 -z-10', tone === 'light' ? 'bg-gradient-to-r from-white/90 to-white/10' : 'bg-gradient-to-r from-navy-950/85 via-navy-950/40 to-transparent')} />
      {banner.eyebrow ? <p className="mb-2 text-xs font-bold tracking-[0.2em] text-red-600 [.bg-red-700_&]:text-white/80">{banner.eyebrow}</p> : null}
      {banner.headline ? <h3 className="max-w-md font-heading text-2xl leading-tight font-bold md:text-3xl">{banner.headline}</h3> : null}
      {banner.subtext ? <p className="mt-2 max-w-md text-sm opacity-85">{banner.subtext}</p> : null}
      {banner.ctaText ? (
        <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy-900 transition-colors group-hover:bg-red-600 group-hover:text-white">
          {banner.ctaText} <ArrowRight className="size-4" />
        </span>
      ) : null}
    </div>
  )
  return href ? (
    <Link href={href} className="block h-full" target={isExternal(href) ? '_blank' : undefined}>
      {body}
    </Link>
  ) : (
    body
  )
}

export async function PromoBanners({ block, ctx }: { block: PromoBannersBlock; ctx: BlockContext }) {
  const banners = await getBanners('home_promo', block.banners)
  if (!banners.length) return null
  return (
    <Section className="pt-0 md:pt-0">
      <div className="grid gap-4 md:grid-cols-2">
        {banners.slice(0, 2).map((b) => (
          <BannerCard key={b.id} banner={b} ctx={ctx} large />
        ))}
      </div>
    </Section>
  )
}

export async function FeatureBanners({ block, ctx }: { block: FeatureBannersBlock; ctx: BlockContext }) {
  const banners = await getBanners('home_feature', block.banners)
  if (!banners.length) return null
  return (
    <Section className="pt-0 md:pt-0">
      <div className="grid gap-4 md:grid-cols-3">
        {banners.slice(0, 3).map((b) => (
          <BannerCard key={b.id} banner={b} ctx={ctx} />
        ))}
      </div>
    </Section>
  )
}

export { BannerCard }

// ——— Popular categories ———
export async function PopularCategories({ block }: { block: PopularCategoriesBlock }) {
  const tree = await getCategoryTree()
  const picked = (block.categories ?? []).map((c) => (typeof c === 'object' ? c.id : c))
  const cats = (picked.length ? tree.filter((c) => picked.includes(c.id)) : tree.filter((c) => c.showOnHome)).slice(0, 9)
  return (
    <Section tone="muted">
      <SectionHeading title={block.heading} subtitle={block.subheading} href="/categories" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => {
          const Icon = iconFor(c.icon)
          return (
            <div key={c.id} className="group relative flex gap-4 overflow-hidden rounded-brand border bg-white p-4 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-red-600/60 hover:shadow-[0_10px_30px_-12px_var(--color-red-glow)]" data-tilt>
              <Link href={`/category/${c.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-navy-100" aria-hidden tabIndex={-1}>
                {mediaUrl(c.image, 'thumb') ? <Image src={mediaUrl(c.image, 'thumb')!} alt="" fill sizes="96px" className="object-cover transition-transform duration-500 group-hover:scale-110" /> : null}
              </Link>
              <div className="min-w-0">
                <Link href={`/category/${c.slug}`} className="mb-1.5 flex items-center gap-2 font-heading text-lg font-bold hover:text-red-600">
                  <Icon className="size-4 text-red-600" /> {c.name}
                </Link>
                <ul className="grid gap-0.5">
                  {c.children.slice(0, 4).map((s) => (
                    <li key={s.id}>
                      <Link href={`/category/${s.slug}`} className="text-sm text-muted-foreground hover:text-navy-900 hover:underline">
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

// ——— Deal of the day ———
export async function DealOfTheDay({ block, ctx }: { block: DealOfTheDayBlock; ctx: BlockContext }) {
  const id = typeof block.product === 'object' ? block.product.id : block.product
  const { docs } = await listProducts({ ids: [id], limit: 1, sort: 'popular' })
  const p = docs[0]
  if (!p) return null
  const price = priceFor(p, ctx.customer)
  const save = savings(price, p.compareAtPrice)
  const img = mediaUrl(p.images?.[0], 'large')
  return (
    <Section>
      <div className="grid overflow-hidden rounded-2xl bg-navy-950 text-white md:grid-cols-2">
        <div className="relative aspect-square bg-white md:aspect-auto">
          {img ? <Image src={img} alt={mediaAlt(p.images?.[0], p.title)} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" /> : null}
          {save ? <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm font-bold">Save {formatPrice(save)}</span> : null}
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">{block.heading}</p>
          <h3 className="font-heading text-3xl leading-tight font-bold md:text-4xl">
            <Link href={`/product/${p.slug}`} className="hover:underline">
              {p.title.split(' – ').slice(0, 2).join(' – ')}
            </Link>
          </h3>
          <p className="font-mono text-sm text-steel-400">
            {relName(p.partBrand)} · OEM {p.oemNumber}
          </p>
          <FitBadge fits={fitsVehicle(p, ctx.vehicle)} />
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-red-600">{formatPrice(price)}</span>
            {save ? <span className="pb-1 text-lg text-steel-400 line-through">{formatPrice(p.compareAtPrice!)}</span> : null}
          </div>
          <div>
            <p className="mb-2 text-sm text-steel-400">{block.note ?? 'Offer ends in'}</p>
            <Countdown endsAt={block.endsAt} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AddToCartButton item={toCartItem(p, price)} disabled={stockState(p) === 'out'} size="lg" />
            <StockBadge state={stockState(p)} stock={p.stock} />
          </div>
        </div>
      </div>
    </Section>
  )
}

// ——— Product tabs ———
async function productsForSource(tab: NonNullable<ProductTabsBlock['tabs']>[number]): Promise<Product[]> {
  const limit = tab.limit ?? 10
  switch (tab.source) {
    case 'bestSellers':
      return (await listProducts({ sort: 'popular', limit })).docs
    case 'newArrivals':
      return (await listProducts({ sort: 'newest', limit })).docs
    case 'featured':
      return (await listProducts({ featured: true, sort: 'popular', limit })).docs
    case 'onSale':
      return (await listProducts({ onSale: true, sort: 'popular', limit })).docs
    case 'category': {
      const id = typeof tab.category === 'object' ? tab.category?.id : tab.category
      return id ? (await listProducts({ categoryIds: [id], sort: 'popular', limit })).docs : []
    }
    case 'manual': {
      const ids = (tab.products ?? []).map((p) => (typeof p === 'object' ? p.id : p))
      return (await listProducts({ ids, sort: 'popular', limit })).docs
    }
  }
  return []
}

export function ProductRail({ products, ctx }: { products: Product[]; ctx: BlockContext }) {
  return (
    <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:gap-4">
      {products.map((p) => (
        <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]">
          <ProductCard product={p} vehicle={ctx.vehicle} customer={ctx.customer} />
        </div>
      ))}
    </div>
  )
}

export async function ProductTabs({ block, ctx }: { block: ProductTabsBlock; ctx: BlockContext }) {
  const tabs = await Promise.all((block.tabs ?? []).map(async (t) => ({ label: t.label, products: await productsForSource(t) })))
  return (
    <Section>
      <SectionHeading title={block.heading} href="/search" />
      <ProductTabsClient tabs={tabs.filter((t) => t.products.length).map((t) => ({ label: t.label, content: <ProductRail products={t.products} ctx={ctx} /> }))} />
    </Section>
  )
}

// ——— Same-day delivery strip ———
export function DeliveryStrip({ block, ctx }: { block: DeliveryStripBlock; ctx: BlockContext }) {
  const d = ctx.settings.delivery
  if (!d.sameDayEnabled) return null
  return (
    <section className="overflow-hidden bg-red-600 text-white">
      <div className="container-py grid items-center gap-6 py-8 md:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-3xl md:text-4xl">{block.heading}</h2>
          {block.text ? <p className="mt-2 text-white/90">{block.text}</p> : null}
          <p className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold">
            Same-day cutoff {d.sameDayCutoff} — time left today:
            <Countdown cutoff={d.sameDayCutoff} compact className="rounded-md bg-navy-950 px-2 py-1 text-lg" onDoneText="Order now for tomorrow" />
          </p>
        </div>
        <svg viewBox="0 0 600 140" className="w-full" role="img" aria-label="Rider travelling from our store to your home">
          <path id="py-route" d="M30 100 C 150 20, 250 140, 360 70 S 520 40, 570 80" fill="none" stroke="white" strokeOpacity=".5" strokeWidth="3" strokeDasharray="8 10" />
          <g>
            <circle cx="30" cy="100" r="16" fill="#06122A" />
            <path d="M23 104v-8l7-5 7 5v8z" fill="white" />
          </g>
          <g>
            <circle cx="570" cy="80" r="16" fill="white" />
            <path d="M570 70a7 7 0 0 1 7 7c0 5-7 12-7 12s-7-7-7-12a7 7 0 0 1 7-7z" fill="#E10600" />
          </g>
          <g data-rider>
            <animateMotion dur="6s" repeatCount="indefinite" rotate="0" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
              <mpath href="#py-route" />
            </animateMotion>
            <circle r="14" fill="#06122A" />
            <path d="M-8 3h16M-5 3a3 3 0 1 0 0 .1M5 3a3 3 0 1 0 0 .1M-2 -4h6l2 7" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </section>
  )
}

// ——— Brand marquee ———
export async function BrandMarquee({ block }: { block: BrandMarqueeBlock }) {
  const brands = (await getPartBrands()).filter((b) => b.trusted)
  if (!brands.length) return null
  const row = [...brands, ...brands]
  return (
    <Section tone="muted" className="overflow-hidden">
      <SectionHeading title={block.heading} />
      <div className="group relative [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <ul className="flex w-max gap-4 motion-safe:animate-[py-marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]" aria-label="Brands we stock">
          {row.map((b, i) => (
            <li key={`${b.id}-${i}`} aria-hidden={i >= brands.length || undefined} className="flex h-16 min-w-40 items-center justify-center rounded-lg border bg-white px-6 font-heading text-xl font-bold text-steel-400 grayscale transition hover:text-navy-900 hover:grayscale-0">
              {mediaUrl(b.logo, 'thumb') ? <Image src={mediaUrl(b.logo, 'thumb')!} alt={b.name} width={110} height={40} className="h-8 w-auto object-contain" /> : b.name}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

// ——— Can't find your part ———
export function PartRequest({ block, ctx }: { block: PartRequestBlock; ctx: BlockContext }) {
  return (
    <Section tone="navy" id="part-request">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <h2 className="text-4xl text-white">{block.heading}</h2>
          {block.text ? <p className="text-lg text-steel-400">{block.text}</p> : null}
          <Button size="lg" asChild className="bg-[#25D366] text-navy-950 hover:bg-[#1fb757]">
            <a href={whatsappLink(ctx.settings.site.whatsapp, 'Assalam o Alaikum! I can’t find a part. Here is a photo / my VIN:')} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="size-5" /> {block.buttonLabel ?? 'Send on WhatsApp'}
            </a>
          </Button>
          <ul className="space-y-2 text-sm text-white/80">
            <li>✓ Real parts experts — not a bot</li>
            <li>✓ We check fitment from your chassis/VIN number</li>
            <li>✓ Hard-to-find and imported parts sourced in days</li>
          </ul>
        </div>
        {block.showForm ? (
          <div className="glass rounded-2xl p-5 sm:p-6">
            <PartRequestForm />
          </div>
        ) : null}
      </div>
    </Section>
  )
}

// ——— Reviews ———
export async function Reviews({ block }: { block: ReviewsBlock }) {
  const reviews = await getReviews(block.limit ?? 8)
  if (!reviews.length) return null
  return (
    <Section>
      <SectionHeading title={block.heading} />
      <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
        {reviews.map((r) => {
          const product = typeof r.product === 'object' ? r.product : null
          return (
            <figure key={r.id} className="flex w-[85%] shrink-0 snap-start flex-col gap-3 rounded-brand border bg-white p-5 sm:w-[48%] lg:w-[31%]">
              <Stars value={r.rating} count={1} showCount={false} />
              <blockquote className="space-y-1">
                <p className="font-heading text-lg font-bold">“{r.title}”</p>
                <p className="text-sm text-muted-foreground">{r.text}</p>
              </blockquote>
              <figcaption className="mt-auto flex items-center justify-between gap-2 text-sm">
                <span>
                  <strong>{r.name}</strong>
                  {r.city ? <span className="text-muted-foreground"> · {r.city}</span> : null}
                </span>
                {r.verifiedBuyer ? <span className="text-xs font-semibold text-[#0f7a37]">✓ Verified buyer</span> : null}
              </figcaption>
              {product ? (
                <Link href={`/product/${product.slug}`} className="truncate text-xs text-navy-500 hover:underline">
                  {product.title.split(' – ').slice(0, 2).join(' – ')}
                </Link>
              ) : null}
            </figure>
          )
        })}
      </div>
    </Section>
  )
}

// ——— Blog teaser ———
export async function BlogTeaser({ block }: { block: BlogTeaserBlock }) {
  const { docs } = await getBlogPosts(block.limit ?? 3)
  if (!docs.length) return null
  return (
    <Section tone="muted">
      <SectionHeading title={block.heading} href="/blog" linkLabel="All articles" />
      <div className="grid gap-4 md:grid-cols-3">
        {docs.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </Section>
  )
}

export function BlogCard({ post }: { post: { slug?: string | null; title: string; excerpt?: string | null; cover?: unknown; publishedAt?: string | null } }) {
  const cover = mediaUrl(post.cover as never, 'card')
  return (
    <article className="group overflow-hidden rounded-brand border bg-white">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-navy-900">
          {cover ? <Image src={cover} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
        </div>
        <div className="space-y-2 p-5">
          {post.publishedAt ? <p className="text-xs text-muted-foreground">{new Date(post.publishedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</p> : null}
          <h3 className="font-heading text-xl leading-tight font-bold group-hover:text-red-600">{post.title}</h3>
          {post.excerpt ? <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p> : null}
        </div>
      </Link>
    </article>
  )
}

// ——— Newsletter ———
export function Newsletter({ block }: { block: NewsletterBlock }) {
  return (
    <section className="bg-hero text-white">
      <div className="container-py grid items-center gap-6 py-14 md:grid-cols-2">
        <div>
          <h2 className="text-4xl">{block.heading}</h2>
          {block.text ? <p className="mt-2 text-steel-400">{block.text}</p> : null}
          {block.couponCode ? (
            <p className="mt-3 text-sm">
              Use code <span className="rounded bg-red-600 px-2 py-0.5 font-mono font-bold">{block.couponCode}</span> on your first order.
            </p>
          ) : null}
        </div>
        <NewsletterForm source="home" />
      </div>
    </section>
  )
}

// ——— Store strip used on CMS pages ———
export function StoreCard({ store }: { store: { name: string; address: string; city?: string | null; phone?: string | null; hours?: string | null; mapUrl?: string | null } }) {
  return (
    <div className="space-y-2 rounded-brand border bg-white p-5">
      <p className="flex items-center gap-2 font-heading text-xl font-bold">
        <Store className="size-5 text-red-600" /> {store.name}
      </p>
      <p className="flex gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0" /> {store.address}
      </p>
      {store.hours ? <p className="text-sm">{store.hours}</p> : null}
      {store.phone ? (
        <a href={`tel:${store.phone.replace(/[^\d+]/g, '')}`} className="block text-sm font-semibold text-navy-500 hover:underline">
          {store.phone}
        </a>
      ) : null}
      {store.mapUrl ? (
        <a href={store.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-red-600 hover:underline">
          Get directions →
        </a>
      ) : null}
    </div>
  )
}

import { BadgeCheck, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ProductRail } from '@/components/blocks/home'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { AlertForm } from '@/components/product/AlertForm'
import { FitBadge, Stars, StockBadge } from '@/components/product/badges'
import { BundleBox } from '@/components/product/BundleBox'
import { BuyBox } from '@/components/product/BuyBox'
import { CopyValue } from '@/components/product/CopyButton'
import { DeliveryEstimate } from '@/components/product/DeliveryEstimate'
import { Gallery } from '@/components/product/Gallery'
import { toCartItem } from '@/components/product/ProductCard'
import { ProductTabs } from '@/components/product/ProductTabs'
import { RecentlyViewed } from '@/components/product/RecentlyViewed'
import { ReviewForm } from '@/components/product/ReviewForm'
import { RichText } from '@/components/RichText'
import { Badge } from '@/components/ui/badge'
import { CheckFitmentButton } from '@/components/vehicle/CheckFitmentButton'
import { getCategoryTree } from '@/lib/data/catalog'
import { getReviews } from '@/lib/data/content'
import { getBlockContext } from '@/lib/data/context'
import { getProductBySlug, listProducts } from '@/lib/data/products'
import { fitsVehicle } from '@/lib/fitment'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { conditionLabel, priceFor, relName, savings, savingsPercent, stockState } from '@/lib/product'
import { richTextToPlain } from '@/lib/richtext'
import { absoluteUrl } from '@/lib/url'
import { formatPrice } from '@/lib/utils'
import { productWhatsappMessage, whatsappLink } from '@/lib/whatsapp'
import type { Category, Make, Model, Product } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug)
  if (!p) return {}
  const meta = (p as Product & { meta?: { title?: string | null; description?: string | null; image?: unknown } }).meta
  const img = mediaUrl((meta?.image as never) ?? p.images?.[0], 'large')
  const description = meta?.description || richTextToPlain(p.description).slice(0, 160) || p.title
  return {
    title: { absolute: meta?.title || `${p.title} | Partsyaar.com` },
    description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title: p.title, description, images: img ? [{ url: img }] : undefined, type: 'website' },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const p = await getProductBySlug(slug, draft)
  if (!p) notFound()
  const ctx = await getBlockContext()
  const { settings, vehicle, customer } = ctx
  const price = priceFor(p, customer)
  const save = savings(price, p.compareAtPrice)
  const stock = stockState(p)
  const fits = fitsVehicle(p, vehicle)
  const [part, vehicleText] = p.title.split(' – ')
  const url = absoluteUrl(`/product/${p.slug}`)
  const item = toCartItem(p, price)

  const tree = await getCategoryTree()
  const cat = p.categories?.[0] as Category | undefined
  const parent = tree.find((t) => t.id === cat?.id || t.children.some((c) => c.id === cat?.id))
  const crumbs = [
    ...(parent && parent.id !== cat?.id ? [{ label: parent.name, href: `/category/${parent.slug}` }] : []),
    ...(cat ? [{ label: cat.name, href: `/category/${cat.slug}` }] : []),
    { label: part },
  ]

  const together = (p.boughtTogether ?? []).filter((x): x is Product => typeof x === 'object' && x !== null)
  const categoryIds = (p.categories ?? []).map((c) => (typeof c === 'object' ? c.id : c))
  const [alsoBought, reviews] = await Promise.all([
    listProducts({ categoryIds: parent ? [parent.id, ...parent.children.map((c) => c.id)] : categoryIds, excludeIds: [p.id], sort: 'popular', limit: 10 }),
    getReviews(20, p.id),
  ])

  const images = (p.images ?? [])
    .map((m) => ({ src: mediaUrl(m, 'thumb'), large: mediaUrl(m, 'large'), alt: mediaAlt(m, p.title) }))
    .filter((x): x is { src: string; large: string; alt: string } => Boolean(x.src && x.large))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    sku: p.sku,
    mpn: p.oemNumber ?? undefined,
    image: images.map((i) => absoluteUrl(i.large)),
    description: richTextToPlain(p.description) || p.title,
    brand: { '@type': 'Brand', name: relName(p.partBrand) },
    itemCondition: 'https://schema.org/NewCondition',
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'PKR',
      price: p.price,
      availability: stock === 'out' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: settings.site.storeName },
    },
    ...(p.ratingCount
      ? {
          aggregateRating: { '@type': 'AggregateRating', ratingValue: p.ratingAvg, reviewCount: p.ratingCount },
          review: reviews.slice(0, 5).map((r) => ({ '@type': 'Review', author: { '@type': 'Person', name: r.name }, reviewRating: { '@type': 'Rating', ratingValue: r.rating }, name: r.title, reviewBody: r.text })),
        }
      : {}),
  }

  const fitRows = (p.fitments ?? []).map((f) => ({
    make: (f.make as Make)?.name ?? '',
    model: (f.model as Model)?.name ?? '',
    years: `${f.yearFrom}–${f.yearTo ?? 'present'}`,
    engine: f.engine ?? '—',
  }))

  return (
    <div className="pb-16">
      <div className="container-py pt-5">
        <Breadcrumbs items={crumbs} />
      </div>
      <div className="container-py grid gap-8 pt-5 lg:grid-cols-2 lg:gap-12">
        <Gallery
          images={images}
          videoUrl={p.videoUrl}
          badge={
            <>
              <Badge variant={p.condition === 'aftermarket' ? 'outline' : 'navy'} className={p.condition === 'aftermarket' ? 'bg-white' : ''}>
                {conditionLabel(p.condition)}
              </Badge>
              {save ? <Badge>-{savingsPercent(price, p.compareAtPrice)}%</Badge> : null}
            </>
          }
        />
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{relName(p.partBrand)}</p>
            <h1 className="text-3xl leading-tight md:text-4xl">{part}</h1>
            {vehicleText ? <p className="text-muted-foreground">{vehicleText}</p> : null}
            <Stars value={p.ratingAvg ?? 0} count={p.ratingCount ?? 0} />
          </div>
          <div className="flex flex-wrap gap-2">
            {p.oemNumber ? <CopyValue label="OEM" value={p.oemNumber} /> : null}
            <CopyValue label="SKU" value={p.sku} />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <span className="text-4xl font-bold text-red-600" data-testid="product-page-price">
              {formatPrice(price)}
            </span>
            {save ? (
              <>
                <span className="pb-1 text-lg text-muted-foreground line-through">{formatPrice(p.compareAtPrice!)}</span>
                <span className="mb-1 rounded-full bg-red-600/10 px-2 py-0.5 text-sm font-bold text-red-700">Save {formatPrice(save)}</span>
              </>
            ) : null}
          </div>
          {customer?.type === 'workshop' && p.workshopPrice ? <p className="text-sm font-semibold text-navy-500">Workshop price applied (retail {formatPrice(p.price)})</p> : null}
          <div className="flex flex-wrap items-center gap-3">
            <StockBadge state={stock} stock={p.stock} />
          </div>

          {/* Fit check */}
          <div className={`rounded-brand border p-4 ${fits === true ? 'border-success/50 bg-success/5' : fits === false ? 'border-red-600/40 bg-red-600/5' : 'bg-navy-100/50'}`} data-testid="fit-check">
            {fits === null ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">
                  <strong>Will it fit?</strong> Select your car to check instantly.
                </p>
                <CheckFitmentButton />
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <FitBadge fits={fits} vehicleName={`${vehicle!.makeName} ${vehicle!.modelName} ${vehicle!.year}`} className="text-sm" />
                <CheckFitmentButton label="Change vehicle" />
              </div>
            )}
          </div>

          {stock === 'out' ? <AlertForm productId={p.id} type="back_in_stock" /> : null}
          <BuyBox
            item={item}
            inStock={stock !== 'out'}
            whatsappHref={whatsappLink(settings.site.whatsapp, productWhatsappMessage({ title: p.title, sku: p.sku, price, url }))}
            shareUrl={url}
          />
          {stock !== 'out' ? <AlertForm productId={p.id} type="price_drop" /> : null}
          <DeliveryEstimate delivery={settings.delivery} price={price} inStock={stock !== 'out'} />

          <ul className="grid grid-cols-2 gap-3 text-sm">
            {[
              { Icon: ShieldCheck, text: '100% genuine guarantee', href: '/genuine-guarantee' },
              { Icon: RotateCcw, text: '7-day easy returns', href: '/returns' },
              { Icon: Truck, text: 'Same-day in Lahore', href: '/shipping' },
              { Icon: BadgeCheck, text: p.warranty ?? 'Manufacturer warranty', href: '/warranty' },
            ].map(({ Icon, text, href }) => (
              <li key={text}>
                <Link href={href} className="flex items-center gap-2 rounded-lg bg-navy-100/60 p-3 font-semibold hover:bg-navy-100">
                  <Icon className="size-5 shrink-0 text-red-600" /> {text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-py pt-10">
        <ProductTabs
          tabs={[
            {
              id: 'details',
              label: 'Description & Specs',
              content: (
                <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
                  <RichText data={p.description} />
                  {p.specs?.length ? (
                    <table className="w-full overflow-hidden rounded-brand border text-sm">
                      <tbody>
                        {[
                          ['Brand', relName(p.partBrand)],
                          ['Type', conditionLabel(p.condition)],
                          ...(p.oemNumber ? [['OEM number', p.oemNumber]] : []),
                          ...p.specs.map((s) => [s.label, s.value]),
                          ...(p.weightKg ? [['Weight', `${p.weightKg} kg`]] : []),
                        ].map(([k, v]) => (
                          <tr key={k} className="odd:bg-navy-100/40">
                            <th scope="row" className="w-2/5 px-4 py-2.5 text-left font-semibold">
                              {k}
                            </th>
                            <td className="px-4 py-2.5">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : null}
                </div>
              ),
            },
            {
              id: 'fitment',
              label: 'Fitment',
              content: p.universalFit ? (
                <p>This part fits all vehicles.</p>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-brand border">
                    <table className="w-full text-sm">
                      <thead className="bg-navy-900 text-left text-white">
                        <tr>
                          {['Make', 'Model', 'Years', 'Engine'].map((h) => (
                            <th key={h} scope="col" className="px-4 py-2.5 font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {fitRows.map((r, i) => (
                          <tr key={i} className="odd:bg-navy-100/40">
                            <td className="px-4 py-2.5">{r.make}</td>
                            <td className="px-4 py-2.5 font-semibold">{r.model}</td>
                            <td className="px-4 py-2.5 font-mono">{r.years}</td>
                            <td className="px-4 py-2.5">{r.engine}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {p.crossRefs?.length ? (
                    <div>
                      <p className="mb-2 font-heading text-lg font-bold">Cross-reference numbers</p>
                      <div className="flex flex-wrap gap-2">
                        {p.crossRefs.map((r) => (
                          <CopyValue key={r.number} label={r.brand ?? 'Ref'} value={r.number} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <p className="text-sm text-muted-foreground">Not sure? Send your chassis/VIN number on WhatsApp and we’ll confirm before dispatch.</p>
                </div>
              ),
            },
            {
              id: 'shipping',
              label: 'Shipping & Returns',
              content: (
                <div className="max-w-3xl space-y-3 text-sm">
                  <p>{settings.delivery.shippingSummary}</p>
                  <p>{settings.delivery.returnsSummary}</p>
                  <p>
                    <Link href="/shipping" className="font-semibold text-navy-500 hover:underline">
                      Delivery details
                    </Link>{' '}
                    ·{' '}
                    <Link href="/returns" className="font-semibold text-navy-500 hover:underline">
                      Returns policy
                    </Link>
                  </p>
                </div>
              ),
            },
            {
              id: 'warranty',
              label: 'Warranty',
              content: (
                <p className="max-w-3xl text-sm">
                  {p.warranty ? <strong>{p.warranty}. </strong> : null}
                  We handle warranty claims with the manufacturer for you — just message us your order number.{' '}
                  <Link href="/warranty" className="font-semibold text-navy-500 hover:underline">
                    Warranty terms
                  </Link>
                </p>
              ),
            },
            {
              id: 'reviews',
              label: `Reviews (${p.ratingCount ?? 0})`,
              content: (
                <div className="space-y-6">
                  {reviews.length ? (
                    <ul className="grid gap-4 md:grid-cols-2">
                      {reviews.map((r) => (
                        <li key={r.id} className="space-y-2 rounded-brand border bg-white p-4">
                          <Stars value={r.rating} count={1} showCount={false} />
                          <p className="font-heading text-lg font-bold">{r.title}</p>
                          <p className="text-sm text-muted-foreground">{r.text}</p>
                          {r.photos?.length ? (
                            <div className="flex gap-2">
                              {r.photos.map((ph) =>
                                mediaUrl(ph, 'thumb') ? (
                                  <a key={typeof ph === 'object' ? ph.id : ph} href={mediaUrl(ph, 'large') ?? '#'} target="_blank" rel="noopener noreferrer" className="relative size-16 overflow-hidden rounded-md border">
                                    <Image src={mediaUrl(ph, 'thumb')!} alt={mediaAlt(ph, 'Customer photo')} fill sizes="64px" className="object-cover" />
                                  </a>
                                ) : null,
                              )}
                            </div>
                          ) : null}
                          <p className="text-xs">
                            <strong>{r.name}</strong>
                            {r.city ? ` · ${r.city}` : ''} {r.verifiedBuyer ? <span className="font-semibold text-[#0f7a37]">· ✓ Verified buyer</span> : null}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No reviews yet — be the first.</p>
                  )}
                  <ReviewForm productId={p.id} defaultName={customer?.name} />
                </div>
              ),
            },
          ]}
        />
      </div>

      {together.length ? (
        <section className="container-py pt-6">
          <h2 className="mb-4 text-2xl">Frequently bought together</h2>
          <BundleBox
            main={{ ...item, inStock: stock !== 'out' }}
            others={together.map((t) => ({ ...toCartItem(t, priceFor(t, customer)), inStock: t.stock > 0 }))}
            discountPercent={p.bundleDiscountPercent ?? 0}
          />
        </section>
      ) : null}

      {alsoBought.docs.length ? (
        <section className="container-py pt-12">
          <h2 className="mb-4 text-2xl">Customers also bought</h2>
          <ProductRail products={alsoBought.docs} ctx={ctx} />
        </section>
      ) : null}
      <RecentlyViewed excludeId={p.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  )
}

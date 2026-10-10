import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BannerCard } from '@/components/blocks/home'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { Listing } from '@/components/catalog/Listing'
import { getCategoryBySlug } from '@/lib/data/catalog'
import { getBanners } from '@/lib/data/content'
import { getBlockContext } from '@/lib/data/context'
import { listProducts } from '@/lib/data/products'
import { parseFilters, type SearchParams } from '@/lib/filters'
import { iconFor } from '@/lib/icons'
import { mediaUrl } from '@/lib/media'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getCategoryBySlug((await params).slug)
  if (!found) return {}
  const { category } = found
  return {
    title: `${category.name} — genuine car parts`,
    description: category.description ?? `Buy genuine and OEM ${category.name.toLowerCase()} online in Pakistan. Same-day delivery in Lahore.`,
    alternates: { canonical: `/category/${category.slug}` },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const found = await getCategoryBySlug(slug)
  if (!found) notFound()
  const { category, parent, children } = found
  const ctx = await getBlockContext()
  const f = parseFilters(sp)
  const categoryIds = [category.id, ...children.map((c) => c.id)]
  const [result, banners] = await Promise.all([
    listProducts({ ...f, categoryIds, vehicle: f.fitOnly ? ctx.vehicle : null }),
    getBanners('category_top'),
  ])
  const Icon = iconFor(category.icon)

  return (
    <div className="bg-navy-100/40 pb-16">
      <div className="bg-navy-900 text-white">
        <div className="container-py flex items-center gap-5 py-8">
          {mediaUrl(category.image, 'thumb') ? (
            <Image src={mediaUrl(category.image, 'thumb')!} alt="" width={88} height={88} className="hidden rounded-xl sm:block" />
          ) : (
            <span className="hidden size-20 place-items-center rounded-xl bg-white/10 sm:grid">
              <Icon className="size-8 text-red-600" />
            </span>
          )}
          <div className="space-y-2">
            <Breadcrumbs tone="dark" items={[...(parent ? [{ label: parent.name, href: `/category/${parent.slug}` }] : []), { label: category.name }]} />
            <h1 className="text-4xl md:text-5xl">{category.name}</h1>
            {category.description ? <p className="max-w-2xl text-steel-400">{category.description}</p> : null}
          </div>
        </div>
      </div>
      <div className="container-py space-y-6 pt-6">
        {children.length ? (
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
            {children.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`} className="shrink-0 rounded-full border bg-white px-4 py-2 text-sm font-semibold hover:border-red-600">
                {c.name}
              </Link>
            ))}
          </div>
        ) : null}
        {banners[0] ? <BannerCard banner={banners[0]} ctx={ctx} className="min-h-36 md:min-h-40" /> : null}
        <Listing result={result} basePath={`/category/${slug}`} searchParams={sp} vehicle={ctx.vehicle} customer={ctx.customer} whatsapp={ctx.settings.site.whatsapp} />
      </div>
    </div>
  )
}

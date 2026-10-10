import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { ProductGrid } from '@/components/product/ProductCard'
import { SetVehicleButton } from '@/components/vehicle/SetVehicleButton'
import { getCategoryTree, getMakeBySlug, getModelsForMake } from '@/lib/data/catalog'
import { getBlockContext } from '@/lib/data/context'
import { listProducts } from '@/lib/data/products'
import { slugify } from '@/lib/utils'
import { generationsForYear, yearsForModel, type Vehicle } from '@/lib/vehicle'

type Props = { params: Promise<{ make: string; model: string }>; searchParams: Promise<{ year?: string }> }

async function resolve(makeSlug: string, modelSlug: string, yearParam?: string) {
  const make = await getMakeBySlug(makeSlug)
  if (!make) return null
  const gens = (await getModelsForMake(make.id)).filter((m) => slugify(m.name) === modelSlug)
  if (!gens.length) return null
  const spans = gens.map((g) => ({ ...g, from: g.yearFrom, to: g.yearTo ?? null }))
  const years = yearsForModel(spans)
  const year = years.includes(Number(yearParam)) ? Number(yearParam) : years[0]
  const gen = generationsForYear(spans, year)[0] ?? spans[0]
  const vehicle: Vehicle = {
    makeId: make.id,
    makeName: make.name,
    makeSlug: make.slug ?? makeSlug,
    modelName: gen.name,
    modelSlug,
    generationId: gen.id,
    generationLabel: gen.label ?? gen.name,
    year,
  }
  return { make, name: gen.name, years, year, vehicle }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const p = await params
  const r = await resolve(p.make, p.model, (await searchParams).year)
  if (!r) return {}
  return {
    title: `${r.make.name} ${r.name} ${r.year} parts`,
    description: `Genuine and OEM parts for ${r.make.name} ${r.name} ${r.year}: brake pads, filters, suspension, lighting and more — guaranteed fitment.`,
    alternates: { canonical: `/make/${p.make}/${p.model}` },
  }
}

export default async function ModelPage({ params, searchParams }: Props) {
  const p = await params
  const r = await resolve(p.make, p.model, (await searchParams).year)
  if (!r) notFound()
  const ctx = await getBlockContext()
  const [{ docs }, tree] = await Promise.all([listProducts({ vehicle: r.vehicle, sort: 'popular', limit: 500 }), getCategoryTree()])

  // Group by top-level category.
  const parentOf = new Map<number, (typeof tree)[number]>()
  for (const root of tree) {
    parentOf.set(root.id, root)
    for (const c of root.children) parentOf.set(c.id, root)
  }
  const groups = new Map<number, { name: string; slug: string; products: typeof docs }>()
  for (const prod of docs) {
    const first = prod.categories?.[0]
    const cid = typeof first === 'object' ? first?.id : first
    const root = cid ? parentOf.get(cid) : undefined
    const key = root?.id ?? 0
    const g = groups.get(key) ?? { name: root?.name ?? 'Other parts', slug: root?.slug ?? '', products: [] }
    g.products.push(prod)
    groups.set(key, g)
  }
  const ordered = tree.map((t) => groups.get(t.id)).filter(Boolean) as Array<{ name: string; slug: string; products: typeof docs }>
  if (groups.get(0)) ordered.push(groups.get(0)!)
  const isCurrent = ctx.vehicle?.generationId === r.vehicle.generationId && ctx.vehicle.year === r.year

  return (
    <div className="pb-16">
      <div className="bg-hero text-white">
        <div className="container-py space-y-4 py-10">
          <Breadcrumbs tone="dark" items={[{ label: r.make.name, href: `/make/${p.make}` }, { label: `${r.name} ${r.year}` }]} />
          <h1 className="text-4xl md:text-6xl">
            {r.make.name} {r.name} <span className="text-red-600">{r.year}</span> parts
          </h1>
          <p className="text-steel-400">{docs.length} parts guaranteed to fit · grouped by category</p>
          <div className="flex flex-wrap items-center gap-3">
            <SetVehicleButton vehicle={r.vehicle} active={isCurrent} />
          </div>
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pt-2" aria-label="Choose year">
            {r.years.map((y) => (
              <Link
                key={y}
                href={`/make/${p.make}/${p.model}?year=${y}`}
                aria-current={y === r.year ? 'true' : undefined}
                className={`shrink-0 rounded-full border px-3 py-1 font-mono text-sm ${y === r.year ? 'border-red-600 bg-red-600 text-white' : 'border-white/15 text-white/80 hover:border-white/40'}`}
              >
                {y}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="container-py space-y-12 pt-10">
        {ordered.length ? (
          ordered.map((g) => (
            <section key={g.name} id={g.slug}>
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="text-2xl md:text-3xl">{g.name}</h2>
                {g.slug ? (
                  <Link href={`/category/${g.slug}?fit=1`} className="text-sm font-semibold text-navy-500 hover:underline">
                    All {g.name.toLowerCase()} →
                  </Link>
                ) : null}
              </div>
              <ProductGrid products={g.products} vehicle={r.vehicle} customer={ctx.customer} />
            </section>
          ))
        ) : (
          <p className="rounded-brand border border-dashed p-10 text-center text-muted-foreground">
            We’re adding parts for this vehicle. Send us a photo or your VIN on WhatsApp and we’ll source it.
          </p>
        )}
      </div>
    </div>
  )
}

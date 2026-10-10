import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { getMakeBySlug, getModelsForMake } from '@/lib/data/catalog'
import { yearRange } from '@/lib/fitment'
import { mediaUrl } from '@/lib/media'
import { slugify } from '@/lib/utils'
import type { Model } from '@/payload-types'

type Props = { params: Promise<{ make: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const make = await getMakeBySlug((await params).make)
  if (!make) return {}
  return {
    title: `${make.name} parts — genuine & OEM`,
    description: `Genuine and OEM ${make.name} spare parts in Pakistan: filters, brakes, suspension, lighting and more. Same-day delivery in Lahore.`,
    alternates: { canonical: `/make/${make.slug}` },
  }
}

export default async function MakePage({ params }: Props) {
  const make = await getMakeBySlug((await params).make)
  if (!make) notFound()
  const models = await getModelsForMake(make.id)
  const byName = new Map<string, Model[]>()
  for (const m of models) byName.set(m.name, [...(byName.get(m.name) ?? []), m])
  const logo = mediaUrl(make.logo, 'thumb')

  return (
    <div className="pb-16">
      <div className="bg-hero text-white">
        <div className="container-py flex items-center gap-5 py-10">
          {logo ? <Image src={logo} alt={`${make.name} logo`} width={96} height={96} className="rounded-xl bg-white" /> : null}
          <div className="space-y-2">
            <Breadcrumbs tone="dark" items={[{ label: make.name }]} />
            <h1 className="text-4xl md:text-6xl">{make.name} Parts</h1>
            <p className="text-steel-400">Pick your model and year — we’ll show only parts that fit.</p>
          </div>
        </div>
      </div>
      <div className="container-py space-y-10 pt-10">
        {[...byName.entries()].map(([name, gens]) => (
          <section key={name}>
            <h2 className="mb-4 text-2xl">
              {make.name} {name}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {gens
                .sort((a, b) => b.yearFrom - a.yearFrom)
                .map((g) => (
                  <Link
                    key={g.id}
                    href={`/make/${make.slug}/${slugify(name)}?year=${g.yearTo ?? new Date().getFullYear()}`}
                    className="group overflow-hidden rounded-brand border bg-white transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-navy"
                  >
                    <div className="relative aspect-[5/3] bg-navy-900">
                      {mediaUrl(g.image, 'card') ? <Image src={mediaUrl(g.image, 'card')!} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
                    </div>
                    <div className="flex items-center justify-between p-3">
                      <span className="font-heading text-lg font-bold">{name}</span>
                      <span className="rounded-full bg-navy-100 px-2 py-0.5 font-mono text-xs">{yearRange(g.yearFrom, g.yearTo)}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

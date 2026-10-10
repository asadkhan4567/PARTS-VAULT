import type { Metadata } from 'next'

import { Listing } from '@/components/catalog/Listing'
import { getBlockContext } from '@/lib/data/context'
import { listProducts } from '@/lib/data/products'
import { parseFilters, type SearchParams } from '@/lib/filters'

type Props = { searchParams: Promise<SearchParams> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = (await searchParams).q
  return { title: q ? `Search: ${q}` : 'All parts', robots: { index: false, follow: true } }
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.slice(0, 100) ?? ''
  const ctx = await getBlockContext()
  const f = parseFilters(sp)
  const result = await listProducts({ ...f, q, vehicle: f.fitOnly ? ctx.vehicle : null })
  return (
    <div className="bg-navy-100/40 pb-16">
      <div className="bg-navy-900 text-white">
        <div className="container-py py-8">
          <h1 className="text-3xl md:text-4xl">{q ? <>Results for “{q}”</> : f.onSale ? 'Deals & offers' : 'All parts'}</h1>
          {result.usedFallback ? <p className="mt-2 text-sm text-steel-400">No exact match — showing the closest parts.</p> : null}
        </div>
      </div>
      <div className="container-py pt-6">
        <Listing
          result={result}
          basePath="/search"
          searchParams={sp}
          vehicle={ctx.vehicle}
          customer={ctx.customer}
          whatsapp={ctx.settings.site.whatsapp}
          includeRelevance={Boolean(q)}
          emptyText={q ? `No parts found for “${q}”` : 'No parts match these filters.'}
        />
      </div>
    </div>
  )
}

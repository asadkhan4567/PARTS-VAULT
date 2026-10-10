import { PackageSearch } from 'lucide-react'
import Link from 'next/link'

import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat'
import { ProductGrid } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { getPartBrands } from '@/lib/data/catalog'
import type { ProductList } from '@/lib/data/products'
import type { SearchParams } from '@/lib/filters'
import type { Vehicle } from '@/lib/vehicle'
import { whatsappLink } from '@/lib/whatsapp'
import type { Customer } from '@/payload-types'

import { FiltersButton, FiltersSidebar, SortSelect } from './Filters'
import { Pagination } from './Pagination'

/** Filters + sort + grid + pagination, shared by category / search / model pages. */
export async function Listing({
  result,
  basePath,
  searchParams,
  vehicle,
  customer,
  whatsapp,
  includeRelevance = false,
  emptyText = 'No parts match these filters.',
}: {
  result: ProductList
  basePath: string
  searchParams: SearchParams
  vehicle: Vehicle | null
  customer: Customer | null
  whatsapp: string
  includeRelevance?: boolean
  emptyText?: string
}) {
  const brands = (await getPartBrands()).map((b) => ({ id: b.id, name: b.name }))
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <FiltersSidebar brands={brands} />
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" data-testid="result-count">
            {result.total} {result.total === 1 ? 'part' : 'parts'}
          </p>
          <div className="flex items-center gap-2">
            <FiltersButton brands={brands} />
            <SortSelect includeRelevance={includeRelevance} />
          </div>
        </div>
        {result.docs.length ? (
          <>
            <ProductGrid products={result.docs} vehicle={vehicle} customer={customer} className="lg:grid-cols-3 xl:grid-cols-4" />
            <Pagination page={result.page} pages={result.pages} basePath={basePath} searchParams={searchParams} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-brand border border-dashed bg-white p-10 text-center">
            <PackageSearch className="size-12 text-steel-400" />
            <p className="font-heading text-xl font-bold">{emptyText}</p>
            <p className="max-w-md text-sm text-muted-foreground">Send us a photo of the part or your chassis/VIN number — we’ll find it for you.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild className="bg-[#25D366] text-navy-950 hover:bg-[#1fb757]">
                <a href={whatsappLink(whatsapp, 'Assalam o Alaikum! I can’t find a part on the website.')} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="size-5" /> Ask on WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href={basePath}>Clear filters</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

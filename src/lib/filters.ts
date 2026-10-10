import type { ProductFilters, SortKey } from './data/products'

export type SearchParams = Record<string, string | string[] | undefined>

const list = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? v.split(',') : []).filter(Boolean)
const num = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v)
  return Number.isFinite(n) && n > 0 ? n : undefined
}
const SORTS: SortKey[] = ['relevance', 'popular', 'price_asc', 'price_desc', 'newest', 'rating']

/** URL query → listing filters. Shared by category, model and search pages. */
export function parseFilters(sp: SearchParams): ProductFilters & { fitOnly: boolean } {
  const sort = (Array.isArray(sp.sort) ? sp.sort[0] : sp.sort) as SortKey | undefined
  return {
    brandIds: list(sp.brand).map(Number).filter(Number.isFinite),
    conditions: list(sp.condition),
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    inStock: sp.stock === '1',
    onSale: sp.sale === '1',
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    page: num(sp.page) ?? 1,
    fitOnly: sp.fit === '1',
  }
}

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'popular', label: 'Most popular' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
]

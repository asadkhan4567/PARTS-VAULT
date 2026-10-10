'use client'

import { SlidersHorizontal } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

import { useVehicle } from '@/components/providers/VehicleProvider'
import { Sheet } from '@/components/ui/sheet'
import { SORT_OPTIONS } from '@/lib/filters'
import { cn } from '@/lib/utils'

type Facet = { id: number; name: string; count?: number }

function useQueryUpdater() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, start] = useTransition()
  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    next.delete('page')
    start(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }))
  }
  return { params, update, pending }
}

function FilterBody({ brands, showSearchSort }: { brands: Facet[]; showSearchSort?: boolean }) {
  const { params, update } = useQueryUpdater()
  const { vehicle, openFinder } = useVehicle()
  const selected = new Set((params.get('brand') ?? '').split(',').filter(Boolean))
  const conditions = new Set((params.get('condition') ?? '').split(',').filter(Boolean))
  const toggle = (key: string, set: Set<string>, value: string) => {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    update({ [key]: [...next].join(',') || null })
  }
  const box = 'size-4 accent-red-600'
  return (
    <div className="space-y-6 text-sm">
      <fieldset className="space-y-2">
        <legend className="mb-2 font-heading text-base font-bold">Your vehicle</legend>
        {vehicle ? (
          <label className="flex items-center gap-2">
            <input type="checkbox" className={box} checked={params.get('fit') === '1'} onChange={(e) => update({ fit: e.target.checked ? '1' : null })} />
            Only parts that fit my {vehicle.modelName} {vehicle.year}
          </label>
        ) : (
          <button type="button" onClick={openFinder} className="font-semibold text-navy-500 hover:underline">
            Select your vehicle to filter →
          </button>
        )}
      </fieldset>
      {showSearchSort ? null : null}
      <fieldset className="space-y-2">
        <legend className="mb-2 font-heading text-base font-bold">Availability</legend>
        <label className="flex items-center gap-2">
          <input type="checkbox" className={box} checked={params.get('stock') === '1'} onChange={(e) => update({ stock: e.target.checked ? '1' : null })} />
          In stock only
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className={box} checked={params.get('sale') === '1'} onChange={(e) => update({ sale: e.target.checked ? '1' : null })} />
          On sale
        </label>
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="mb-2 font-heading text-base font-bold">Type</legend>
        {[
          ['genuine', 'Genuine'],
          ['oem', 'OEM'],
          ['aftermarket', 'Aftermarket'],
        ].map(([v, label]) => (
          <label key={v} className="flex items-center gap-2">
            <input type="checkbox" className={box} checked={conditions.has(v)} onChange={() => toggle('condition', conditions, v)} />
            {label}
          </label>
        ))}
      </fieldset>
      {brands.length ? (
        <fieldset className="space-y-2">
          <legend className="mb-2 font-heading text-base font-bold">Brand</legend>
          {brands.map((b) => (
            <label key={b.id} className="flex items-center gap-2">
              <input type="checkbox" className={box} checked={selected.has(String(b.id))} onChange={() => toggle('brand', selected, String(b.id))} />
              <span className="flex-1">{b.name}</span>
              {b.count != null ? <span className="text-xs text-muted-foreground">{b.count}</span> : null}
            </label>
          ))}
        </fieldset>
      ) : null}
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          update({ min: String(f.get('min') ?? ''), max: String(f.get('max') ?? '') })
        }}
      >
        <p className="mb-2 font-heading text-base font-bold">Price (Rs)</p>
        <div className="flex items-center gap-2">
          <input name="min" inputMode="numeric" defaultValue={params.get('min') ?? ''} placeholder="Min" aria-label="Minimum price" className="h-10 w-full rounded-lg border px-2" />
          <span>–</span>
          <input name="max" inputMode="numeric" defaultValue={params.get('max') ?? ''} placeholder="Max" aria-label="Maximum price" className="h-10 w-full rounded-lg border px-2" />
        </div>
        <button className="h-9 w-full rounded-lg bg-navy-900 font-semibold text-white hover:bg-navy-700">Apply</button>
      </form>
    </div>
  )
}

export function SortSelect({ includeRelevance = false }: { includeRelevance?: boolean }) {
  const { params, update, pending } = useQueryUpdater()
  const options = includeRelevance ? [{ value: 'relevance', label: 'Best match' }, ...SORT_OPTIONS] : SORT_OPTIONS
  return (
    <label className={cn('flex items-center gap-2 text-sm', pending && 'opacity-60')}>
      <span className="hidden text-muted-foreground sm:inline">Sort</span>
      <select aria-label="Sort products" value={params.get('sort') ?? options[0].value} onChange={(e) => update({ sort: e.target.value })} className="h-10 rounded-lg border bg-white px-2 font-semibold">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function FiltersSidebar({ brands }: { brands: Facet[] }) {
  return (
    <aside className="hidden lg:block" aria-label="Filters">
      <div className="sticky top-36 rounded-brand border bg-white p-5">
        <FilterBody brands={brands} />
      </div>
    </aside>
  )
}

export function FiltersButton({ brands }: { brands: Facet[] }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-semibold lg:hidden">
        <SlidersHorizontal className="size-4" /> Filters
      </button>
      <Sheet open={open} onOpenChange={setOpen} title="Filters" side="bottom">
        <div className="p-5">
          <FilterBody brands={brands} />
        </div>
      </Sheet>
    </>
  )
}

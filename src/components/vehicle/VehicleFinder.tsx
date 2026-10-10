'use client'

import { Check, ChevronLeft, Search } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { useLang } from '@/components/providers/LangProvider'
import { useVehicle } from '@/components/providers/VehicleProvider'
import { cn } from '@/lib/utils'
import { generationsForYear, yearsForModel, type Vehicle, type VehicleTree } from '@/lib/vehicle'

type Make = VehicleTree[number]
type Model = Make['models'][number]
type Gen = Model['generations'][number]

const STEPS = ['make', 'model', 'year', 'variant'] as const

type Props = {
  /** After choosing, go to the vehicle's parts page (hero) or stay on the page (header). */
  navigate?: boolean
  tone?: 'dark' | 'light'
  className?: string
  /** Full-width layout (more tiles per row on desktop). */
  wide?: boolean
}

export function VehicleFinder({ navigate = false, tone = 'light', className, wide = false }: Props) {
  const { tree, select } = useVehicle()
  const { t } = useLang()
  const router = useRouter()
  const [make, setMake] = useState<Make | null>(null)
  const [model, setModel] = useState<Model | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [filter, setFilter] = useState('')

  const step = !make ? 0 : !model ? 1 : !year ? 2 : 3
  const years = useMemo(() => (model ? yearsForModel(model.generations) : []), [model])
  const variants = useMemo(() => (model && year ? generationsForYear(model.generations, year) : []), [model, year])

  const finish = (gen: Gen, y = year) => {
    if (!make || !model || !y) return
    const v: Vehicle = {
      makeId: make.id,
      makeName: make.name,
      makeSlug: make.slug,
      modelName: model.name,
      modelSlug: model.slug,
      generationId: gen.id,
      generationLabel: gen.label,
      year: y,
    }
    select(v)
    if (navigate) router.push(`/make/${make.slug}/${model.slug}?year=${y}`)
  }

  const pickYear = (y: number) => {
    setYear(y)
    const gens = model ? generationsForYear(model.generations, y) : []
    if (gens.length === 1) finish(gens[0], y)
  }

  const back = () => {
    setFilter('')
    if (year) setYear(null)
    else if (model) setModel(null)
    else setMake(null)
  }

  const dark = tone === 'dark'
  const tile = cn(
    'flex min-h-12 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition-[transform,background-color,border-color] duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-red-600',
    dark ? 'border-white/12 bg-white/6 text-white hover:border-red-600 hover:bg-white/12' : 'border-border bg-white text-navy-900 hover:border-red-600',
  )
  const q = filter.trim().toLowerCase()

  return (
    <div className={cn('w-full', className)} data-testid="vehicle-finder">
      {/* Step header + red progress bar */}
      <div className="mb-3 flex items-center gap-2">
        {step > 0 ? (
          <button type="button" onClick={back} className={cn('grid size-9 place-items-center rounded-full', dark ? 'hover:bg-white/10' : 'hover:bg-navy-100')} aria-label="Back">
            <ChevronLeft className="size-5" />
          </button>
        ) : null}
        <ol className="flex flex-1 items-center gap-1 text-xs font-semibold uppercase tracking-wide" aria-label="Vehicle finder steps">
          {STEPS.map((s, i) => (
            <li key={s} className={cn('flex items-center gap-1', i <= step ? (dark ? 'text-white' : 'text-navy-900') : 'text-steel-400')} aria-current={i === step ? 'step' : undefined}>
              <span className={cn('grid size-5 place-items-center rounded-full text-[10px]', i < step ? 'bg-red-600 text-white' : i === step ? 'border-2 border-red-600' : 'border border-steel-400')}>
                {i < step ? <Check className="size-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{t(s)}</span>
              {i < STEPS.length - 1 ? <span className="mx-1 hidden h-px w-4 bg-steel-400/50 sm:block" /> : null}
            </li>
          ))}
        </ol>
      </div>
      <div className={cn('mb-4 h-1 overflow-hidden rounded-full', dark ? 'bg-white/10' : 'bg-navy-100')}>
        <div className="h-full rounded-full bg-red-600 transition-[width] duration-500 ease-out" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      {/* Selected chips */}
      {make ? (
        <p className={cn('mb-3 flex flex-wrap items-center gap-2 text-sm', dark ? 'text-steel-400' : 'text-muted-foreground')}>
          {make.logo ? <Image src={make.logo} alt="" width={28} height={28} className="animate-[py-bounce_.5s_ease-out] rounded" /> : null}
          <strong className={dark ? 'text-white' : 'text-navy-900'}>{[make.name, model?.name, year].filter(Boolean).join(' · ')}</strong>
        </p>
      ) : null}

      {step < 2 ? (
        <label className="relative mb-3 block">
          <span className="sr-only">Filter {step === 0 ? 'makes' : 'models'}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel-400" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={step === 0 ? 'Search make… (Toyota, Honda)' : 'Search model… (Corolla)'}
            className={cn('h-11 w-full rounded-lg border pl-9 pr-3 text-sm', dark ? 'border-white/15 bg-white/8 text-white placeholder:text-steel-400' : 'border-border bg-white')}
          />
        </label>
      ) : null}

      <div key={step} className={cn('grid max-h-72 animate-[py-fade_.25s_ease-out] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4', wide && 'lg:max-h-48 lg:grid-cols-8')}>
        {step === 0 &&
          tree
            .filter((m) => m.name.toLowerCase().includes(q))
            .map((m) => (
              <button key={m.id} type="button" className={cn(tile, 'flex-col gap-1')} onClick={() => { setMake(m); setFilter('') }}>
                {m.logo ? <Image src={m.logo} alt="" width={36} height={36} className="rounded" /> : null}
                <span className="text-xs">{m.name}</span>
              </button>
            ))}
        {step === 1 &&
          make?.models
            .filter((m) => m.name.toLowerCase().includes(q))
            .map((m) => (
              <button key={m.slug} type="button" className={tile} onClick={() => { setModel(m); setFilter('') }}>
                {m.name}
              </button>
            ))}
        {step === 2 &&
          years.map((y) => (
            <button key={y} type="button" className={cn(tile, 'font-mono')} onClick={() => pickYear(y)}>
              {y}
            </button>
          ))}
        {step === 3 &&
          variants.map((g) => (
            <button key={g.id} type="button" className={cn(tile, 'col-span-3 sm:col-span-2')} onClick={() => finish(g)}>
              {g.label}
            </button>
          ))}
      </div>
    </div>
  )
}

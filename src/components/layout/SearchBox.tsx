'use client'

import { Clock, Loader2, Search, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

import { useLang } from '@/components/providers/LangProvider'
import { cn, formatPrice } from '@/lib/utils'

type Suggestion = { id: number; title: string; slug: string; price: number; image: string | null; oem: string | null; fits: boolean | null }
type SuggestResponse = { products: Suggestion[]; categories: Array<{ name: string; slug: string }>; models: Array<{ label: string; href: string }> }

const RECENT_KEY = 'py_recent_searches'

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function saveRecentSearch(q: string) {
  try {
    const next = [q, ...readRecent().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 6)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

/** Big header search with live suggestions (images + prices), part numbers and recent searches. */
export function SearchBox({ className, autoFocus = false }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter()
  const { t } = useLang()
  const listId = useId()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SuggestResponse | null>(null)
  const [recent, setRecent] = useState<string[]>([])
  const [active, setActive] = useState(-1)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setData(null)
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/search/suggest?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        if (res.ok) setData((await res.json()) as SuggestResponse)
      } catch {
        // aborted / offline
      } finally {
        setLoading(false)
      }
    }, 180)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const submit = (term = q) => {
    const t = term.trim()
    if (!t) return
    saveRecentSearch(t)
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(t)}`)
  }

  const products = data?.products ?? []
  const showRecent = !q.trim() && recent.length > 0

  return (
    <div ref={boxRef} className={cn('relative w-full', className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          if (active >= 0 && products[active]) router.push(`/product/${products[active].slug}`)
          else submit()
        }}
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search parts
        </label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-steel-400" />
        <input
          id={`${listId}-input`}
          type="search"
          value={q}
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          data-testid="search-input"
          onFocus={() => {
            setRecent(readRecent())
            setOpen(true)
          }}
          onChange={(e) => {
            setQ(e.target.value)
            setActive(-1)
            setOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, products.length - 1))
            else if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, -1))
            else if (e.key === 'Escape') setOpen(false)
          }}
          placeholder={t('search_placeholder')}
          className="h-12 w-full rounded-lg border border-white/10 bg-white pl-11 pr-24 text-[15px] text-navy-950 shadow-sm placeholder:text-steel-400 focus:outline-2 focus:outline-red-600"
        />
        {loading ? <Loader2 className="absolute right-24 top-1/2 size-4 -translate-y-1/2 animate-spin text-steel-400" /> : null}
        {q ? (
          <button type="button" onClick={() => setQ('')} className="absolute right-[4.6rem] top-1/2 grid size-8 -translate-y-1/2 place-items-center text-steel-400" aria-label="Clear search">
            <X className="size-4" />
          </button>
        ) : null}
        <button type="submit" className="absolute right-1.5 top-1.5 h-9 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700">
          {t('search')}
        </button>
      </form>

      {open && (showRecent || data) ? (
        <div id={listId} role="listbox" className="absolute inset-x-0 top-[calc(100%+6px)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border bg-white p-2 text-navy-950 shadow-2xl">
          {showRecent ? (
            <div className="p-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent searches</p>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button key={r} type="button" onClick={() => submit(r)} className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-3 py-1 text-sm hover:bg-navy-100/70">
                    <Clock className="size-3.5" /> {r}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {data ? (
            <>
              {data.models.length || data.categories.length ? (
                <div className="flex flex-wrap gap-2 p-2">
                  {data.models.map((m) => (
                    <Link key={m.href} href={m.href} onClick={() => setOpen(false)} className="rounded-full border px-3 py-1 text-sm font-semibold hover:border-red-600">
                      🚗 {m.label}
                    </Link>
                  ))}
                  {data.categories.map((c) => (
                    <Link key={c.slug} href={`/category/${c.slug}`} onClick={() => setOpen(false)} className="rounded-full border px-3 py-1 text-sm font-semibold hover:border-red-600">
                      {c.name}
                    </Link>
                  ))}
                </div>
              ) : null}
              {products.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  role="option"
                  aria-selected={i === active}
                  onClick={() => {
                    saveRecentSearch(q)
                    setOpen(false)
                  }}
                  className={cn('flex items-center gap-3 rounded-lg p-2 hover:bg-navy-100', i === active && 'bg-navy-100')}
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-navy-100">
                    {p.image ? <Image src={p.image} alt="" fill sizes="48px" className="object-cover" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm font-semibold">{p.title}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      {p.oem ? <span className="font-mono">{p.oem}</span> : null}
                      {p.fits === true ? <span className="font-semibold text-[#0f7a37]">✓ Fits</span> : p.fits === false ? <span className="text-red-700">✗ Not for your car</span> : null}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-red-600">{formatPrice(p.price)}</span>
                </Link>
              ))}
              {products.length ? (
                <button type="button" onClick={() => submit()} className="mt-1 w-full rounded-lg p-2 text-center text-sm font-semibold text-navy-500 hover:bg-navy-100">
                  See all results for “{q}”
                </button>
              ) : (
                <p className="p-3 text-sm text-muted-foreground">No parts found for “{q}”. Try the part number, or send us a photo on WhatsApp.</p>
              )}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

import Link from 'next/link'

import type { SearchParams } from '@/lib/filters'
import { cn } from '@/lib/utils'

export function Pagination({ page, pages, basePath, searchParams }: { page: number; pages: number; basePath: string; searchParams: SearchParams }) {
  if (pages <= 1) return null
  const href = (p: number) => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) if (v != null && k !== 'page') q.set(k, Array.isArray(v) ? v.join(',') : v)
    if (p > 1) q.set('page', String(p))
    const s = q.toString()
    return s ? `${basePath}?${s}` : basePath
  }
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className="h-10 rounded-lg border px-3 py-2 text-sm font-semibold">
          ← Prev
        </Link>
      ) : null}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - nums[i - 1] > 1 ? <span className="text-muted-foreground">…</span> : null}
          <Link href={href(n)} aria-current={n === page ? 'page' : undefined} className={cn('grid size-10 place-items-center rounded-lg border text-sm font-semibold', n === page && 'border-navy-900 bg-navy-900 text-white')}>
            {n}
          </Link>
        </span>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} rel="next" className="h-10 rounded-lg border px-3 py-2 text-sm font-semibold">
          Next →
        </Link>
      ) : null}
    </nav>
  )
}

import { CheckCircle2, CircleAlert, XCircle } from 'lucide-react'

import { T } from '@/components/providers/LangProvider'
import { Badge } from '@/components/ui/badge'
import type { StockState } from '@/lib/product'
import { cn } from '@/lib/utils'

export function FitBadge({ fits, className, vehicleName }: { fits: boolean | null; className?: string; vehicleName?: string }) {
  if (fits === null) return null
  return fits ? (
    <span className={cn('inline-flex items-center gap-1 text-xs font-bold text-[#0f7a37]', className)} data-testid="fit-yes">
      <CheckCircle2 className="size-4" /> <T k="fits" /> {vehicleName ?? ''}
    </span>
  ) : (
    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold text-red-700', className)} data-testid="fit-no">
      <XCircle className="size-4" /> <T k="doesnt_fit" /> {vehicleName ?? ''}
    </span>
  )
}

export function StockBadge({ state, stock }: { state: StockState; stock?: number }) {
  if (state === 'out') return (
      <Badge variant="outline" className="text-muted-foreground">
        <T k="out_of_stock" />
      </Badge>
    )
  if (state === 'low')
    return (
      <Badge variant="warning">
        <CircleAlert className="size-3" /> Only {stock} left
      </Badge>
    )
  return (
    <Badge variant="success">
      <T k="in_stock" />
    </Badge>
  )
}

export function Stars({ value, count, className, showCount = true }: { value: number; count?: number; className?: string; showCount?: boolean }) {
  if (!count) return null
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  return (
    <span role="img" className={cn('inline-flex items-center gap-1 text-xs text-muted-foreground', className)} aria-label={`Rated ${value} out of 5 from ${count} reviews`}>
      <span className="relative inline-block font-mono text-sm leading-none tracking-tight text-steel-400/50" aria-hidden>
        ★★★★★
        <span className="absolute inset-0 overflow-hidden text-warning" style={{ width: `${pct}%` }}>
          ★★★★★
        </span>
      </span>
      {showCount ? `(${count})` : null}
    </span>
  )
}

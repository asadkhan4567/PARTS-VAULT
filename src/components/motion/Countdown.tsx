'use client'

import { useEffect, useState } from 'react'

import { msUntilCutoff, PK_TZ } from '@/lib/delivery'
import { cn } from '@/lib/utils'

const pad = (n: number) => String(n).padStart(2, '0')

function msUntilPkMidnight(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: PK_TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(now)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0)
  return ((24 - get('hour')) * 3600 - get('minute') * 60 - get('second')) * 1000
}

/** Countdown to a date, to the same-day cutoff ("HH:MM" Pakistan time) or to midnight. */
export function Countdown({ endsAt, cutoff, className, compact = false, onDoneText }: { endsAt?: string | null; cutoff?: string | null; className?: string; compact?: boolean; onDoneText?: string }) {
  const calc = () => {
    if (endsAt) return Math.max(0, Date.parse(endsAt) - Date.now())
    if (cutoff) return msUntilCutoff(cutoff)
    return msUntilPkMidnight()
  }
  const [ms, setMs] = useState<number | null>(null)
  useEffect(() => {
    setMs(calc())
    const t = setInterval(() => setMs(calc()), 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt, cutoff])

  if (ms === null) return <span className={cn('inline-block h-6 w-24 rounded skeleton', className)} aria-hidden />
  if (ms <= 0) return <span className={className}>{onDoneText ?? 'Ended'}</span>
  const s = Math.floor(ms / 1000)
  const parts = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
  if (compact) return <span className={cn('font-mono tabular-nums', className)}>{parts.map(pad).join(':')}</span>
  return (
    <span className={cn('inline-flex gap-1.5 font-mono', className)} role="timer" aria-label={`${parts[0]} hours ${parts[1]} minutes left`}>
      {parts.map((v, i) => (
        <span key={i} className="flex flex-col items-center rounded-md bg-navy-950 px-2 py-1 text-white">
          <span className="text-xl font-bold tabular-nums leading-none">{pad(v)}</span>
          <span className="text-[9px] uppercase text-steel-400">{['hrs', 'min', 'sec'][i]}</span>
        </span>
      ))}
    </span>
  )
}

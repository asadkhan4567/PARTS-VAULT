'use client'

import { Check, PackageCheck, XCircle } from 'lucide-react'
import { useActionState } from 'react'

import { trackOrder, type TrackResult } from '@/app/(frontend)/checkout/actions'
import { cn, formatPrice } from '@/lib/utils'

const input = 'h-12 w-full rounded-lg border bg-white px-3'

export function TrackForm({ defaultOrder }: { defaultOrder: string }) {
  const [state, action, pending] = useActionState<TrackResult | null, FormData>(trackOrder, null)
  return (
    <div className="space-y-6">
      <form action={action} className="grid gap-3 rounded-brand border bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="grid gap-1 text-sm font-semibold">
          Order number
          <input name="order" defaultValue={defaultOrder} placeholder="PY-100245" className={`${input} font-mono uppercase`} data-testid="track-order" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Phone
          <input name="phone" type="tel" inputMode="tel" placeholder="0300-1234567" className={input} data-testid="track-phone" />
        </label>
        <button disabled={pending} className="h-12 rounded-lg bg-red-600 px-6 font-semibold text-white hover:bg-red-700 disabled:opacity-60">
          {pending ? 'Checking…' : 'Track'}
        </button>
      </form>
      {state && !state.ok ? (
        <p className="rounded-lg bg-red-600/5 p-4 font-semibold text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}
      {state?.ok ? (
        <div className="space-y-5 rounded-brand border bg-white p-5" data-testid="track-result">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-lg font-bold">{state.orderNumber}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(state.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })} · {formatPrice(state.total)}
            </p>
          </div>
          {state.cancelled ? (
            <p className="flex items-center gap-2 font-semibold text-red-700">
              <XCircle className="size-5" /> {state.statusLabel}
            </p>
          ) : (
            <ol className="relative space-y-6 pl-10" aria-label="Order progress">
              <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-0.5 bg-navy-100" />
              {state.steps.map((s, i) => (
                <li key={s.status} className="relative animate-[py-fade_.4s_ease-out_both]" style={{ animationDelay: `${i * 120}ms` }}>
                  <span
                    className={cn(
                      'absolute -left-10 grid size-8 place-items-center rounded-full border-2',
                      s.done ? 'border-red-600 bg-red-600 text-white' : 'border-navy-100 bg-white text-steel-400',
                    )}
                  >
                    {s.done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <p className={cn('font-semibold', !s.done && 'text-muted-foreground')}>{s.label}</p>
                  {s.at ? <p className="text-xs text-muted-foreground">{new Date(s.at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</p> : null}
                  {s.status === 'out_for_delivery' && state.rider ? <p className="text-sm">Rider: {state.rider}</p> : null}
                </li>
              ))}
            </ol>
          )}
          {state.eta && !state.cancelled && state.status !== 'delivered' ? (
            <p className="flex items-center gap-2 rounded-lg bg-navy-100/60 p-3 text-sm">
              <PackageCheck className="size-4 text-red-600" /> Estimated delivery: {state.eta}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

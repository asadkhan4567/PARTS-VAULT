'use client'

import { Bell } from 'lucide-react'
import { useActionState, useState } from 'react'

import { requestProductAlert, type FormState } from '@/app/(frontend)/actions'

export function AlertForm({ productId, type }: { productId: number; type: 'back_in_stock' | 'price_drop' }) {
  const [open, setOpen] = useState(type === 'back_in_stock')
  const [state, action, pending] = useActionState<FormState | null, FormData>(requestProductAlert, null)
  if (state?.ok) return <p className="rounded-lg bg-success/10 p-3 text-sm font-semibold text-[#0f7a37]" role="status">{state.message}</p>
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:underline">
        <Bell className="size-4" /> Tell me if the price drops
      </button>
    )
  return (
    <form action={action} className="space-y-2 rounded-lg border bg-navy-100/50 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Bell className="size-4 text-red-600" /> {type === 'back_in_stock' ? 'Get notified when it’s back in stock' : 'Get notified when the price drops'}
      </p>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="type" value={type} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`alert-${type}`}>
          Email or mobile
        </label>
        <input id={`alert-${type}`} name="contact" placeholder="Email or 0300-1234567" className="h-10 flex-1 rounded-lg border bg-white px-3 text-sm" />
        <button disabled={pending} className="h-10 rounded-lg bg-navy-900 px-4 text-sm font-semibold text-white disabled:opacity-60">
          Notify me
        </button>
      </div>
      {state && !state.ok ? <p className="text-xs text-red-700" role="alert">{state.errors?.contact ?? state.message}</p> : null}
    </form>
  )
}

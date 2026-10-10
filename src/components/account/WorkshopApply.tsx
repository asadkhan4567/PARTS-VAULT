'use client'

import { useActionState } from 'react'

import { applyForWorkshop } from '@/app/(frontend)/account/actions'

const input = 'h-11 w-full rounded-lg border bg-white px-3 text-sm'

export function WorkshopApply({ pending: alreadyApplied }: { pending: boolean }) {
  const [state, action, busy] = useActionState(applyForWorkshop, null)
  if (state?.ok || alreadyApplied)
    return <p className="rounded-lg bg-success/10 p-3 text-sm font-semibold text-[#0f7a37]">{state?.message ?? 'Your workshop application is being reviewed.'}</p>
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input name="businessName" placeholder="Workshop name" className={input} required />
      <input name="city" placeholder="City" className={input} required />
      <input name="details" placeholder="Address / NTN (optional)" className={`${input} sm:col-span-2`} />
      {state && !state.ok ? <p className="text-sm text-red-700 sm:col-span-2">{state.message}</p> : null}
      <button disabled={busy} className="h-11 rounded-lg bg-navy-900 font-semibold text-white hover:bg-navy-700 disabled:opacity-60 sm:col-span-2">
        Apply for workshop prices
      </button>
    </form>
  )
}

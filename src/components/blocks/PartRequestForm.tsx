'use client'

import { Camera } from 'lucide-react'
import { useActionState } from 'react'

import { requestPart, type FormState } from '@/app/(frontend)/actions'
import { useVehicle } from '@/components/providers/VehicleProvider'
import { vehicleLabel } from '@/lib/vehicle'

const input = 'h-11 w-full rounded-lg border border-white/15 bg-white/8 px-3 text-sm text-white placeholder:text-steel-400'

export function PartRequestForm() {
  const { vehicle } = useVehicle()
  const [state, action, pending] = useActionState<FormState | null, FormData>(requestPart, null)
  if (state?.ok) return <p className="rounded-lg bg-success/15 p-4 font-semibold text-success" role="status" data-testid="part-request-ok">{state.message}</p>
  const err = (k: string) => (state?.errors?.[k] ? <span className="text-xs text-red-400">{state.errors[k]}</span> : null)
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2" noValidate>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="grid gap-1 text-sm">
        <span>Your name</span>
        <input name="name" required className={input} autoComplete="name" />
        {err('name')}
      </label>
      <label className="grid gap-1 text-sm">
        <span>Mobile number</span>
        <input name="phone" required inputMode="tel" placeholder="0300-1234567" className={input} autoComplete="tel" />
        {err('phone')}
      </label>
      <label className="grid gap-1 text-sm">
        <span>Vehicle</span>
        <input name="vehicle" defaultValue={vehicle ? vehicleLabel(vehicle) : ''} placeholder="Toyota Corolla 2018 1.8" className={input} />
      </label>
      <label className="grid gap-1 text-sm">
        <span>VIN / chassis no. (optional)</span>
        <input name="vin" className={`${input} font-mono`} />
      </label>
      <label className="grid gap-1 text-sm sm:col-span-2">
        <span>What part do you need?</span>
        <input name="partName" placeholder="e.g. front right control arm" className={input} />
      </label>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/25 p-3 text-sm sm:col-span-2">
        <Camera className="size-5 text-red-600" />
        <span className="flex-1">Add a photo of the part (optional)</span>
        <input type="file" name="photo" accept="image/*" capture="environment" className="max-w-[45%] text-xs" />
      </label>
      {state && !state.ok ? <p className="text-sm text-red-400 sm:col-span-2" role="alert">{state.message}</p> : null}
      <button disabled={pending} className="h-12 rounded-lg bg-red-600 font-semibold text-white hover:bg-red-700 disabled:opacity-60 sm:col-span-2">
        {pending ? 'Sending…' : 'Request this part'}
      </button>
    </form>
  )
}

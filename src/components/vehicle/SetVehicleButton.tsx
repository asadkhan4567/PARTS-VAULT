'use client'

import { CheckCircle2, Car } from 'lucide-react'

import { useVehicle } from '@/components/providers/VehicleProvider'
import type { Vehicle } from '@/lib/vehicle'

export function SetVehicleButton({ vehicle, active }: { vehicle: Vehicle; active: boolean }) {
  const { select, pending } = useVehicle()
  if (active)
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-success/50 bg-success/10 px-4 py-2 text-sm font-semibold">
        <CheckCircle2 className="size-4 text-success" /> This is your vehicle
      </span>
    )
  return (
    <button type="button" disabled={pending} onClick={() => select(vehicle)} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
      <Car className="size-4" /> Set as my vehicle
    </button>
  )
}

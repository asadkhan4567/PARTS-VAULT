'use client'

import { CarFront, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { useVehicle } from '@/components/providers/VehicleProvider'
import { cn } from '@/lib/utils'
import { sameVehicle, vehicleLabel } from '@/lib/vehicle'

export function GarageView() {
  const { garage, vehicle, select, remove, openFinder } = useVehicle()
  return (
    <div className="space-y-4">
      <ul className="grid gap-3 sm:grid-cols-2" data-testid="garage-list">
        {garage.map((g) => {
          const active = vehicle ? sameVehicle(vehicle, g) : false
          return (
            <li key={`${g.generationId}-${g.year}`} className={cn('flex items-center gap-4 rounded-brand border bg-white p-4', active && 'border-success bg-success/5')}>
              <CarFront className="size-10 shrink-0 text-navy-500" />
              <div className="min-w-0 flex-1">
                <p className="font-heading text-xl font-bold">{vehicleLabel(g)}</p>
                <p className="text-xs text-muted-foreground">{g.generationLabel}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  {active ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#0f7a37]">
                      <CheckCircle2 className="size-4" /> Shopping for this car
                    </span>
                  ) : (
                    <button type="button" onClick={() => select(g)} className="font-semibold text-navy-500 hover:underline">
                      Shop for this car
                    </button>
                  )}
                  <Link href={`/make/${g.makeSlug}/${g.modelSlug}?year=${g.year}`} className="font-semibold text-navy-500 hover:underline">
                    All parts →
                  </Link>
                </div>
              </div>
              <button type="button" onClick={() => remove(g)} className="p-2 text-steel-400 hover:text-red-600" aria-label={`Remove ${vehicleLabel(g)}`}>
                <Trash2 className="size-5" />
              </button>
            </li>
          )
        })}
        <li>
          <button type="button" onClick={openFinder} className="flex h-full min-h-28 w-full items-center justify-center gap-2 rounded-brand border-2 border-dashed font-semibold text-navy-500 hover:border-red-600">
            <Plus className="size-5" /> Add a vehicle
          </button>
        </li>
      </ul>
      <p className="text-xs text-muted-foreground">Your garage is saved on this device. Sign in to keep it on all your devices.</p>
    </div>
  )
}

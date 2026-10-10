'use client'

import { Car, CheckCircle2, ChevronDown, X } from 'lucide-react'
import Link from 'next/link'

import { useVehicle } from '@/components/providers/VehicleProvider'
import { Sheet } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { sameVehicle, vehicleLabel } from '@/lib/vehicle'

import { VehicleFinder } from './VehicleFinder'

/** Compact "Select vehicle" / "Corolla 2018 ✓" button in the header + the finder dialog. */
export function VehicleSelector({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { vehicle, garage, finderOpen, openFinder, closeFinder, select, clear } = useVehicle()

  return (
    <>
      <button
        type="button"
        onClick={openFinder}
        data-testid="vehicle-selector"
        className={cn(
          'group inline-flex h-11 min-w-0 items-center gap-2 rounded-lg border px-3 text-left text-sm font-semibold transition-colors',
          vehicle ? 'border-success/50 bg-success/10 text-white' : 'border-white/15 bg-white/8 text-white hover:border-red-600',
          className,
        )}
      >
        {vehicle ? <CheckCircle2 className="size-4 shrink-0 text-success" /> : <Car className="size-4 shrink-0 text-red-600" />}
        <span className="truncate">{vehicle ? `${vehicle.modelName} ${vehicle.year}` : compact ? 'My car' : 'Select vehicle'}</span>
        <ChevronDown className="size-4 shrink-0 opacity-60" />
      </button>

      <Sheet open={finderOpen} onOpenChange={(o) => (o ? openFinder() : closeFinder())} title="Select your vehicle" description="We’ll show “Fits ✓” on every part." side="center">
        <div className="space-y-5 p-5">
          {vehicle ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-success/40 bg-success/10 p-3 text-sm">
              <span>
                Shopping for <strong>{vehicleLabel(vehicle)}</strong>
              </span>
              <button type="button" onClick={clear} className="inline-flex items-center gap-1 font-semibold text-red-700 hover:underline">
                <X className="size-4" /> Clear
              </button>
            </div>
          ) : null}
          {garage.length ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">My Garage</p>
              <div className="flex flex-wrap gap-2">
                {garage.map((g) => (
                  <button
                    key={`${g.generationId}-${g.year}`}
                    type="button"
                    onClick={() => select(g)}
                    className={cn('rounded-full border px-3 py-1.5 text-sm font-semibold hover:border-red-600', vehicle && sameVehicle(vehicle, g) && 'border-success bg-success/10')}
                  >
                    {vehicleLabel(g)}
                  </button>
                ))}
                <Link href="/garage" onClick={closeFinder} className="rounded-full px-3 py-1.5 text-sm font-semibold text-navy-500 hover:underline">
                  Manage garage
                </Link>
              </div>
            </div>
          ) : null}
          <VehicleFinder />
        </div>
      </Sheet>
    </>
  )
}

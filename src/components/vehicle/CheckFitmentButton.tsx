'use client'

import { Car } from 'lucide-react'

import { useLang } from '@/components/providers/LangProvider'
import { useVehicle } from '@/components/providers/VehicleProvider'

export function CheckFitmentButton({ label }: { label?: string }) {
  const { openFinder } = useVehicle()
  const { t } = useLang()
  return (
    <button type="button" onClick={openFinder} className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-3 py-2 text-sm font-semibold text-white hover:bg-navy-700">
      <Car className="size-4 text-red-600" /> {label ?? t('check_fitment')}
    </button>
  )
}

import type { Settings } from '@/lib/data/settings'
import type { Vehicle } from '@/lib/vehicle'
import type { Customer } from '@/payload-types'

export type BlockContext = {
  settings: Settings
  vehicle: Vehicle | null
  customer: Customer | null
}

import type { Vehicle } from './vehicle'

type Rel<T> = number | T | null | undefined
type FitmentLike = {
  make: Rel<{ id: number; name?: string }>
  model: Rel<{ id: number; name?: string }>
  yearFrom: number
  yearTo?: number | null
  engine?: string | null
}
type ProductLike = { universalFit?: boolean | null; fitments?: FitmentLike[] | null }

const idOf = (r: Rel<{ id: number }>) => (typeof r === 'object' && r ? r.id : (r ?? undefined))
const nameOf = (r: Rel<{ name?: string }>) => (typeof r === 'object' && r ? r.name : undefined)

/**
 * true  = fits the vehicle, false = does not fit, null = unknown (no vehicle selected).
 * Matching is by make + model name + year, so one fitment row can span generations
 * (e.g. an oil filter for "Corolla 2009–2022").
 */
export function fitsVehicle(product: ProductLike, vehicle: Vehicle | null | undefined, now = new Date().getFullYear()): boolean | null {
  if (!vehicle) return null
  if (product.universalFit) return true
  for (const f of product.fitments ?? []) {
    if (idOf(f.make) !== vehicle.makeId) continue
    const sameGeneration = idOf(f.model) === vehicle.generationId
    const sameName = nameOf(f.model)?.toLowerCase() === vehicle.modelName.toLowerCase()
    if (!sameGeneration && !sameName) continue
    if (vehicle.year >= f.yearFrom && vehicle.year <= (f.yearTo ?? now)) return true
  }
  return false
}

export function yearRange(from: number, to: number | null | undefined): string {
  const short = (y: number) => String(y).slice(2)
  return to ? `${short(from)}–${short(to)}` : `${short(from)}–`
}

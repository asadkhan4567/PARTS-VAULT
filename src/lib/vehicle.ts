/** The shopper's selected vehicle. Stored in a cookie (server rendering) and localStorage (garage). */
export type Vehicle = {
  makeId: number
  makeName: string
  makeSlug: string
  modelName: string
  modelSlug: string
  /** Model generation (row in `models`) */
  generationId: number
  generationLabel: string
  year: number
}

export const VEHICLE_COOKIE = 'py_vehicle'
export const GARAGE_KEY = 'py_garage'

export function vehicleLabel(v: Pick<Vehicle, 'makeName' | 'modelName' | 'year'>): string {
  return `${v.makeName} ${v.modelName} ${v.year}`
}

export function parseVehicle(raw: string | undefined | null): Vehicle | null {
  if (!raw) return null
  try {
    const v = JSON.parse(decodeURIComponent(raw)) as Partial<Vehicle>
    if (
      typeof v.makeId === 'number' &&
      typeof v.generationId === 'number' &&
      typeof v.year === 'number' &&
      typeof v.makeName === 'string' &&
      typeof v.modelName === 'string'
    ) {
      return {
        makeId: v.makeId,
        makeName: v.makeName,
        makeSlug: v.makeSlug ?? '',
        modelName: v.modelName,
        modelSlug: v.modelSlug ?? '',
        generationId: v.generationId,
        generationLabel: v.generationLabel ?? '',
        year: v.year,
      }
    }
  } catch {
    // ignore malformed cookie
  }
  return null
}

export function serializeVehicle(v: Vehicle): string {
  return encodeURIComponent(JSON.stringify(v))
}

export function sameVehicle(a: Vehicle, b: Vehicle): boolean {
  return a.generationId === b.generationId && a.year === b.year
}

/** Shape the vehicle finder receives from the server (small enough to ship as JSON). */
export type VehicleTree = Array<{
  id: number
  name: string
  slug: string
  logo: string | null
  models: Array<{
    name: string
    slug: string
    generations: Array<{ id: number; label: string; from: number; to: number | null }>
  }>
}>

/** Every year a model name covers, newest first. */
export function yearsForModel(gens: Array<{ from: number; to: number | null }>, now = new Date().getFullYear()): number[] {
  const years = new Set<number>()
  for (const g of gens) for (let y = g.from; y <= (g.to ?? now); y++) years.add(y)
  return [...years].sort((a, b) => b - a)
}

/** Generations that include a given year (more than one at a changeover year, e.g. Civic 2012). */
export function generationsForYear<T extends { from: number; to: number | null }>(gens: T[], year: number, now = new Date().getFullYear()): T[] {
  return gens.filter((g) => year >= g.from && year <= (g.to ?? now))
}

/** Delivery maths shared by product page, cart and checkout. All times are Pakistan time. */
export const PK_TZ = 'Asia/Karachi'

export type Zone = { city: string; fee: number; eta: string; sameDay?: boolean | null; areas?: string[] | null }
export type DeliveryConfig = {
  sameDayEnabled?: boolean | null
  sameDayCutoff?: string | null
  freeDeliveryThreshold?: number | null
  defaultFee?: number | null
  defaultEta?: string | null
  codEnabled?: boolean | null
  codFee?: number | null
  zones?: Zone[] | null
}

/** Minutes since midnight in Pakistan for a Date. */
export function pkMinutes(now: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: PK_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now)
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return h * 60 + m
}

export function parseCutoff(cutoff: string | null | undefined): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(cutoff ?? '')
  return m ? Number(m[1]) * 60 + Number(m[2]) : 17 * 60
}

/** Milliseconds left until today's same-day cutoff (0 when passed). */
export function msUntilCutoff(cutoff: string | null | undefined, now = new Date()): number {
  const left = parseCutoff(cutoff) - pkMinutes(now)
  return left > 0 ? (left * 60 - now.getSeconds()) * 1000 : 0
}

export function findZone(config: DeliveryConfig, city: string | null | undefined): Zone | null {
  if (!city) return null
  return config.zones?.find((z) => z.city.toLowerCase() === city.toLowerCase()) ?? null
}

export function deliveryFee(config: DeliveryConfig, city: string | null | undefined, subtotal: number): number {
  const threshold = config.freeDeliveryThreshold ?? 0
  if (threshold > 0 && subtotal >= threshold) return 0
  const zone = findZone(config, city)
  return zone ? zone.fee : (config.defaultFee ?? 0)
}

export function deliveryEta(config: DeliveryConfig, city: string | null | undefined, now = new Date()): string {
  const zone = findZone(config, city)
  if (!zone) return config.defaultEta ?? '2–4 working days'
  if (zone.sameDay && config.sameDayEnabled && msUntilCutoff(config.sameDayCutoff, now) <= 0) {
    return 'Tomorrow — order now, delivered first thing'
  }
  return zone.eta
}

/** "Add Rs 1,200 more for free delivery" progress. */
export function freeDeliveryProgress(config: DeliveryConfig, subtotal: number) {
  const threshold = config.freeDeliveryThreshold ?? 0
  if (threshold <= 0) return null
  const remaining = Math.max(0, threshold - subtotal)
  return { threshold, remaining, percent: Math.min(100, Math.round((subtotal / threshold) * 100)) }
}

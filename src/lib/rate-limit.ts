import 'server-only'

import { headers } from 'next/headers'

const buckets = new Map<string, number[]>()

/**
 * Small sliding-window limiter for public forms (per server instance). Good enough to stop
 * spam bursts; put Vercel's firewall / Upstash in front for distributed limits.
 */
export async function rateLimit(key: string, max = 5, windowMs = 60_000): Promise<boolean> {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local'
  const id = `${key}:${ip}`
  const now = Date.now()
  const hits = (buckets.get(id) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= max) {
    buckets.set(id, hits)
    return false
  }
  hits.push(now)
  buckets.set(id, hits)
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k)
  return true
}

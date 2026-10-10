import type { Media } from '@/payload-types'

type MediaRef = number | Media | null | undefined
type Size = 'thumb' | 'card' | 'large' | 'banner'

export function asMedia(ref: MediaRef): Media | null {
  return typeof ref === 'object' && ref ? ref : null
}

/** Same-origin media becomes a relative path so next/image treats it as a local image. */
function relative(url: string | null | undefined): string | null {
  if (!url) return null
  const base = process.env.NEXT_PUBLIC_SERVER_URL
  if (base && url.startsWith(base)) return url.slice(base.replace(/\/$/, '').length) || '/'
  return url.replace(/^https?:\/\/localhost(:\d+)?/, '')
}

/** URL for a media doc, preferring a generated size. */
export function mediaUrl(ref: MediaRef, size?: Size): string | null {
  const m = asMedia(ref)
  if (!m) return null
  const sized = size ? m.sizes?.[size]?.url : null
  return relative(sized || m.url)
}

export function mediaAlt(ref: MediaRef, fallback = ''): string {
  return asMedia(ref)?.alt || fallback
}

import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/url'

export default function robots(): MetadataRoute.Robots {
  // Keep staging/preview deployments out of Google.
  const isProd = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : process.env.NODE_ENV === 'production'
  if (!isProd) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/checkout', '/cart', '/account', '/order', '/pay', '/preview', '/search/suggest'] },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  }
}

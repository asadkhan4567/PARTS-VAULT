import 'server-only'

import { cache } from 'react'

import { getPayloadClient } from '../payload'

/** All public globals, once per request. Payment secrets are stripped by field access. */
export const getSettings = cache(async () => {
  const payload = await getPayloadClient()
  const opts = { overrideAccess: false, depth: 1 } as const
  const [site, delivery, announcement, navigation, seo, popup, loyalty, payments] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', ...opts }),
    payload.findGlobal({ slug: 'delivery-settings', ...opts }),
    payload.findGlobal({ slug: 'announcement-bar', ...opts }),
    payload.findGlobal({ slug: 'navigation', ...opts }),
    payload.findGlobal({ slug: 'seo-defaults', ...opts }),
    payload.findGlobal({ slug: 'popups', ...opts }),
    payload.findGlobal({ slug: 'loyalty-settings', ...opts }),
    payload.findGlobal({ slug: 'payment-settings', ...opts }),
  ])
  return { site, delivery, announcement, navigation, seo, popup, loyalty, payments }
})

export type Settings = Awaited<ReturnType<typeof getSettings>>

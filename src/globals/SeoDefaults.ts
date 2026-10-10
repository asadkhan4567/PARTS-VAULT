import type { GlobalConfig } from 'payload'

import { anyone, managers } from '@/access'

export const SeoDefaults: GlobalConfig = {
  slug: 'seo-defaults',
  label: 'SEO & Analytics',
  admin: { group: 'Settings' },
  access: { read: anyone, update: managers },
  fields: [
    { name: 'titleTemplate', type: 'text', defaultValue: '%s | Partsyaar.com', admin: { description: '%s is replaced by the page title' } },
    { name: 'defaultTitle', type: 'text', defaultValue: 'Partsyaar.com — Genuine Car Parts, Delivered Fast' },
    {
      name: 'defaultDescription',
      type: 'textarea',
      defaultValue: 'Genuine OEM and premium aftermarket car parts in Pakistan. Same-day delivery in Lahore.',
    },
    { name: 'ogImage', label: 'Default share image', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'ga4Id', label: 'Google Analytics 4 ID', type: 'text', admin: { placeholder: 'G-XXXXXXX' } },
        { name: 'metaPixelId', label: 'Meta Pixel ID', type: 'text' },
        { name: 'googleVerification', label: 'Google Search Console code', type: 'text' },
      ],
    },
  ],
}

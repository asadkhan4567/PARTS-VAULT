import type { GlobalConfig } from 'payload'

import { anyone, staff } from '@/access'

export const Popups: GlobalConfig = {
  slug: 'popups',
  label: 'Offer Popup',
  admin: { group: 'Marketing' },
  access: { read: anyone, update: staff },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: false },
    { name: 'title', type: 'text', defaultValue: 'Get 10% off your first order' },
    { name: 'text', type: 'textarea', defaultValue: 'Join our list for deals and car-care tips.' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'delaySeconds', type: 'number', defaultValue: 8, min: 0 },
        { name: 'couponCode', type: 'text', defaultValue: 'YAAR10' },
        { name: 'collectEmail', label: 'Ask for email', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'ctaText', type: 'text' },
        { name: 'ctaLink', type: 'text' },
      ],
    },
  ],
}

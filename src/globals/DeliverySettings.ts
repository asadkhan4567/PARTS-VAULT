import type { GlobalConfig } from 'payload'

import { anyone, managers } from '@/access'

export const DeliverySettings: GlobalConfig = {
  slug: 'delivery-settings',
  label: 'Delivery Settings',
  admin: { group: 'Settings', description: 'Delivery fees and times per city, same-day cutoff, free-delivery threshold, COD fee.' },
  access: { read: anyone, update: managers },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'sameDayEnabled', label: 'Same-day delivery on', type: 'checkbox', defaultValue: true },
        {
          name: 'sameDayCutoff',
          label: 'Same-day cutoff (24h, e.g. 17:00)',
          type: 'text',
          defaultValue: '17:00',
          validate: (v: unknown) => (typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v)) || 'Use HH:MM, e.g. 17:00',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'freeDeliveryThreshold', label: 'Free delivery above (Rs)', type: 'number', defaultValue: 10000, min: 0 },
        { name: 'defaultFee', label: 'Fee for other cities (Rs)', type: 'number', defaultValue: 350, min: 0 },
        { name: 'defaultEta', label: 'Delivery time for other cities', type: 'text', defaultValue: '2–4 working days' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'codEnabled', label: 'Cash on Delivery available', type: 'checkbox', defaultValue: true },
        { name: 'codFee', label: 'COD fee (Rs)', type: 'number', defaultValue: 0, min: 0 },
      ],
    },
    {
      name: 'zones',
      label: 'Cities / zones',
      type: 'array',
      labels: { singular: 'City', plural: 'Cities' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'city', type: 'text', required: true },
            { name: 'fee', label: 'Fee (Rs)', type: 'number', required: true, min: 0 },
            { name: 'eta', label: 'Delivery time text', type: 'text', required: true },
            { name: 'sameDay', label: 'Same-day', type: 'checkbox', defaultValue: false },
          ],
        },
        { name: 'areas', type: 'text', hasMany: true, admin: { description: 'Optional list of areas shoppers can pick' } },
      ],
    },
    { name: 'shippingSummary', label: 'Shipping note on product pages', type: 'textarea' },
    { name: 'returnsSummary', label: 'Returns note on product pages', type: 'textarea' },
  ],
}

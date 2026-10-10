import type { CollectionConfig } from 'payload'

import { staff } from '@/access'

/** Back-in-stock and price-drop requests from shoppers. */
export const StockAlerts: CollectionConfig = {
  slug: 'stock-alerts',
  labels: { singular: 'Product alert', plural: 'Product alerts' },
  admin: {
    useAsTitle: 'contact',
    defaultColumns: ['product', 'type', 'contact', 'notified', 'createdAt'],
    group: 'Marketing',
    description: 'Email requests are notified automatically. Phone numbers: WhatsApp them yourself, then tick Notified.',
  },
  access: { read: staff, create: staff, update: staff, delete: staff },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products', required: true, index: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'back_in_stock',
      options: [
        { label: 'Back in stock', value: 'back_in_stock' },
        { label: 'Price drop', value: 'price_drop' },
      ],
    },
    { name: 'contact', label: 'Email or phone', type: 'text', required: true },
    { name: 'priceAtRequest', type: 'number' },
    { name: 'notified', type: 'checkbox', defaultValue: false },
  ],
}

import type { CollectionConfig } from 'payload'

import { managers, staff } from '@/access'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Newsletter subscriber', plural: 'Newsletter subscribers' },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'source', 'createdAt'], group: 'Marketing' },
  access: { read: staff, create: staff, update: managers, delete: managers },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'source', type: 'text', defaultValue: 'footer' },
  ],
}

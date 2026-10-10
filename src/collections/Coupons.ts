import type { CollectionConfig } from 'payload'

import { managers } from '@/access'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'active', 'endsAt', 'usedCount'],
    group: 'Marketing',
  },
  access: { read: managers, create: managers, update: managers, delete: managers },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      hooks: { beforeValidate: [({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value)] },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'percent',
          options: [
            { label: '% off', value: 'percent' },
            { label: 'Fixed Rs off', value: 'fixed' },
            { label: 'Free delivery', value: 'free_delivery' },
          ],
        },
        { name: 'value', type: 'number', min: 0, admin: { condition: (d) => d?.type !== 'free_delivery' } },
        { name: 'maxDiscount', label: 'Max discount (Rs)', type: 'number', min: 0, admin: { condition: (d) => d?.type === 'percent' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'minOrder', label: 'Minimum order (Rs)', type: 'number', min: 0, defaultValue: 0 },
        { name: 'usageLimit', type: 'number', min: 0, admin: { description: 'Empty = unlimited' } },
        { name: 'usedCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'startsAt', type: 'date' },
        { name: 'endsAt', type: 'date' },
      ],
    },
    { name: 'firstOrderOnly', type: 'checkbox', defaultValue: false },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}

import type { CollectionConfig } from 'payload'

import { anyone, managers, staff } from '@/access'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'order', 'showOnHome'],
    group: 'Catalogue',
    description: 'Top-level categories have no parent; sub-categories pick their parent.',
  },
  defaultSort: 'order',
  access: { read: anyone, create: staff, update: staff, delete: managers },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'icon',
      type: 'select',
      defaultValue: 'wrench',
      options: [
        'engine',
        'car-front',
        'lightbulb',
        'disc',
        'wrench',
        'filter',
        'droplet',
        'snowflake',
        'battery',
        'sparkles',
        'cog',
      ].map((v) => ({ label: v, value: v })),
    },
    { name: 'description', type: 'textarea' },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    {
      name: 'showOnHome',
      label: 'Show in "Popular Categories"',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    slugField('name'),
  ],
}

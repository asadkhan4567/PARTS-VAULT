import type { CollectionConfig } from 'payload'

import { managers, staff } from '@/access'
import { slugField } from '@/fields/slug'

export const Makes: CollectionConfig = {
  slug: 'makes',
  labels: { singular: 'Car make', plural: 'Car makes' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'visible', 'order'],
    group: 'Catalogue',
    description: 'Car brands (Toyota, Honda…). Untick "Visible" to hide a make from the store.',
  },
  defaultSort: 'order',
  access: {
    read: ({ req }) => (req.user?.collection === 'users' ? true : { visible: { equals: true } }),
    create: staff,
    update: staff,
    delete: managers,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'visible', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    slugField('name'),
  ],
}

import type { CollectionConfig } from 'payload'

import { anyone, managers, staff } from '@/access'
import { slugField } from '@/fields/slug'

export const PartBrands: CollectionConfig = {
  slug: 'part-brands',
  labels: { singular: 'Part brand', plural: 'Part brands' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'trusted'],
    group: 'Catalogue',
    description: 'Manufacturers like Bosch or Denso. "Trusted" brands scroll in the homepage marquee.',
  },
  access: { read: anyone, create: staff, update: staff, delete: managers },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'country', type: 'text' },
    {
      name: 'trusted',
      label: 'Show in "Brands We Trust"',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    slugField('name'),
  ],
}

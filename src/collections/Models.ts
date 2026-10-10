import type { CollectionConfig } from 'payload'

import { anyone, managers, staff } from '@/access'
import { slugify } from '@/lib/utils'

/**
 * One row per model generation, e.g. "Corolla 2014–2022". The vehicle finder groups rows by
 * name, so a shopper picks Make → Model → Year and lands on the right generation.
 */
export const Models: CollectionConfig = {
  slug: 'models',
  labels: { singular: 'Car model', plural: 'Car models' },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'make', 'yearFrom', 'yearTo'],
    group: 'Catalogue',
    listSearchableFields: ['name', 'label'],
  },
  access: { read: anyone, create: staff, update: staff, delete: managers },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'make', type: 'relationship', relationTo: 'makes', required: true, index: true },
        { name: 'name', type: 'text', required: true, admin: { description: 'e.g. Corolla' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'yearFrom', type: 'number', required: true, min: 1970, max: 2100 },
        {
          name: 'yearTo',
          type: 'number',
          min: 1970,
          max: 2100,
          admin: { description: 'Leave empty if still on sale' },
        },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'label',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar', description: 'Filled automatically' },
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        const name = data.name ?? originalDoc?.name
        const from = data.yearFrom ?? originalDoc?.yearFrom
        const to = data.yearTo === undefined ? originalDoc?.yearTo : data.yearTo
        const years = `${from}–${to ?? 'present'}`
        const makeId = data.make ?? originalDoc?.make
        let makeName = ''
        if (makeId) {
          const id = typeof makeId === 'object' ? makeId.id : makeId
          const make = await req.payload.findByID({ collection: 'makes', id, depth: 0, req })
          makeName = make?.name ?? ''
        }
        return {
          ...data,
          label: `${makeName} ${name} ${years}`.trim(),
          slug: slugify(`${name}-${from}-${to ?? 'present'}`),
        }
      },
    ],
  },
}

import type { CollectionConfig } from 'payload'

import { managers, staff } from '@/access'

/** "Can't find your part?" leads from the website. */
export const PartRequests: CollectionConfig = {
  slug: 'part-requests',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'vehicle', 'status', 'createdAt'],
    group: 'Orders & Customers',
  },
  defaultSort: '-createdAt',
  access: { read: staff, create: staff, update: staff, delete: managers },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'vehicle', type: 'text', admin: { placeholder: 'Toyota Corolla 2018 1.8' } },
        { name: 'vin', label: 'VIN / chassis no.', type: 'text' },
      ],
    },
    { name: 'partName', type: 'text' },
    { name: 'message', type: 'textarea' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Won (ordered)', value: 'won' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'staffNotes', type: 'textarea' },
  ],
}

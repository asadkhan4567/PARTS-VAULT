import type { CollectionConfig } from 'payload'

import { fieldManagers, isStaffReq, staff } from '@/access'

/** Shoppers. They log in on the storefront (/account) — never in /admin. */
export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'email', 'type', 'points'],
    group: 'Orders & Customers',
    listSearchableFields: ['name', 'phone', 'email'],
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30,
    cookies: { sameSite: 'Lax' },
  },
  access: {
    admin: () => false,
    create: () => true,
    read: ({ req }) => {
      if (isStaffReq(req)) return true
      const user = req.user as { collection?: string; id?: number } | null
      return user?.collection === 'customers' ? { id: { equals: user.id } } : false
    },
    update: ({ req }) => {
      if (isStaffReq(req)) return true
      const user = req.user as { collection?: string; id?: number } | null
      return user?.collection === 'customers' ? { id: { equals: user.id } } : false
    },
    delete: staff,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'phone',
      type: 'text',
      required: true,
      admin: { description: 'Pakistani mobile, e.g. 0300-1234567' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'retail',
          saveToJWT: true,
          options: [
            { label: 'Retail', value: 'retail' },
            { label: 'Workshop (B2B prices)', value: 'workshop' },
          ],
          access: { update: fieldManagers, create: fieldManagers },
        },
        {
          name: 'points',
          label: 'Yaar Points',
          type: 'number',
          defaultValue: 0,
          min: 0,
          access: { update: ({ req }) => isStaffReq(req), create: ({ req }) => isStaffReq(req) },
        },
      ],
    },
    {
      name: 'addresses',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', admin: { placeholder: 'Home / Office' } },
        { name: 'city', type: 'text', required: true },
        { name: 'area', type: 'text' },
        { name: 'address', type: 'textarea', required: true },
      ],
    },
    {
      name: 'garage',
      label: 'Saved vehicles',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'make', type: 'relationship', relationTo: 'makes', required: true },
            { name: 'model', type: 'relationship', relationTo: 'models', required: true },
            { name: 'year', type: 'number', required: true },
          ],
        },
      ],
    },
    { name: 'wishlist', type: 'relationship', relationTo: 'products', hasMany: true },
    {
      type: 'collapsible',
      label: 'Workshop application',
      admin: { initCollapsed: true },
      fields: [
        { name: 'workshopApplication', type: 'textarea', admin: { readOnly: true, description: 'Approve by setting Type to Workshop above.' } },
        { name: 'workshopRequestedAt', type: 'date', admin: { readOnly: true } },
      ],
    },
    { name: 'notes', type: 'textarea', access: { read: ({ req }) => isStaffReq(req) } },
  ],
}

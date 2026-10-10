import type { CollectionConfig } from 'payload'

import { fieldOwners, isOwnerReq, isStaffReq, owners } from '@/access'

/** Staff accounts that can log in to /admin. The very first account becomes the Owner. */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Staff member', plural: 'Staff' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Settings',
    description: 'People who can log in to this admin panel.',
  },
  auth: { tokenExpiration: 60 * 60 * 24 * 7 },
  access: {
    admin: ({ req }) => isStaffReq(req),
    read: ({ req }) => {
      if (isOwnerReq(req)) return true
      if (isStaffReq(req) && req.user) return { id: { equals: req.user.id } }
      return false
    },
    create: async ({ req }) => {
      if (isOwnerReq(req)) return true
      // Allow creating the very first account from the /admin "create first user" screen.
      const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
      return totalDocs === 0
    },
    update: ({ req }) => {
      if (isOwnerReq(req)) return true
      if (isStaffReq(req) && req.user) return { id: { equals: req.user.id } }
      return false
    },
    delete: owners,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      saveToJWT: true,
      access: { update: fieldOwners },
      options: [
        { label: 'Owner — everything, incl. payment keys and staff', value: 'owner' },
        { label: 'Manager — prices, costs, catalogue, orders, settings', value: 'manager' },
        { label: 'Staff — stock, orders, content (no prices or costs)', value: 'staff' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'phone', type: 'text' },
  ],
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
        return totalDocs === 0 ? { ...data, role: 'owner' } : data
      },
    ],
  },
}

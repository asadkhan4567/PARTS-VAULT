import type { CollectionConfig } from 'payload'

import { managers } from '@/access'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: { singular: 'Audit log entry', plural: 'Audit log' },
  admin: {
    useAsTitle: 'documentTitle',
    defaultColumns: ['createdAt', 'userLabel', 'collectionSlug', 'documentTitle', 'action'],
    group: 'Settings',
    description: 'Who changed prices, stock and order statuses, and when. Read-only.',
  },
  defaultSort: '-createdAt',
  access: { read: managers, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'action', type: 'select', options: ['create', 'update', 'delete', 'bulk'] },
    { name: 'collectionSlug', label: 'Collection', type: 'text', index: true },
    { name: 'documentId', type: 'text', index: true },
    { name: 'documentTitle', type: 'text' },
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'userLabel', label: 'By', type: 'text' },
    { name: 'changes', type: 'json' },
  ],
}

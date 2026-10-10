import type { CollectionConfig } from 'payload'

import { managers, publishedOrStaff, staff } from '@/access'
import { slugField } from '@/fields/slug'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: { singular: 'Blog post', plural: 'Blog posts' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status'],
    group: 'Content',
  },
  defaultSort: '-publishedAt',
  versions: { drafts: { schedulePublish: true }, maxPerDoc: 25 },
  access: { read: publishedOrStaff, create: staff, update: staff, delete: managers },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'excerpt', type: 'textarea', admin: { description: 'One or two sentences for cards and Google' } },
    { name: 'body', type: 'richText', required: true },
    { name: 'tags', type: 'text', hasMany: true },
    { name: 'relatedProducts', type: 'relationship', relationTo: 'products', hasMany: true },
    { name: 'author', type: 'text', defaultValue: 'Partsyaar Team', admin: { position: 'sidebar' } },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar' },
      hooks: { beforeChange: [({ value }) => value ?? new Date().toISOString()] },
    },
    slugField('title'),
  ],
}

import type { CollectionConfig } from 'payload'

import { managers, publishedOrStaff, staff } from '@/access'
import { PAGE_BLOCKS } from '@/blocks'
import { slugField } from '@/fields/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    description: 'About Us, FAQ, policies and any other page. Build pages from sections.',
  },
  versions: { drafts: { schedulePublish: true }, maxPerDoc: 25 },
  access: { read: publishedOrStaff, create: staff, update: staff, delete: managers },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'intro', type: 'textarea', admin: { description: 'Short line under the page title' } },
    { name: 'layout', label: 'Page sections', type: 'blocks', blocks: PAGE_BLOCKS },
    slugField('title'),
  ],
}

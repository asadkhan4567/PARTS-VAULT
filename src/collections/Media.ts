import type { CollectionConfig } from 'payload'

import { anyone, managers, staff } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content', description: 'Image library. Every image needs a short description (alt text).' },
  access: { read: anyone, create: staff, update: staff, delete: managers },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Describe the image for Google and blind shoppers, e.g. "Hitachi brake pads".' },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    focalPoint: true,
    formatOptions: { format: 'webp', options: { quality: 82 } },
    imageSizes: [
      { name: 'thumb', width: 240, height: 240, fit: 'cover', formatOptions: { format: 'webp' } },
      { name: 'card', width: 600, height: 600, fit: 'cover', formatOptions: { format: 'webp' } },
      { name: 'large', width: 1400, formatOptions: { format: 'webp' } },
      { name: 'banner', width: 1920, height: 720, fit: 'cover', formatOptions: { format: 'webp' } },
    ],
    adminThumbnail: 'thumb',
  },
}

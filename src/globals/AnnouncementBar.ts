import type { GlobalConfig } from 'payload'

import { anyone, staff } from '@/access'

export const AnnouncementBar: GlobalConfig = {
  slug: 'announcement-bar',
  label: 'Announcement Bar',
  admin: { group: 'Marketing', description: 'The thin red strip at the very top of every page.' },
  access: { read: anyone, update: staff },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    {
      name: 'messages',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'text', type: 'text', required: true },
            { name: 'link', type: 'text' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'background', type: 'text', defaultValue: '#E10600', admin: { description: 'Colour code' } },
        { name: 'textColor', type: 'text', defaultValue: '#FFFFFF' },
        { name: 'intervalSeconds', label: 'Seconds per message', type: 'number', defaultValue: 4, min: 2 },
      ],
    },
  ],
}

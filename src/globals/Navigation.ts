import type { GlobalConfig } from 'payload'

import { anyone, managers } from '@/access'
import { linkArray, linkFields } from '@/fields/link'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Header & Footer Menus',
  admin: { group: 'Settings', description: 'Links in the header and footer.' },
  access: { read: anyone, update: managers },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Header',
          fields: [
            linkArray('headerLinks', 'Header links (next to the mega menus)'),
            { name: 'megaMenuCategoryCount', label: 'Categories shown in the mega menu', type: 'number', defaultValue: 10 },
            { name: 'megaMenuMakeCount', label: 'Makes shown in the mega menu', type: 'number', defaultValue: 16 },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'footerColumns',
              type: 'array',
              maxRows: 5,
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'auto',
                  label: 'Fill automatically',
                  type: 'select',
                  defaultValue: 'none',
                  options: [
                    { label: 'No — use the links below', value: 'none' },
                    { label: 'Top makes', value: 'makes' },
                    { label: 'Top categories', value: 'categories' },
                  ],
                },
                { name: 'links', type: 'array', fields: linkFields(true) },
              ],
            },
            {
              name: 'paymentIcons',
              type: 'select',
              hasMany: true,
              defaultValue: ['cod', 'bank', 'jazzcash', 'easypaisa', 'visa', 'mastercard'],
              options: ['cod', 'bank', 'jazzcash', 'easypaisa', 'visa', 'mastercard'].map((v) => ({ label: v, value: v })),
            },
          ],
        },
      ],
    },
  ],
}

import type { GlobalConfig } from 'payload'

import { anyone, managers } from '@/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
    description: 'Store name, logo, phone and WhatsApp numbers, addresses, hours and social links — used everywhere on the site.',
  },
  access: { read: anyone, update: managers },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'storeName', type: 'text', required: true, defaultValue: 'Partsyaar.com' },
                { name: 'tagline', type: 'text', defaultValue: 'Genuine Parts. Locked In. Delivered Fast.' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'logo', label: 'Logo (for dark/navy backgrounds)', type: 'upload', relationTo: 'media' },
                { name: 'logoLight', label: 'Logo (for white backgrounds)', type: 'upload', relationTo: 'media' },
              ],
            },
            { name: 'aboutBlurb', label: 'Short "about us" (footer)', type: 'textarea' },
            { name: 'footerText', label: 'Copyright line', type: 'text', defaultValue: '© Partsyaar.com. All rights reserved.' },
            {
              type: 'row',
              fields: [
                { name: 'ntn', label: 'NTN (for invoices)', type: 'text' },
                { name: 'strn', label: 'STRN', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'phone', label: 'Support phone', type: 'text', required: true, defaultValue: '0300-0000000' },
                {
                  name: 'whatsapp',
                  label: 'WhatsApp number',
                  type: 'text',
                  required: true,
                  defaultValue: '923000000000',
                  admin: { description: 'International format without + or spaces, e.g. 923001234567' },
                },
              ],
            },
            {
              name: 'emails',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', defaultValue: 'Support' },
                    { name: 'email', type: 'email', required: true },
                  ],
                },
              ],
            },
            {
              name: 'orderNotificationEmails',
              label: 'Send new-order emails to',
              type: 'text',
              hasMany: true,
              admin: { description: 'Type an email and press Enter. Add as many as you like.' },
            },
            { name: 'businessHours', type: 'text', defaultValue: 'Mon–Sat 9:00am – 9:00pm · Sun 11:00am – 6:00pm' },
          ],
        },
        {
          label: 'Stores',
          fields: [
            {
              name: 'stores',
              type: 'array',
              labels: { singular: 'Store', plural: 'Stores' },
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'address', type: 'textarea', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'city', type: 'text', defaultValue: 'Lahore' },
                    { name: 'phone', type: 'text' },
                  ],
                },
                { name: 'hours', type: 'text' },
                { name: 'mapUrl', label: 'Google Maps link', type: 'text' },
                {
                  name: 'mapEmbedQuery',
                  label: 'Map search text (for the embedded map)',
                  type: 'text',
                  admin: { placeholder: 'Partsyaar, McLeod Road, Lahore' },
                },
              ],
            },
          ],
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'social',
              type: 'group',
              fields: [
                { name: 'facebook', type: 'text' },
                { name: 'instagram', type: 'text' },
                { name: 'tiktok', type: 'text' },
                { name: 'youtube', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
  ],
}

import type { CollectionConfig, Where } from 'payload'

import { staff } from '@/access'

export const BANNER_PLACEMENTS = [
  { label: 'Homepage — hero slider', value: 'home_hero' },
  { label: 'Homepage — promo (2-up)', value: 'home_promo' },
  { label: 'Homepage — feature', value: 'home_feature' },
  { label: 'Category pages — top', value: 'category_top' },
  { label: 'Cart drawer', value: 'cart' },
] as const

export const Banners: CollectionConfig = {
  slug: 'banners',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'placement', 'active', 'startsAt', 'endsAt', 'order'],
    group: 'Marketing',
    description: 'Pictures with a headline and button. Pick where they appear; optional start/end dates.',
  },
  defaultSort: 'order',
  access: {
    read: ({ req }) => {
      if (req.user?.collection === 'users') return true
      const now = new Date().toISOString()
      const where: Where = {
        and: [
          { active: { equals: true } },
          { or: [{ startsAt: { exists: false } }, { startsAt: { less_than_equal: now } }] },
          { or: [{ endsAt: { exists: false } }, { endsAt: { greater_than: now } }] },
        ],
      }
      return where
    },
    create: staff,
    update: staff,
    delete: staff,
  },
  fields: [
    { name: 'title', type: 'text', required: true, admin: { description: 'Internal name' } },
    { name: 'placement', type: 'select', required: true, defaultValue: 'home_promo', options: [...BANNER_PLACEMENTS] },
    {
      type: 'row',
      fields: [
        { name: 'imageDesktop', type: 'upload', relationTo: 'media' },
        { name: 'imageMobile', type: 'upload', relationTo: 'media' },
      ],
    },
    { name: 'eyebrow', type: 'text', admin: { placeholder: 'LIMITED OFFER' } },
    { name: 'headline', type: 'text' },
    { name: 'subtext', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'ctaText', label: 'Button text', type: 'text' },
        { name: 'ctaLink', label: 'Button link', type: 'text' },
      ],
    },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'navy',
      options: [
        { label: 'Navy', value: 'navy' },
        { label: 'Red', value: 'red' },
        { label: 'Light', value: 'light' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'startsAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'endsAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}

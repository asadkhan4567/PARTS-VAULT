import type { CollectionConfig, Where } from 'payload'

import { fieldManagers, fieldStaffOrWorkshop, managers, publishedOrStaff, staff } from '@/access'
import { slugField } from '@/fields/slug'
import { auditFields } from '@/hooks/audit'
import { notifyProductAlerts } from '@/hooks/productAlerts'
import { compactPartNumber } from '@/lib/search'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sku', 'price', 'stock', 'partBrand', '_status'],
    group: 'Catalogue',
    listSearchableFields: ['title', 'sku', 'oemNumber', 'searchText'],
    description: 'Every part in the store. Use "Save Draft" to prepare a product before it goes live.',
    pagination: { defaultLimit: 50 },
  },
  defaultSort: '-updatedAt',
  versions: { drafts: { schedulePublish: true }, maxPerDoc: 25 },
  access: { read: publishedOrStaff, create: staff, update: staff, delete: managers },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      hooks: { beforeDuplicate: [({ value }) => `${value} (copy)`] },
      admin: {
        description:
          'Format: Part – Make Model [YY–YY] – OEM No. – Brand. e.g. "Front Brake Pads – Toyota Corolla [14–22] – 04465-02220 – Hitachi"',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Price & stock',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  label: 'Price (Rs)',
                  type: 'number',
                  required: true,
                  min: 0,
                  access: { create: fieldManagers, update: fieldManagers },
                },
                {
                  name: 'compareAtPrice',
                  label: 'Old price (Rs) — shows "Save Rs X"',
                  type: 'number',
                  min: 0,
                  access: { create: fieldManagers, update: fieldManagers },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'workshopPrice',
                  label: 'Workshop / B2B price (Rs)',
                  type: 'number',
                  min: 0,
                  access: { read: fieldStaffOrWorkshop, create: fieldManagers, update: fieldManagers },
                },
                {
                  name: 'costPrice',
                  label: 'Cost price (Rs) — never shown on the website',
                  type: 'number',
                  min: 0,
                  access: { read: fieldManagers, create: fieldManagers, update: fieldManagers },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'stock', label: 'Stock quantity', type: 'number', required: true, defaultValue: 0, min: 0 },
                { name: 'lowStockThreshold', type: 'number', defaultValue: 3, min: 0 },
                { name: 'weightKg', label: 'Weight (kg)', type: 'number', min: 0 },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'sku',
                  label: 'SKU',
                  type: 'text',
                  required: true,
                  unique: true,
                  index: true,
                  // "Duplicate" gets a fresh, unique SKU to edit.
                  hooks: { beforeDuplicate: [({ value }) => `${value}-COPY-${Date.now().toString(36).slice(-4).toUpperCase()}`] },
                },
                { name: 'oemNumber', label: 'OEM / part number', type: 'text', index: true },
              ],
            },
            {
              name: 'crossRefs',
              label: 'Cross-reference numbers',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'number', type: 'text', required: true },
                    { name: 'brand', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            { name: 'images', type: 'upload', relationTo: 'media', hasMany: true, admin: { description: 'First image is the main one. Drag to reorder.' } },
            {
              type: 'row',
              fields: [
                { name: 'partBrand', type: 'relationship', relationTo: 'part-brands', required: true },
                {
                  name: 'condition',
                  type: 'select',
                  required: true,
                  defaultValue: 'genuine',
                  options: [
                    { label: 'Genuine', value: 'genuine' },
                    { label: 'OEM', value: 'oem' },
                    { label: 'Aftermarket', value: 'aftermarket' },
                  ],
                },
              ],
            },
            { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true, required: true },
            { name: 'description', type: 'richText' },
            {
              name: 'specs',
              label: 'Specifications',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'value', type: 'text', required: true },
                  ],
                },
              ],
            },
            { name: 'warranty', type: 'text', admin: { placeholder: '6 months manufacturer warranty' } },
            { name: 'videoUrl', label: 'Video URL (YouTube or MP4)', type: 'text' },
            { name: 'tags', type: 'text', hasMany: true, admin: { description: 'Extra search words, incl. Roman Urdu: "brake ki pads"' } },
          ],
        },
        {
          label: 'Fitment',
          fields: [
            {
              name: 'universalFit',
              label: 'Fits all vehicles (e.g. car care, horns)',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'fitments',
              type: 'array',
              labels: { singular: 'Vehicle', plural: 'Vehicles this part fits' },
              admin: { condition: (data) => !data?.universalFit },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'make', type: 'relationship', relationTo: 'makes', required: true },
                    {
                      name: 'model',
                      type: 'relationship',
                      relationTo: 'models',
                      required: true,
                      filterOptions: ({ siblingData }) => {
                        const make = (siblingData as { make?: number | { id: number } })?.make
                        if (!make) return true
                        return { make: { equals: typeof make === 'object' ? make.id : make } } satisfies Where
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'yearFrom', type: 'number', required: true },
                    { name: 'yearTo', type: 'number', admin: { description: 'Empty = up to today' } },
                    { name: 'engine', type: 'text', admin: { placeholder: '1.8L 2ZR-FE' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Related',
          fields: [
            {
              name: 'boughtTogether',
              label: 'Frequently bought together',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
            },
            {
              name: 'bundleDiscountPercent',
              label: 'Bundle discount (%) when bought together',
              type: 'number',
              min: 0,
              max: 50,
              defaultValue: 5,
            },
          ],
        },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'bestSeller', label: 'Best seller', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'salesCount',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', readOnly: true, description: 'Units sold (updated by orders)' },
    },
    {
      name: 'ratingAvg',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'ratingCount', type: 'number', defaultValue: 0, admin: { position: 'sidebar', readOnly: true } },
    slugField('title'),
    {
      // Denormalised text for search: title, numbers, brand, vehicles, tags.
      name: 'searchText',
      type: 'textarea',
      admin: { hidden: true },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const doc = { ...(originalDoc ?? {}), ...data }
        const words: Array<string | null | undefined> = [doc.title, doc.sku, doc.oemNumber]
        for (const ref of doc.crossRefs ?? []) words.push(ref?.number, ref?.brand)
        for (const tag of doc.tags ?? []) words.push(tag)
        const ids = (v: unknown) => (typeof v === 'object' && v ? (v as { id: number }).id : (v as number))
        if (doc.partBrand) {
          const b = await req.payload.findByID({ collection: 'part-brands', id: ids(doc.partBrand), depth: 0, req }).catch(() => null)
          words.push(b?.name)
        }
        for (const f of doc.fitments ?? []) {
          const m = f?.model
            ? await req.payload.findByID({ collection: 'models', id: ids(f.model), depth: 0, req }).catch(() => null)
            : null
          words.push(m?.label, f?.engine)
        }
        // Part numbers also indexed without dashes/spaces so "0446502220" finds "04465-02220".
        for (const n of [doc.sku, doc.oemNumber, ...(doc.crossRefs ?? []).map((r: { number?: string }) => r?.number)]) {
          if (n) words.push(compactPartNumber(n))
        }
        return { ...data, searchText: words.filter(Boolean).join(' ').toLowerCase() }
      },
    ],
    afterChange: [auditFields(['price', 'compareAtPrice', 'workshopPrice', 'costPrice', 'stock']), notifyProductAlerts],
  },
}

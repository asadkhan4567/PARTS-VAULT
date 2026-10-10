import type { Field } from 'payload'

import { slugify } from '@/lib/utils'

/** Sidebar slug, auto-filled from `from` (usually the title) when left empty. */
export function slugField(from = 'title', overrides: Partial<Field> = {}): Field {
  return {
    name: 'slug',
    type: 'text',
    index: true,
    unique: true,
    admin: {
      position: 'sidebar',
      description: 'Web address. Leave empty to create it from the name automatically.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data, originalDoc }) => {
          if (typeof value === 'string' && value.trim()) return slugify(value)
          const source = data?.[from] ?? originalDoc?.[from]
          return typeof source === 'string' ? slugify(source) : value
        },
      ],
    },
    ...overrides,
  } as Field
}

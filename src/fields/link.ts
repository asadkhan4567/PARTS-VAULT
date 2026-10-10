import type { Field } from 'payload'

/** A simple editable link: label + URL (internal path like /category/filters or full https://). */
export function linkFields(required = false): Field[] {
  return [
    { name: 'label', type: 'text', required },
    {
      name: 'url',
      type: 'text',
      required,
      admin: { description: 'e.g. /category/brake-pads or https://wa.me/923001234567' },
    },
  ]
}

export const linkArray = (name: string, label?: string): Field => ({
  name,
  label,
  type: 'array',
  fields: linkFields(true),
  admin: { initCollapsed: true },
})

import type { GlobalConfig } from 'payload'

import { anyone, staff } from '@/access'
import { HOME_BLOCKS } from '@/blocks'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  admin: {
    group: 'Content',
    description: 'Drag sections to reorder. Untick "Show this section" to hide one without deleting it.',
  },
  versions: { drafts: true, max: 25 },
  access: { read: anyone, update: staff },
  fields: [{ name: 'sections', type: 'blocks', blocks: HOME_BLOCKS }],
}

import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { cn } from '@/lib/utils'

export function RichText({ data, className }: { data: unknown; className?: string }) {
  if (!data || typeof data !== 'object') return null
  return <LexicalRichText data={data as SerializedEditorState} className={cn('prose-py', className)} />
}

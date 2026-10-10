import 'server-only'

import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { cn } from '@/lib/utils'

/**
 * CMS rich text rendered to HTML on the server. (Payload's React renderer would ship the
 * Lexical editor bundle to shoppers' browsers; this ships none.)
 */
export function RichText({ data, className }: { data: unknown; className?: string }) {
  if (!data || typeof data !== 'object') return null
  const html = convertLexicalToHTML({ data: data as SerializedEditorState })
  return <div className={cn('prose-py', className)} dangerouslySetInnerHTML={{ __html: html }} />
}

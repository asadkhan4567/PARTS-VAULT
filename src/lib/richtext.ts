/**
 * Tiny builder for Payload's Lexical JSON, used by the seed and by server code that writes
 * rich text. Supports "## heading", "### heading", "- bullet" and plain paragraphs.
 */
type Node = Record<string, unknown>

const text = (t: string, format = 0): Node => ({ type: 'text', text: t, format, detail: 0, mode: 'normal', style: '', version: 1 })

/** Inline **bold** support. */
function inline(line: string): Node[] {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  return parts.map((p) => (p.startsWith('**') && p.endsWith('**') ? text(p.slice(2, -2), 1) : text(p)))
}

const block = (type: string, children: Node[], extra: Node = {}): Node => ({
  type,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  ...extra,
})

export function richText(source: string) {
  const children: Node[] = []
  let list: Node[] | null = null
  for (const raw of source.trim().split('\n')) {
    const line = raw.trim()
    if (line.startsWith('- ')) {
      list ??= []
      list.push(block('listitem', inline(line.slice(2)), { value: list.length + 1 }))
      continue
    }
    if (list) {
      children.push(block('list', list, { listType: 'bullet', start: 1, tag: 'ul' }))
      list = null
    }
    if (!line) continue
    if (line.startsWith('### ')) children.push(block('heading', inline(line.slice(4)), { tag: 'h3' }))
    else if (line.startsWith('## ')) children.push(block('heading', inline(line.slice(3)), { tag: 'h2' }))
    else children.push(block('paragraph', inline(line), { textFormat: 0, textStyle: '' }))
  }
  if (list) children.push(block('list', list, { listType: 'bullet', start: 1, tag: 'ul' }))
  return { root: block('root', children) } as {
    root: { type: string; children: { type: unknown; version: number; [k: string]: unknown }[]; direction: 'ltr' | 'rtl' | null; format: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'; indent: number; version: number }
    [k: string]: unknown
  }
}

/** Plain text out of Lexical JSON (for excerpts, search, meta descriptions). */
export function richTextToPlain(value: unknown): string {
  const out: string[] = []
  const walk = (n: unknown) => {
    if (!n || typeof n !== 'object') return
    const node = n as { text?: string; children?: unknown[]; type?: string }
    if (typeof node.text === 'string') out.push(node.text)
    node.children?.forEach(walk)
    if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'listitem') out.push(' ')
  }
  walk((value as { root?: unknown })?.root)
  return out.join('').replace(/\s+/g, ' ').trim()
}

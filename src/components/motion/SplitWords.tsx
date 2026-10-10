/**
 * Server-rendered word reveal: each word slides up via CSS (transform only, text visible from the
 * first paint, so it never delays LCP). `highlight` words render red.
 */
export function SplitWords({ text, highlight }: { text: string; highlight?: string | null }) {
  const parts: Array<{ word: string; red: boolean }> = []
  const hi = highlight && text.includes(highlight) ? highlight : null
  const segments = hi ? text.split(hi) : [text]
  segments.forEach((seg, i) => {
    seg.split(/\s+/).filter(Boolean).forEach((w) => parts.push({ word: w, red: false }))
    if (hi && i < segments.length - 1) hi.split(/\s+/).filter(Boolean).forEach((w) => parts.push({ word: w, red: true }))
  })
  return (
    <>
      {parts.map((p, i) => (
        <span key={i} className="py-word">
          <span className={p.red ? 'text-red-600' : undefined} style={{ animationDelay: `${80 + i * 60}ms` }}>
            {p.word}
          </span>{' '}
        </span>
      ))}
    </>
  )
}

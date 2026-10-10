'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // clipboard blocked
        }
      }}
      className="group inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-left text-xs hover:border-navy-500"
      aria-label={`Copy ${label} ${value}`}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold text-navy-900">{value}</span>
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5 text-steel-400 group-hover:text-navy-500" />}
    </button>
  )
}

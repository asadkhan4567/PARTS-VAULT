'use client'

import { useState } from 'react'

type Result = { created: number; updated: number; skipped: number; dryRun: boolean; errors: Array<{ row: number; sku?: string; message: string }> }

export function ImportForm() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async (dryRun: boolean) => {
    if (!file) return
    setBusy(true)
    setError(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('_payload', JSON.stringify({ dryRun: String(dryRun) }))
    try {
      const res = await fetch('/api/tools/products-import', { method: 'POST', body: fd, credentials: 'include' })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Upload failed')
      else setResult(data)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <input type="file" accept=".csv,text/csv" onChange={(e) => (setFile(e.target.files?.[0] ?? null), setResult(null))} data-testid="import-file" />
      <div className="py-actions">
        <button type="button" className="btn btn--style-secondary btn--size-medium" disabled={!file || busy} onClick={() => send(true)}>
          Check file (no changes)
        </button>
        {result?.dryRun && !result.errors.length ? (
          <button type="button" className="btn btn--style-primary btn--size-medium" disabled={busy} onClick={() => send(false)} data-testid="import-apply">
            Import now
          </button>
        ) : null}
      </div>
      {error ? <p className="py-msg py-msg--err">{error}</p> : null}
      {result ? (
        <div className="py-msg">
          <p>
            {result.dryRun ? 'Check result — nothing saved yet:' : '✅ Import finished:'} <strong>{result.created}</strong> new, <strong>{result.updated}</strong> updated, {result.skipped} unchanged.
          </p>
          {result.errors.length ? (
            <ul className="py-errors">
              {result.errors.slice(0, 50).map((e) => (
                <li key={`${e.row}-${e.message}`}>
                  Row {e.row}
                  {e.sku ? ` (${e.sku})` : ''}: {e.message}
                </li>
              ))}
            </ul>
          ) : null}
          {result.dryRun && result.errors.length ? <p>Fix these rows in Excel and upload again.</p> : null}
        </div>
      ) : null}
    </div>
  )
}

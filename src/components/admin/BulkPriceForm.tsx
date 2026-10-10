'use client'

import { useState } from 'react'

type Opt = { id: number; name: string }
type Row = { id: number; title: string; sku: string; from: number | null; to: number }

const rs = (n: number | null) => (n == null ? '—' : `Rs ${n.toLocaleString('en-PK')}`)

export function BulkPriceForm({ categories, brands, makes }: { categories: Opt[]; brands: Opt[]; makes: Opt[] }) {
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [makeId, setMakeId] = useState('')
  const [search, setSearch] = useState('')
  const [field, setField] = useState<'price' | 'compareAtPrice' | 'workshopPrice'>('price')
  const [mode, setMode] = useState('increase_percent')
  const [amount, setAmount] = useState('5')
  const [roundTo, setRoundTo] = useState('5')
  const [keepOld, setKeepOld] = useState(false)
  const [preview, setPreview] = useState<{ count: number; rows: Row[] } | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const body = (apply: boolean) =>
    JSON.stringify({
      apply,
      filter: {
        categoryIds: categoryId ? [Number(categoryId)] : [],
        brandIds: brandId ? [Number(brandId)] : [],
        makeId: makeId ? Number(makeId) : null,
        search: search || undefined,
      },
      change: { field, mode, amount: Number(amount) || 0, roundTo: Number(roundTo) || 1, keepOldAsCompareAt: keepOld },
    })

  const run = async (apply: boolean) => {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/tools/bulk-price', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: body(apply) })
      const data = await res.json()
      if (!res.ok) return setMsg(data.error ?? 'Something went wrong')
      if (apply) {
        setMsg(`✅ Updated ${data.updated} products.`)
        setPreview(null)
      } else setPreview(data)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="py-form">
      <fieldset>
        <legend>1. Which products?</legend>
        <div className="py-grid">
          <label>
            Category
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Brand
            <select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
              <option value="">All brands</option>
              {brands.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Car make
            <select value={makeId} onChange={(e) => setMakeId(e.target.value)}>
              <option value="">All makes</option>
              {makes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Name / SKU contains
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. brake pads" />
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>2. What change?</legend>
        <div className="py-grid">
          <label>
            Price to change
            <select value={field} onChange={(e) => setField(e.target.value as typeof field)}>
              <option value="price">Selling price</option>
              <option value="compareAtPrice">Old price (shows “Save”)</option>
              <option value="workshopPrice">Workshop price</option>
            </select>
          </label>
          <label>
            Change
            <select value={mode} onChange={(e) => setMode(e.target.value)} data-testid="bulk-mode">
              <option value="increase_percent">Increase by %</option>
              <option value="decrease_percent">Decrease by %</option>
              <option value="increase_fixed">Increase by Rs</option>
              <option value="decrease_fixed">Decrease by Rs</option>
              <option value="set">Set exact Rs</option>
            </select>
          </label>
          <label>
            Amount
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" data-testid="bulk-amount" />
          </label>
          <label>
            Round to nearest
            <select value={roundTo} onChange={(e) => setRoundTo(e.target.value)}>
              {['1', '5', '10', '50', '100'].map((r) => (
                <option key={r} value={r}>
                  Rs {r}
                </option>
              ))}
            </select>
          </label>
        </div>
        {field === 'price' && mode.startsWith('decrease') ? (
          <label className="py-check">
            <input type="checkbox" checked={keepOld} onChange={(e) => setKeepOld(e.target.checked)} /> Show the current price as the “old price” (sale)
          </label>
        ) : null}
      </fieldset>
      <div className="py-actions">
        <button type="button" className="btn btn--style-secondary btn--size-medium" disabled={busy} onClick={() => run(false)} data-testid="bulk-preview">
          Preview
        </button>
        {preview?.count ? (
          <button
            type="button"
            className="btn btn--style-primary btn--size-medium"
            disabled={busy}
            data-testid="bulk-apply"
            onClick={() => {
              if (window.confirm(`Change ${preview.count} products now?`)) void run(true)
            }}
          >
            Apply to {preview.count} products
          </button>
        ) : null}
      </div>
      {msg ? <p className="py-msg">{msg}</p> : null}
      {preview ? (
        <div className="py-table-wrap">
          <p className="py-muted">{preview.count} products match{preview.count > preview.rows.length ? ` (showing first ${preview.rows.length})` : ''}.</p>
          <table className="py-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Now</th>
                <th>New</th>
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td className="py-mono">{r.sku}</td>
                  <td>{rs(r.from)}</td>
                  <td className={r.to > (r.from ?? 0) ? 'py-up' : r.to < (r.from ?? 0) ? 'py-down' : ''}>{rs(r.to)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

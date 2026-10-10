'use client'

import { useEffect, useRef } from 'react'

/** Posts a signed form to a payment gateway (with a manual button as fallback). */
export function AutoSubmit({ action, fields }: { action: string; fields: Record<string, string> }) {
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    const t = setTimeout(() => ref.current?.submit(), 400)
    return () => clearTimeout(t)
  }, [])
  return (
    <form ref={ref} method="POST" action={action}>
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button className="h-12 rounded-lg bg-red-600 px-6 font-semibold text-white">Continue to payment</button>
    </form>
  )
}

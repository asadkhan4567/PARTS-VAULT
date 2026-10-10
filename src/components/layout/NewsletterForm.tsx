'use client'

import { useActionState } from 'react'

import { subscribe, type FormState } from '@/app/(frontend)/actions'
import { cn } from '@/lib/utils'

export function NewsletterForm({ source = 'footer', tone = 'dark' }: { source?: string; tone?: 'dark' | 'light' }) {
  const [state, action, pending] = useActionState<FormState | null, FormData>(subscribe, null)
  if (state?.ok) return <p className="rounded-lg bg-success/15 p-3 text-sm font-semibold text-success" role="status">{state.message}</p>
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row" noValidate>
      <input type="hidden" name="source" value={source} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="sr-only" htmlFor={`nl-${source}`}>
        Email address
      </label>
      <input
        id={`nl-${source}`}
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        aria-invalid={Boolean(state?.errors?.email)}
        className={cn('h-11 flex-1 rounded-lg border px-3 text-sm', tone === 'dark' ? 'border-white/15 bg-white/8 text-white placeholder:text-steel-400' : 'border-border bg-white')}
      />
      <button disabled={pending} className="h-11 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
        {pending ? 'Joining…' : 'Subscribe'}
      </button>
      {state && !state.ok ? <p className="text-sm text-red-600 sm:basis-full" role="alert">{state.errors?.email ?? state.message}</p> : null}
    </form>
  )
}

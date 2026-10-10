'use client'

import * as Tabs from '@radix-ui/react-tabs'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { normalizePkPhone } from '@/lib/whatsapp'

const input = 'h-12 w-full rounded-lg border bg-white px-3'

async function login(email: string, password: string) {
  const res = await fetch('/api/customers/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
  if (!res.ok) throw new Error('Wrong email or password.')
}

export function AuthForms({ next }: { next: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const done = () => {
    router.replace(next)
    router.refresh()
  }
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-navy">
      <Tabs.Root defaultValue="login">
        <Tabs.List className="mb-6 grid grid-cols-2 rounded-lg bg-navy-100 p-1">
          {['login', 'register'].map((v) => (
            <Tabs.Trigger key={v} value={v} onClick={() => setError(null)} className="rounded-md py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
              {v === 'login' ? 'Log in' : 'Create account'}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {error ? (
          <p className="mb-4 rounded-lg bg-red-600/5 p-3 text-sm font-semibold text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <Tabs.Content value="login">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              start(async () => {
                try {
                  await login(String(f.get('email')), String(f.get('password')))
                  done()
                } catch (err) {
                  setError((err as Error).message)
                }
              })
            }}
          >
            <label className="grid gap-1 text-sm font-semibold">
              Email
              <input name="email" type="email" autoComplete="email" required className={input} />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Password
              <input name="password" type="password" autoComplete="current-password" required className={input} />
            </label>
            <button disabled={pending} className="h-12 w-full rounded-lg bg-red-600 font-semibold text-white hover:bg-red-700 disabled:opacity-60">
              {pending ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        </Tabs.Content>
        <Tabs.Content value="register">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              const phone = normalizePkPhone(String(f.get('phone')))
              if (!phone) return setError('Enter a mobile number like 0300-1234567.')
              if (String(f.get('password')).length < 8) return setError('Use at least 8 characters for your password.')
              start(async () => {
                const res = await fetch('/api/customers', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: f.get('name'), phone, email: f.get('email'), password: f.get('password') }),
                })
                if (!res.ok) {
                  const body = (await res.json().catch(() => null)) as { errors?: Array<{ message?: string }> } | null
                  const msg = body?.errors?.[0]?.message ?? ''
                  return setError(/email/i.test(msg) ? 'An account with this email already exists — please log in.' : 'Could not create your account. Please check the details.')
                }
                try {
                  await login(String(f.get('email')), String(f.get('password')))
                  done()
                } catch (err) {
                  setError((err as Error).message)
                }
              })
            }}
          >
            <label className="grid gap-1 text-sm font-semibold">
              Full name
              <input name="name" autoComplete="name" required className={input} />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Mobile number
              <input name="phone" type="tel" autoComplete="tel" required placeholder="0300-1234567" className={input} />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Email
              <input name="email" type="email" autoComplete="email" required className={input} />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Password
              <input name="password" type="password" autoComplete="new-password" minLength={8} required className={input} />
            </label>
            <button disabled={pending} className="h-12 w-full rounded-lg bg-red-600 font-semibold text-white hover:bg-red-700 disabled:opacity-60">
              {pending ? 'Creating…' : 'Create account'}
            </button>
            <p className="text-xs text-muted-foreground">Earn Yaar Points on every order. Workshops: ask us to upgrade your account for trade prices.</p>
          </form>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

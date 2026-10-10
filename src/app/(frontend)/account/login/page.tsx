import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthForms } from '@/components/account/AuthForms'
import { getCustomer } from '@/lib/session'

export const metadata: Metadata = { title: 'Log in or create an account', robots: { index: false } }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : '/account'
  if (await getCustomer()) redirect(safeNext)
  return (
    <div className="bg-navy-100/40 py-12">
      <div className="container-py max-w-md">
        <AuthForms next={safeNext} />
      </div>
    </div>
  )
}

'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch('/api/customers/logout', { method: 'POST', credentials: 'include' })
        router.replace('/')
        router.refresh()
      }}
      className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-semibold hover:border-red-600"
    >
      <LogOut className="size-4" /> Log out
    </button>
  )
}

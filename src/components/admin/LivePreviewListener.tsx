'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/** In draft mode, re-renders the page whenever the owner saves in the admin's live preview. */
export function LivePreviewListener() {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={process.env.NEXT_PUBLIC_SERVER_URL || ''} />
}

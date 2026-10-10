import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { isStaffReq } from '@/access'
import { getPayloadClient } from '@/lib/payload'

/** Turns on draft mode for logged-in staff (used by admin live preview), then opens the page. */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path') ?? '/'
  const safe = path.startsWith('/') && !path.startsWith('//') ? path : '/'
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user || !isStaffReq({ user })) return new Response('Please log in to the admin to preview drafts.', { status: 401 })
  ;(await draftMode()).enable()
  redirect(safe)
}

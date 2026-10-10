import { NextResponse, type NextRequest } from 'next/server'

import { LANG_COOKIE } from '@/lib/i18n'

/** `?lang=ur` / `?lang=en` (used by hreflang links) sets the language cookie. */
export function middleware(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang')
  if (lang !== 'ur' && lang !== 'en') return NextResponse.next()
  const url = req.nextUrl.clone()
  url.searchParams.delete('lang')
  const res = NextResponse.redirect(url)
  res.cookies.set(LANG_COOKIE, lang, { path: '/', maxAge: 31536000, sameSite: 'lax' })
  return res
}

export const config = { matcher: ['/((?!api|admin|_next|.*\\..*).*)'] }

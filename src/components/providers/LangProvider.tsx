'use client'

import { useRouter } from 'next/navigation'
import { createContext, useContext } from 'react'

import { LANG_COOKIE, translate, type Lang, type TKey } from '@/lib/i18n'

const Ctx = createContext<Lang>('en')

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>
}

export function useLang() {
  const lang = useContext(Ctx)
  return { lang, t: (k: TKey) => translate(lang, k) }
}

/** Translated interface text — usable inside server components too. */
export function T({ k }: { k: TKey }) {
  return <>{translate(useContext(Ctx), k)}</>
}

export function LangToggle({ className }: { className?: string }) {
  const { lang, t } = useLang()
  const router = useRouter()
  return (
    <button
      type="button"
      lang={lang === 'ur' ? 'en' : 'ur'}
      className={className}
      data-testid="lang-toggle"
      onClick={() => {
        document.cookie = `${LANG_COOKIE}=${lang === 'ur' ? 'en' : 'ur'}; path=/; max-age=31536000; samesite=lax`
        router.refresh()
      }}
    >
      {t('language')}
    </button>
  )
}

import type { Metadata, Viewport } from 'next'
import { cookies, draftMode } from 'next/headers'
import Link from 'next/link'
import React from 'react'

import { WishlistSync } from '@/components/account/WishlistSync'
import { LivePreviewListener } from '@/components/admin/LivePreviewListener'
import { Analytics } from '@/components/layout/Analytics'
import { OfferPopup } from '@/components/layout/OfferPopup'

import { CartDrawer } from '@/components/cart/CartDrawer'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { MotionProvider } from '@/components/motion/MotionProvider'
import { Preloader, preloaderScript } from '@/components/motion/Preloader'
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat'
import { CartProvider } from '@/components/providers/CartProvider'
import { VehicleProvider } from '@/components/providers/VehicleProvider'
import { getVehicleTree } from '@/lib/data/catalog'
import { getSettings } from '@/lib/data/settings'
import { fontVariables } from '@/lib/fonts'
import { mediaUrl } from '@/lib/media'
import { LangProvider } from '@/components/providers/LangProvider'
import { LANG_COOKIE, parseLang } from '@/lib/i18n'
import { getCustomer, getVehicle } from '@/lib/session'
import { absoluteUrl } from '@/lib/url'

import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const { seo, site } = await getSettings()
  const og = mediaUrl(seo.ogImage, 'large')
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    title: {
      default: seo.defaultTitle || site.storeName,
      template: seo.titleTemplate || `%s | ${site.storeName}`,
    },
    description: seo.defaultDescription || undefined,
    openGraph: {
      siteName: site.storeName,
      type: 'website',
      locale: 'en_PK',
      images: og ? [{ url: og }] : undefined,
    },
    verification: seo.googleVerification ? { google: seo.googleVerification } : undefined,
    alternates: { languages: { 'en-PK': '/', 'ur-PK': '/?lang=ur' } },
  }
}

// Pinch-zoom stays enabled (WCAG 1.4.4) — never set maximumScale / userScalable here.
export const viewport: Viewport = {
  themeColor: '#0A1A33',
  width: 'device-width',
  initialScale: 1,
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, tree, vehicle, draft] = await Promise.all([
    getSettings(),
    getVehicleTree(),
    getVehicle(),
    draftMode(),
  ])
  const customer = await getCustomer()
  const lang = parseLang((await cookies()).get(LANG_COOKIE)?.value)
  const popup = settings.popup
  return (
    <html lang={lang} dir={lang === 'ur' ? 'rtl' : 'ltr'} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preloaderScript }} />
      </head>
      <body>
        <Preloader />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: settings.site.storeName,
                url: absoluteUrl('/'),
                logo: absoluteUrl('/favicon.svg'),
                sameAs: Object.values(settings.site.social ?? {}).filter((v) => typeof v === 'string' && v.startsWith('http')),
                contactPoint: { '@type': 'ContactPoint', telephone: settings.site.phone, contactType: 'customer service', areaServed: 'PK', availableLanguage: ['en', 'ur'] },
              },
              ...(settings.site.stores ?? []).map((st) => ({
                '@context': 'https://schema.org',
                '@type': 'AutoPartsStore',
                name: st.name,
                url: absoluteUrl('/stores'),
                telephone: st.phone ?? settings.site.phone,
                address: { '@type': 'PostalAddress', streetAddress: st.address, addressLocality: st.city ?? 'Lahore', addressCountry: 'PK' },
                openingHours: st.hours ?? settings.site.businessHours ?? undefined,
                priceRange: 'Rs',
              })),
            ]),
          }}
        />
        {draft.isEnabled ? (
          <>
            <LivePreviewListener />
            <div className="fixed left-1/2 top-2 z-[95] -translate-x-1/2 rounded-full bg-warning px-4 py-1 text-xs font-bold text-navy-950 shadow">
              Preview mode — showing drafts ·{' '}
              <Link href="/preview/exit" prefetch={false} className="underline">
                exit
              </Link>
            </div>
          </>
        ) : null}
        <LangProvider lang={lang}>
        <VehicleProvider initial={vehicle} tree={tree} loggedIn={Boolean(customer)}>
          <CartProvider>
            <MotionProvider>
              <Header settings={settings} />
              <main id="main">{children}</main>
              <Footer settings={settings} />
              <CartDrawer delivery={settings.delivery} />
              <WhatsAppFloat number={settings.site.whatsapp} />
            {customer ? <WishlistSync /> : null}
            <Analytics ga4Id={settings.seo.ga4Id} pixelId={settings.seo.metaPixelId} />
            {popup.enabled ? (
              <OfferPopup
                title={popup.title}
                text={popup.text}
                image={mediaUrl(popup.image, 'card')}
                delaySeconds={popup.delaySeconds}
                couponCode={popup.couponCode}
                collectEmail={popup.collectEmail}
                ctaText={popup.ctaText}
                ctaLink={popup.ctaLink}
              />
            ) : null}
              <MobileTabBar />
            </MotionProvider>
          </CartProvider>
        </VehicleProvider>
        </LangProvider>
      </body>
    </html>
  )
}

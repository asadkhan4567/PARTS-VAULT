import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import React from 'react'

import { LivePreviewListener } from '@/components/admin/LivePreviewListener'

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
import { getVehicle } from '@/lib/session'

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
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preloaderScript }} />
      </head>
      <body>
        <Preloader />
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
        <VehicleProvider initial={vehicle} tree={tree}>
          <CartProvider>
            <MotionProvider>
              <Header settings={settings} />
              <main id="main">{children}</main>
              <Footer settings={settings} />
              <CartDrawer delivery={settings.delivery} />
              <WhatsAppFloat number={settings.site.whatsapp} />
              <MobileTabBar />
            </MotionProvider>
          </CartProvider>
        </VehicleProvider>
      </body>
    </html>
  )
}

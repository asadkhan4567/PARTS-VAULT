import type { Metadata, Viewport } from 'next'
import React from 'react'

import { CartDrawer } from '@/components/cart/CartDrawer'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
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
    title: { default: seo.defaultTitle || site.storeName, template: seo.titleTemplate || `%s | ${site.storeName}` },
    description: seo.defaultDescription || undefined,
    openGraph: { siteName: site.storeName, type: 'website', locale: 'en_PK', images: og ? [{ url: og }] : undefined },
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
  const [settings, tree, vehicle] = await Promise.all([getSettings(), getVehicleTree(), getVehicle()])
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <VehicleProvider initial={vehicle} tree={tree}>
          <CartProvider>
            <Header settings={settings} />
            <main id="main">{children}</main>
            <Footer settings={settings} />
            <CartDrawer delivery={settings.delivery} />
            <WhatsAppFloat number={settings.site.whatsapp} />
            <MobileTabBar />
          </CartProvider>
        </VehicleProvider>
      </body>
    </html>
  )
}

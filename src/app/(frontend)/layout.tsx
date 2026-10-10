import type { Metadata, Viewport } from 'next'
import React from 'react'

import { fontVariables } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: {
    default: 'Partsyaar.com — Genuine Car Parts, Delivered Fast',
    template: '%s | Partsyaar.com',
  },
  description:
    'Genuine OEM and premium aftermarket car parts in Pakistan. Same-day delivery in Lahore.',
}

// Pinch-zoom stays enabled (WCAG 1.4.4) — never set maximumScale / userScalable here.
export const viewport: Viewport = {
  themeColor: '#0A1A33',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}

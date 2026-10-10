import type { Metadata } from 'next'

import { GarageView } from '@/components/vehicle/GarageView'

export const metadata: Metadata = { title: 'My Garage', robots: { index: false } }

export default function GaragePage() {
  return (
    <div className="container-py max-w-4xl py-10">
      <h1 className="mb-2 text-4xl">My Garage</h1>
      <p className="mb-8 text-muted-foreground">Save your cars and switch between them in one tap. We’ll show “Fits ✓” on every part.</p>
      <GarageView />
    </div>
  )
}

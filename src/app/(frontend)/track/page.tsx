import type { Metadata } from 'next'

import { TrackForm } from '@/components/cart/TrackForm'

export const metadata: Metadata = { title: 'Track your order', description: 'Track your Partsyaar order with your order number and phone.' }

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams
  return (
    <div className="bg-navy-100/40 py-10">
      <div className="container-py max-w-2xl">
        <h1 className="mb-2 text-4xl">Track your order</h1>
        <p className="mb-6 text-muted-foreground">Enter your order number and the phone number you used at checkout.</p>
        <TrackForm defaultOrder={order?.toUpperCase() ?? ''} />
      </div>
    </div>
  )
}

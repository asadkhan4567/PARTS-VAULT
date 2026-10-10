import type { Metadata } from 'next'

import { WishlistView } from '@/components/account/WishlistView'

export const metadata: Metadata = { title: 'Wishlist', robots: { index: false } }

export default function WishlistPage() {
  return (
    <div className="container-py py-10">
      <h1 className="mb-6 text-4xl">Wishlist</h1>
      <WishlistView />
    </div>
  )
}

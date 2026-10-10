import type { Metadata } from 'next'

import { CartPageView } from '@/components/cart/CartPageView'
import { getSettings } from '@/lib/data/settings'

export const metadata: Metadata = { title: 'Your cart', robots: { index: false } }

export default async function CartPage() {
  const { delivery } = await getSettings()
  return <CartPageView delivery={delivery} />
}

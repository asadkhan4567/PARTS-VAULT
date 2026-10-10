import { NextResponse, type NextRequest } from 'next/server'

import { listProducts } from '@/lib/data/products'
import { mediaUrl } from '@/lib/media'
import { priceFor } from '@/lib/product'
import { getCustomer } from '@/lib/session'

/** Lightweight product cards for client widgets (recently viewed, wishlist). */
export async function GET(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get('ids') ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 50)
  if (!ids.length) return NextResponse.json([])
  const [{ docs }, customer] = await Promise.all([listProducts({ ids, limit: 50, sort: 'popular' }), getCustomer()])
  return NextResponse.json(
    docs.map((p) => ({ id: p.id, title: p.title, slug: p.slug, price: priceFor(p, customer), image: mediaUrl(p.images?.[0], 'thumb'), stock: p.stock })),
  )
}

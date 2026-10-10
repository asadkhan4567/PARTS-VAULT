import { NextResponse, type NextRequest } from 'next/server'

import { getCategoryTree, getVehicleTree } from '@/lib/data/catalog'
import { listProducts } from '@/lib/data/products'
import { fitsVehicle } from '@/lib/fitment'
import { mediaUrl } from '@/lib/media'
import { priceFor } from '@/lib/product'
import { normalizeQuery } from '@/lib/search'
import { getCustomer, getVehicle } from '@/lib/session'

/** Live search suggestions for the header search box. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').slice(0, 80)
  const tokens = normalizeQuery(q)
  if (!tokens.length) return NextResponse.json({ products: [], categories: [], models: [] })

  const [{ docs }, vehicle, customer, tree, makes] = await Promise.all([listProducts({ q, limit: 6 }), getVehicle(), getCustomer(), getCategoryTree(), getVehicleTree()])

  const categories = tree
    .flatMap((c) => [c, ...c.children])
    .filter((c) => tokens.some((t) => c.name.toLowerCase().includes(t)))
    .slice(0, 4)
    .map((c) => ({ name: c.name, slug: c.slug ?? '' }))

  const models = makes
    .flatMap((m) => m.models.map((mo) => ({ make: m, model: mo })))
    .filter(({ make, model }) => tokens.some((t) => model.name.toLowerCase() === t || `${make.name} ${model.name}`.toLowerCase().includes(t)) && tokens.some((t) => model.name.toLowerCase().includes(t)))
    .slice(0, 3)
    .map(({ make, model }) => ({ label: `${make.name} ${model.name} parts`, href: `/make/${make.slug}/${model.slug}` }))

  return NextResponse.json(
    {
      products: docs.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: priceFor(p, customer),
        image: mediaUrl(p.images?.[0], 'thumb'),
        oem: p.oemNumber ?? null,
        fits: fitsVehicle(p, vehicle),
      })),
      categories,
      models,
    },
    { headers: { 'Cache-Control': 'private, max-age=30' } },
  )
}

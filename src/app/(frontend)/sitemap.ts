import type { MetadataRoute } from 'next'

import { getCategoryTree, getVehicleTree } from '@/lib/data/catalog'
import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl } from '@/lib/url'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const pub = { overrideAccess: false, depth: 0, limit: 0, pagination: false } as const
  const [products, pages, posts, tree, makes] = await Promise.all([
    payload.find({ collection: 'products', ...pub, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'pages', ...pub, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'blog-posts', ...pub, select: { slug: true, updatedAt: true } }),
    getCategoryTree(),
    getVehicleTree(),
  ])
  const entry = (path: string, lastModified?: string, priority = 0.6): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    lastModified: lastModified ? new Date(lastModified) : undefined,
    priority,
    alternates: { languages: { 'en-PK': absoluteUrl(path), 'ur-PK': absoluteUrl(`${path}${path.includes('?') ? '&' : '?'}lang=ur`) } },
  })
  return [
    entry('/', undefined, 1),
    entry('/categories', undefined, 0.7),
    entry('/blog', undefined, 0.5),
    entry('/stores', undefined, 0.5),
    ...tree.flatMap((c) => [entry(`/category/${c.slug}`, undefined, 0.8), ...c.children.map((s) => entry(`/category/${s.slug}`, undefined, 0.7))]),
    ...makes.flatMap((m) => [entry(`/make/${m.slug}`, undefined, 0.8), ...m.models.map((mo) => entry(`/make/${m.slug}/${mo.slug}`, undefined, 0.7))]),
    ...products.docs.map((p) => entry(`/product/${p.slug}`, p.updatedAt, 0.9)),
    ...pages.docs.map((p) => entry(`/${p.slug}`, p.updatedAt, 0.4)),
    ...posts.docs.map((p) => entry(`/blog/${p.slug}`, p.updatedAt, 0.5)),
  ]
}

import 'server-only'

import { cache } from 'react'

import type { Category, Make, Model, PartBrand } from '@/payload-types'

import { mediaUrl } from '../media'
import { getPayloadClient } from '../payload'
import { slugify } from '../utils'
import type { VehicleTree } from '../vehicle'

const pub = { overrideAccess: false } as const

export const getMakes = cache(async (): Promise<Make[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'makes', ...pub, where: { visible: { equals: true } }, sort: 'order', limit: 200, depth: 1 })
  return docs
})

export const getMakeBySlug = cache(async (slug: string): Promise<Make | null> => {
  const makes = await getMakes()
  return makes.find((m) => m.slug === slug) ?? null
})

export const getModelsForMake = cache(async (makeId: number): Promise<Model[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'models', ...pub, where: { make: { equals: makeId } }, sort: 'name', limit: 500, depth: 1 })
  return docs
})

/** Make → model name → generations, for the vehicle finder. */
export const getVehicleTree = cache(async (): Promise<VehicleTree> => {
  const payload = await getPayloadClient()
  const makes = await getMakes()
  const { docs: models } = await payload.find({ collection: 'models', ...pub, limit: 2000, depth: 0, sort: 'name' })
  return makes.map((make) => {
    const byName = new Map<string, VehicleTree[number]['models'][number]>()
    for (const m of models) {
      if (m.make !== make.id) continue
      const entry = byName.get(m.name) ?? { name: m.name, slug: slugify(m.name), generations: [] }
      entry.generations.push({ id: m.id, label: m.label ?? m.name, from: m.yearFrom, to: m.yearTo ?? null })
      byName.set(m.name, entry)
    }
    for (const e of byName.values()) e.generations.sort((a, b) => b.from - a.from)
    return { id: make.id, name: make.name, slug: make.slug ?? slugify(make.name), logo: mediaUrl(make.logo, 'thumb'), models: [...byName.values()] }
  })
})

export type CategoryNode = Category & { children: Category[] }

export const getCategoryTree = cache(async (): Promise<CategoryNode[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'categories', ...pub, limit: 500, depth: 1, sort: 'order' })
  const parentId = (c: Category) => (typeof c.parent === 'object' && c.parent ? c.parent.id : c.parent)
  const roots = docs.filter((c) => !parentId(c)).map((c) => ({ ...c, children: [] as Category[] }))
  for (const c of docs) {
    const pid = parentId(c)
    if (pid) roots.find((r) => r.id === pid)?.children.push(c)
  }
  return roots
})

export const getCategoryBySlug = cache(async (slug: string) => {
  const tree = await getCategoryTree()
  for (const root of tree) {
    if (root.slug === slug) return { category: root as Category, parent: null as Category | null, children: root.children }
    const child = root.children.find((c) => c.slug === slug)
    if (child) return { category: child, parent: root as Category, children: [] as Category[] }
  }
  return null
})

export const getPartBrands = cache(async (): Promise<PartBrand[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'part-brands', ...pub, limit: 200, depth: 1, sort: 'name' })
  return docs
})

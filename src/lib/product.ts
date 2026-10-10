import type { Customer, Product } from '@/payload-types'

/** The price this shopper pays: workshop price for approved B2B accounts. */
export function priceFor(p: Pick<Product, 'price' | 'workshopPrice'>, customer: Pick<Customer, 'type'> | null | undefined): number {
  if (customer?.type === 'workshop' && p.workshopPrice) return p.workshopPrice
  return p.price
}

export type StockState = 'in' | 'low' | 'out'

export function stockState(p: Pick<Product, 'stock' | 'lowStockThreshold'>): StockState {
  if (p.stock <= 0) return 'out'
  if (p.stock <= (p.lowStockThreshold ?? 3)) return 'low'
  return 'in'
}

/** Rupees saved vs the old price, or 0. */
export function savings(price: number, compareAt: number | null | undefined): number {
  return compareAt && compareAt > price ? compareAt - price : 0
}

export function savingsPercent(price: number, compareAt: number | null | undefined): number {
  const s = savings(price, compareAt)
  return s ? Math.round((s / (compareAt as number)) * 100) : 0
}

const CONDITION_LABEL: Record<string, string> = { genuine: 'Genuine', oem: 'OEM', aftermarket: 'Aftermarket' }
export const conditionLabel = (c: string | null | undefined) => CONDITION_LABEL[c ?? ''] ?? 'Genuine'

export const relName = <T extends { name?: string | null }>(r: number | T | null | undefined): string =>
  typeof r === 'object' && r ? (r.name ?? '') : ''

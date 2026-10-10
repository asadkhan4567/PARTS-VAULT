export const ORDER_STATUSES = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Packed', value: 'packed' },
  { label: 'Out for delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Returned', value: 'returned' },
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]['value']

/** The happy path shown as the tracking timeline. */
export const ORDER_FLOW: OrderStatus[] = ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered']

export function statusLabel(status: string): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.label ?? status
}

export const PAYMENT_METHODS = [
  { label: 'Cash on Delivery', value: 'cod' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'JazzCash', value: 'jazzcash' },
  { label: 'Easypaisa', value: 'easypaisa' },
  { label: 'Card', value: 'card' },
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['value']

/** Order numbers look like PY-100245. */
export const ORDER_PREFIX = 'PY-'
export const FIRST_ORDER_NUMBER = 100001

export function nextOrderNumber(latest: string | null | undefined): string {
  const n = latest ? Number.parseInt(latest.replace(/\D/g, ''), 10) : NaN
  return `${ORDER_PREFIX}${Number.isFinite(n) ? n + 1 : FIRST_ORDER_NUMBER}`
}

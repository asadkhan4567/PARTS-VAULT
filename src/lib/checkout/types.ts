/** Client-safe shapes for cart quotes. */
export type CartLineInput = { productId: number; quantity: number }

export type QuoteLine = {
  productId: number
  title: string
  slug: string
  sku: string
  image: string | null
  unitPrice: number
  quantity: number
  requested: number
  lineTotal: number
  bundleDiscount: number
  stock: number
}

export type Quote = {
  lines: QuoteLine[]
  subtotal: number
  bundleDiscount: number
  couponCode: string | null
  couponDiscount: number
  couponMessage: string | null
  couponValid: boolean
  deliveryFee: number
  codFee: number
  pointsRedeemed: number
  total: number
  eta: string
  warnings: string[]
}

export type PaymentOption = { id: string; label: string; instructions: string | null; fee: number }

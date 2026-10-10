import type { Order, PaymentSetting } from '@/payload-types'

import type { PaymentOption } from '../checkout/types'

/**
 * Payment gateway adapter. Offline methods (COD, bank transfer) return no redirect; online
 * gateways (JazzCash, Easypaisa, Safepay/PayFast) return a URL or auto-submit form to pay.
 * Swap or add a gateway by registering another adapter — checkout code doesn't change.
 */
export interface PaymentAdapter {
  id: Order['paymentMethod']
  label: string
  enabled(settings: PaymentSetting): boolean
  instructions(settings: PaymentSetting): string | null
  /** Online gateways: build the payment request for an order. */
  start?(order: Order, settings: PaymentSetting, ctx: { returnUrl: string }): Promise<PaymentStart>
  /** Online gateways: verify a callback and return the payment result. */
  verify?(params: Record<string, string>, settings: PaymentSetting): Promise<{ orderNumber: string; paid: boolean; reference?: string }>
}

export type PaymentStart = { kind: 'redirect'; url: string } | { kind: 'form'; action: string; fields: Record<string, string> }

const cod: PaymentAdapter = {
  id: 'cod',
  label: 'Cash on Delivery',
  enabled: (s) => Boolean(s.cod?.enabled),
  instructions: (s) => s.cod?.instructions ?? 'Pay the rider in cash when your parts arrive.',
}

const bankTransfer: PaymentAdapter = {
  id: 'bank_transfer',
  label: 'Bank Transfer',
  enabled: (s) => Boolean(s.bankTransfer?.enabled),
  instructions: (s) => s.bankTransfer?.details ?? null,
}

const registry = new Map<string, PaymentAdapter>([
  [cod.id, cod],
  [bankTransfer.id, bankTransfer],
])

export function registerPaymentAdapter(adapter: PaymentAdapter) {
  registry.set(adapter.id, adapter)
}

export function getAdapter(id: string): PaymentAdapter | undefined {
  return registry.get(id)
}

/** Methods the shopper can choose, in display order. */
export function availablePayments(settings: PaymentSetting, codFee = 0, codAllowed = true): PaymentOption[] {
  return [...registry.values()]
    .filter((a) => a.enabled(settings) && (a.id !== 'cod' || codAllowed))
    .map((a) => ({ id: a.id, label: a.label, instructions: a.instructions(settings), fee: a.id === 'cod' ? codFee : 0 }))
}

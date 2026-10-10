import { createHash, createHmac, timingSafeEqual } from 'crypto'

import type { PaymentAdapter } from './index'

const safeEq = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

/** Safepay: create a payment tracker, redirect to Safepay's hosted checkout, verify the HMAC signature. */
async function safepayStart(order: Parameters<NonNullable<PaymentAdapter['start']>>[0], s: Parameters<PaymentAdapter['enabled']>[0], returnUrl: string) {
  const c = s.card!
  const env = c.sandbox ? 'sandbox' : 'production'
  const api = c.sandbox ? 'https://sandbox.api.getsafepay.com' : 'https://api.getsafepay.com'
  const res = await fetch(`${api}/order/v1/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client: c.publicKey, amount: order.total, currency: 'PKR', environment: env }),
  })
  if (!res.ok) throw new Error(`Safepay init failed (${res.status})`)
  const token = ((await res.json()) as { data?: { token?: string } }).data?.token
  if (!token) throw new Error('Safepay returned no token')
  const q = new URLSearchParams({ env, beacon: token, source: 'custom', order_id: order.orderNumber ?? '', redirect_url: returnUrl, cancel_url: returnUrl })
  return { kind: 'redirect' as const, url: `${api}/components?${q}` }
}

/** PayFast (Pakistan): get an access token, then post the hosted payment form. */
async function payfastStart(order: Parameters<NonNullable<PaymentAdapter['start']>>[0], s: Parameters<PaymentAdapter['enabled']>[0], returnUrl: string) {
  const c = s.card!
  const base = c.sandbox ? 'https://ipguat.apps.net.pk/Ecommerce/api/Transaction' : 'https://ipg1.apps.net.pk/Ecommerce/api/Transaction'
  const body = new URLSearchParams({ MERCHANT_ID: c.publicKey ?? '', SECURED_KEY: c.secretKey ?? '', BASKET_ID: order.orderNumber ?? '', TXNAMT: String(order.total ?? 0), CURRENCY_CODE: 'PKR' })
  const res = await fetch(`${base}/GetAccessToken`, { method: 'POST', body })
  if (!res.ok) throw new Error(`PayFast token failed (${res.status})`)
  const token = ((await res.json()) as { ACCESS_TOKEN?: string }).ACCESS_TOKEN
  if (!token) throw new Error('PayFast returned no token')
  return {
    kind: 'form' as const,
    action: `${base}/PostTransaction`,
    fields: {
      MERCHANT_ID: c.publicKey ?? '',
      MERCHANT_NAME: 'Partsyaar.com',
      TOKEN: token,
      PROCCODE: '00',
      TXNAMT: String(order.total ?? 0),
      CUSTOMER_MOBILE_NO: (order.phone ?? '').replace(/\D/g, ''),
      CUSTOMER_EMAIL_ADDRESS: order.email ?? '',
      SIGNATURE: createHash('sha256').update(`${order.orderNumber}${order.total}`).digest('hex'),
      VERSION: 'PARTSYAAR-1.0',
      TXNDESC: `Partsyaar order ${order.orderNumber}`,
      SUCCESS_URL: returnUrl,
      FAILURE_URL: returnUrl,
      BASKET_ID: order.orderNumber ?? '',
      ORDER_DATE: new Date().toISOString().slice(0, 19).replace('T', ' '),
      CHECKOUT_URL: returnUrl,
      CURRENCY_CODE: 'PKR',
    },
  }
}

export const card: PaymentAdapter = {
  id: 'card',
  label: 'Debit / Credit card',
  enabled: (s) => Boolean(s.card?.enabled),
  instructions: (s) => `You’ll pay on ${s.card?.provider === 'payfast' ? 'PayFast' : 'Safepay'}’s secure page (Visa, Mastercard, UnionPay).`,
  async start(order, s, { returnUrl }) {
    if (!s.card?.publicKey || !s.card.secretKey) throw new Error('Card payments are not configured')
    return s.card.provider === 'payfast' ? payfastStart(order, s, returnUrl) : safepayStart(order, s, returnUrl)
  },
  async verify(params, s) {
    const secret = s.card?.secretKey ?? ''
    if (s.card?.provider === 'payfast') {
      // validation_hash = sha256(basket_id|secured_key|merchant_id|err_code)
      const expected = createHash('sha256').update(`${params.basket_id}|${secret}|${s.card.publicKey}|${params.err_code}`).digest('hex')
      return { orderNumber: params.basket_id ?? '', paid: safeEq(expected, params.validation_hash ?? '') && params.err_code === '000', reference: params.transaction_id }
    }
    const expected = createHmac('sha256', secret).update(params.tracker ?? '').digest('hex')
    return { orderNumber: params.order_id ?? '', paid: Boolean(params.tracker) && safeEq(expected, params.sig ?? ''), reference: params.reference ?? params.tracker }
  },
}

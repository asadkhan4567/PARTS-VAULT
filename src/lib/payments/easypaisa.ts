import { createCipheriv } from 'crypto'

import type { PaymentAdapter } from './index'

/** Easypaisa merchantHashedReq: AES-128-ECB(hashKey) over the sorted query string, base64. */
export function easypaisaHash(fields: Record<string, string>, hashKey: string): string {
  const str = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join('&')
  const cipher = createCipheriv('aes-128-ecb', Buffer.from(hashKey, 'utf8').subarray(0, 16), null)
  return Buffer.concat([cipher.update(str, 'utf8'), cipher.final()]).toString('base64')
}

const d = (x: Date) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${x.getFullYear()}${p(x.getMonth() + 1)}${p(x.getDate())} ${p(x.getHours())}${p(x.getMinutes())}${p(x.getSeconds())}`
}

/**
 * Easypaisa hosted checkout (Easypay). The shopper pays on Easypaisa's page; the post-back
 * carries status 0000 on success. Confirm settlement in the Easypaisa merchant portal.
 */
export const easypaisa: PaymentAdapter = {
  id: 'easypaisa',
  label: 'Easypaisa',
  enabled: (s) => Boolean(s.easypaisa?.enabled),
  instructions: () => 'You’ll be taken to Easypaisa to pay securely, then brought back here.',
  async start(order, s, { returnUrl }) {
    const c = s.easypaisa
    if (!c?.storeId || !c.hashKey) throw new Error('Easypaisa is not configured')
    const fields: Record<string, string> = {
      amount: (order.total ?? 0).toFixed(1),
      autoRedirect: '1',
      emailAddr: order.email ?? '',
      expiryDate: d(new Date(Date.now() + 2 * 3600 * 1000)),
      mobileNum: (order.phone ?? '').replace(/\D/g, ''),
      orderRefNum: order.orderNumber ?? '',
      paymentMethod: 'MA_PAYMENT_METHOD',
      postBackURL: returnUrl,
      storeId: c.storeId,
    }
    fields.merchantHashedReq = easypaisaHash(fields, c.hashKey)
    const action = c.sandbox ? 'https://easypaystg.easypaisa.com.pk/easypay/Index.jsf' : 'https://easypay.easypaisa.com.pk/easypay/Index.jsf'
    return { kind: 'form', action, fields }
  },
  async verify(params) {
    return { orderNumber: params.orderRefNumber ?? params.orderRefNum ?? '', paid: params.status === '0000', reference: params.transactionRefNumber }
  },
}

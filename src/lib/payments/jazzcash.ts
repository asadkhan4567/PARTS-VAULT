import { createHmac } from 'crypto'

import type { PaymentAdapter } from './index'

const pad = (n: number) => String(n).padStart(2, '0')
/** yyyyMMddHHmmss in Pakistan time. */
function pkStamp(d: Date): string {
  const p = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }))
  return `${p.getFullYear()}${pad(p.getMonth() + 1)}${pad(p.getDate())}${pad(p.getHours())}${pad(p.getMinutes())}${pad(p.getSeconds())}`
}

/**
 * JazzCash secure hash: non-empty pp_* fields sorted by name, values joined with "&",
 * prefixed with the integrity salt, HMAC-SHA256 keyed by the salt, uppercase hex.
 */
export function jazzcashHash(fields: Record<string, string>, salt: string): string {
  const values = Object.keys(fields)
    .filter((k) => k.startsWith('pp_') && k !== 'pp_SecureHash' && fields[k] !== '')
    .sort()
    .map((k) => fields[k])
  return createHmac('sha256', salt).update([salt, ...values].join('&')).digest('hex').toUpperCase()
}

export const jazzcash: PaymentAdapter = {
  id: 'jazzcash',
  label: 'JazzCash (wallet or card)',
  enabled: (s) => Boolean(s.jazzcash?.enabled),
  instructions: () => 'You’ll be taken to JazzCash to pay securely, then brought back here.',
  async start(order, s, { returnUrl }) {
    const c = s.jazzcash
    if (!c?.merchantId || !c.password || !c.integritySalt) throw new Error('JazzCash is not configured')
    const now = new Date()
    const fields: Record<string, string> = {
      pp_Version: '1.1',
      pp_TxnType: '',
      pp_Language: 'EN',
      pp_MerchantID: c.merchantId,
      pp_SubMerchantID: '',
      pp_Password: c.password,
      pp_BankID: '',
      pp_ProductID: '',
      pp_TxnRefNo: `T${pkStamp(now)}${String(order.id).slice(-4)}`,
      pp_Amount: String(Math.round((order.total ?? 0) * 100)),
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: pkStamp(now),
      pp_BillReference: order.orderNumber ?? '',
      pp_Description: `Partsyaar order ${order.orderNumber}`,
      pp_TxnExpiryDateTime: pkStamp(new Date(now.getTime() + 2 * 3600 * 1000)),
      pp_ReturnURL: returnUrl,
      ppmpf_1: order.orderNumber ?? '',
    }
    fields.pp_SecureHash = jazzcashHash(fields, c.integritySalt)
    const action = c.sandbox
      ? 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/'
      : 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/'
    return { kind: 'form', action, fields }
  },
  async verify(params, s) {
    const salt = s.jazzcash?.integritySalt ?? ''
    const ok = Boolean(salt) && params.pp_SecureHash?.toUpperCase() === jazzcashHash(params, salt)
    return { orderNumber: params.pp_BillReference ?? params.ppmpf_1 ?? '', paid: ok && params.pp_ResponseCode === '000', reference: params.pp_TxnRefNo }
  },
}

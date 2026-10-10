import { createDecipheriv } from 'crypto'
import { describe, expect, it } from 'vitest'

import { easypaisaHash } from '@/lib/payments/easypaisa'
import { jazzcash, jazzcashHash } from '@/lib/payments/jazzcash'

describe('JazzCash', () => {
  it('hashes sorted non-empty pp_ fields with the salt', () => {
    // Reference: HMAC-SHA256(salt, "salt&1.1&100&EN&MID") — sorted keys: Amount, Language, MerchantID, Version
    const h = jazzcashHash({ pp_Version: '1.1', pp_Language: 'EN', pp_MerchantID: 'MID', pp_Amount: '100', pp_TxnType: '', ppmpf_1: 'ignored' }, 'salt')
    expect(h).toMatch(/^[0-9A-F]{64}$/)
    expect(h).toBe(jazzcashHash({ pp_Amount: '100', pp_MerchantID: 'MID', pp_Language: 'EN', pp_Version: '1.1' }, 'salt'))
  })

  it('verifies a genuine callback and rejects a tampered one', async () => {
    const settings = { jazzcash: { integritySalt: 'salt' } } as never
    const params: Record<string, string> = { pp_ResponseCode: '000', pp_BillReference: 'PY-100001', pp_Amount: '842500', pp_TxnRefNo: 'T1' }
    params.pp_SecureHash = jazzcashHash(params, 'salt')
    expect(await jazzcash.verify!(params, settings)).toMatchObject({ orderNumber: 'PY-100001', paid: true })
    expect(await jazzcash.verify!({ ...params, pp_Amount: '100' }, settings)).toMatchObject({ paid: false })
  })
})

describe('Easypaisa', () => {
  it('encrypts the sorted request with the hash key', () => {
    const key = '0123456789ABCDEF'
    const enc = easypaisaHash({ storeId: '1', amount: '10.0', orderRefNum: 'PY-1' }, key)
    const d = createDecipheriv('aes-128-ecb', Buffer.from(key), null)
    const plain = Buffer.concat([d.update(Buffer.from(enc, 'base64')), d.final()]).toString()
    expect(plain).toBe('amount=10.0&orderRefNum=PY-1&storeId=1')
  })
})

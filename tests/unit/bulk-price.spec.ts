import { describe, expect, it } from 'vitest'

import { applyChange } from '@/lib/admin/bulk-price'

describe('applyChange', () => {
  it('raises and cuts by percent with rounding', () => {
    expect(applyChange(8425, { field: 'price', mode: 'increase_percent', amount: 10, roundTo: 5 })).toBe(9270)
    expect(applyChange(8425, { field: 'price', mode: 'decrease_percent', amount: 10, roundTo: 10 })).toBe(7580)
  })
  it('handles fixed amounts and never goes negative', () => {
    expect(applyChange(1000, { field: 'price', mode: 'increase_fixed', amount: 250 })).toBe(1250)
    expect(applyChange(100, { field: 'price', mode: 'decrease_fixed', amount: 500 })).toBe(0)
  })
  it('sets an exact price', () => expect(applyChange(null, { field: 'compareAtPrice', mode: 'set', amount: 999 })).toBe(999))
})

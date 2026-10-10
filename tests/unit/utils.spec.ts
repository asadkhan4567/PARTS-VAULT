import { describe, expect, it } from 'vitest'

import { formatPrice, slugify } from '@/lib/utils'

describe('formatPrice', () => {
  it('formats rupees with thousands separators and no decimals', () => {
    expect(formatPrice(8425)).toBe('Rs 8,425')
    expect(formatPrice(1250000)).toBe('Rs 1,250,000')
    expect(formatPrice(99.6)).toBe('Rs 100')
  })
})

describe('slugify', () => {
  it('builds URL-safe slugs', () => {
    expect(slugify('Mercedes-Benz')).toBe('mercedes-benz')
    expect(slugify('Oils & Fluids')).toBe('oils-and-fluids')
    expect(slugify('  Corolla [14–22] ')).toBe('corolla-14-22')
  })
})

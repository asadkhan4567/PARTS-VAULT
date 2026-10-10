import { describe, expect, it } from 'vitest'

import { deliveryFee, freeDeliveryProgress, msUntilCutoff, parseCutoff } from '@/lib/delivery'
import { fitsVehicle } from '@/lib/fitment'
import { priceFor, savings, stockState } from '@/lib/product'
import { compactPartNumber, normalizeQuery } from '@/lib/search'
import { generationsForYear, parseVehicle, serializeVehicle, yearsForModel, type Vehicle } from '@/lib/vehicle'
import { normalizePkPhone, whatsappLink } from '@/lib/whatsapp'

const corolla2018: Vehicle = {
  makeId: 1,
  makeName: 'Toyota',
  makeSlug: 'toyota',
  modelName: 'Corolla',
  modelSlug: 'corolla',
  generationId: 11,
  generationLabel: 'Toyota Corolla 2014–2022',
  year: 2018,
}

describe('fitsVehicle', () => {
  const product = {
    fitments: [{ make: { id: 1, name: 'Toyota' }, model: { id: 11, name: 'Corolla' }, yearFrom: 2014, yearTo: 2022 }],
  }
  it('is unknown without a vehicle', () => expect(fitsVehicle(product, null)).toBeNull())
  it('matches make, model and year', () => expect(fitsVehicle(product, corolla2018)).toBe(true))
  it('rejects years outside the range', () => expect(fitsVehicle(product, { ...corolla2018, year: 2012 })).toBe(false))
  it('rejects other makes', () => expect(fitsVehicle(product, { ...corolla2018, makeId: 2 })).toBe(false))
  it('matches by model name across generations', () => {
    const p = { fitments: [{ make: 1, model: { id: 99, name: 'corolla' }, yearFrom: 2009, yearTo: null }] }
    expect(fitsVehicle(p, corolla2018)).toBe(true)
  })
  it('treats universal parts as fitting', () => expect(fitsVehicle({ universalFit: true }, corolla2018)).toBe(true))
})

describe('search normalisation', () => {
  it('handles Roman Urdu and misspellings', () => {
    expect(normalizeQuery('brake ki pads')).toEqual(['brake', 'pads'])
    expect(normalizeQuery('Corola ki batri')).toEqual(['corolla', 'battery'])
    expect(normalizeQuery('break pad')).toEqual(['brake', 'pads'])
  })
  it('compacts part numbers', () => expect(compactPartNumber('04465-02220')).toBe('0446502220'))
})

describe('vehicle years', () => {
  const civic = [
    { from: 2008, to: 2012 },
    { from: 2012, to: 2015 },
  ]
  it('lists every year newest first', () => expect(yearsForModel(civic)).toEqual([2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008]))
  it('returns both generations at a changeover year', () => expect(generationsForYear(civic, 2012)).toHaveLength(2))
  it('round-trips the cookie', () => expect(parseVehicle(serializeVehicle(corolla2018))).toEqual(corolla2018))
  it('ignores a malformed cookie', () => expect(parseVehicle('%7Bbad')).toBeNull())
})

describe('delivery', () => {
  const config = { freeDeliveryThreshold: 10000, defaultFee: 350, zones: [{ city: 'Lahore', fee: 200, eta: 'Today', sameDay: true }] }
  it('uses the city fee', () => expect(deliveryFee(config, 'lahore', 5000)).toBe(200))
  it('falls back to the default fee', () => expect(deliveryFee(config, 'Quetta', 5000)).toBe(350))
  it('is free above the threshold', () => expect(deliveryFee(config, 'Lahore', 12000)).toBe(0))
  it('shows progress to free delivery', () => expect(freeDeliveryProgress(config, 8425)).toEqual({ threshold: 10000, remaining: 1575, percent: 84 }))
  it('parses the cutoff', () => expect(parseCutoff('17:30')).toBe(1050))
  it('counts down in Pakistan time', () => {
    // 10:00 UTC = 15:00 PKT → two hours to a 17:00 cutoff
    expect(msUntilCutoff('17:00', new Date('2026-01-01T10:00:00Z'))).toBe(2 * 3600 * 1000)
    expect(msUntilCutoff('17:00', new Date('2026-01-01T13:00:00Z'))).toBe(0)
  })
})

describe('pricing & stock', () => {
  it('gives workshops the B2B price', () => {
    expect(priceFor({ price: 1000, workshopPrice: 900 }, { type: 'workshop' })).toBe(900)
    expect(priceFor({ price: 1000, workshopPrice: 900 }, { type: 'retail' })).toBe(1000)
    expect(priceFor({ price: 1000, workshopPrice: 900 }, null)).toBe(1000)
  })
  it('computes savings', () => expect(savings(8425, 9200)).toBe(775))
  it('flags low stock', () => {
    expect(stockState({ stock: 0, lowStockThreshold: 3 })).toBe('out')
    expect(stockState({ stock: 2, lowStockThreshold: 3 })).toBe('low')
    expect(stockState({ stock: 20, lowStockThreshold: 3 })).toBe('in')
  })
})

describe('phone + WhatsApp', () => {
  it('normalises Pakistani mobiles', () => {
    expect(normalizePkPhone('03001234567')).toBe('0300-1234567')
    expect(normalizePkPhone('+92 300 1234567')).toBe('0300-1234567')
    expect(normalizePkPhone('12345')).toBeNull()
  })
  it('builds wa.me links', () => expect(whatsappLink('+92 300-1234567', 'hi there')).toBe('https://wa.me/923001234567?text=hi%20there'))
})

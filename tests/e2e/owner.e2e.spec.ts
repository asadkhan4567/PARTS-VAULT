import { expect, test, type Page } from '@playwright/test'

import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'

/**
 * Brief §8 acceptance: a non-technical owner can do each of these in the admin, without code.
 * Each test also checks the result on the live website, then restores the seed data.
 */
test.describe.configure({ mode: 'serial' })

const API = 'http://localhost:3000/api'
let token = ''

async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}`, ...(init.headers ?? {}) } })
  return res.json()
}

/** Pick an option in a Payload select / relationship field (react-select). */
async function choose(page: Page, fieldId: string, option: string, search?: string) {
  const field = page.locator(`#${fieldId}`)
  await field.locator('.rs__control').click()
  if (search) await page.keyboard.type(search)
  await page.locator('.rs__option', { hasText: option }).first().click()
}

async function save(page: Page, label: RegExp = /^(Publish changes|Save)$/) {
  await page.getByRole('button', { name: label }).first().click()
  await expect(page.locator('.payload-toast-container')).toContainText(/success|saved|published|updated/i, { timeout: 15000 })
}

test.beforeAll(async () => {
  await seedTestUser()
  const res = await fetch(`${API}/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(testUser) })
  token = (await res.json()).token
})
test.afterAll(cleanupTestUser)

test.beforeEach(async ({ page }) => {
  await login({ page, user: testUser })
})

test('1. change a product price', async ({ page }) => {
  const { docs } = await api('/products?where[oemNumber][equals]=PY-CARE-01&depth=0')
  const product = docs[0]
  await page.goto(`/admin/collections/products/${product.id}`)
  await page.locator('#field-price').fill('1777')
  await save(page)
  await page.goto(`/product/${product.slug}`)
  await expect(page.getByTestId('product-page-price')).toHaveText('Rs 1,777')
  await api(`/products/${product.id}`, { method: 'PATCH', body: JSON.stringify({ price: product.price }) })
})

test('2. add a new product with fitment and an image', async ({ page }) => {
  const sku = `E2E-${Date.now()}`
  await page.goto('/admin/collections/products/create')
  await page.locator('#field-title').fill(`E2E Cabin Filter – Toyota Corolla [14–22] – ${sku} – Denso`)
  await page.locator('#field-price').fill('2100')
  await page.locator('#field-stock').fill('7')
  await page.locator('#field-sku').fill(sku)

  await page.getByRole('button', { name: 'Details', exact: true }).click()
  await page.locator('#field-images').getByRole('button', { name: /choose from existing/i }).click()
  await page.locator('.list-drawer table tbody tr').first().locator('button, a').first().click()
  await choose(page, 'field-partBrand', 'Denso', 'Denso')
  await choose(page, 'field-categories', 'Cabin AC Filters', 'Cabin')

  await page.getByRole('button', { name: 'Fitment', exact: true }).click()
  await page.getByRole('button', { name: /add vehicle/i }).click()
  await choose(page, 'field-fitments__0__make', 'Toyota', 'Toyota')
  await choose(page, 'field-fitments__0__model', 'Corolla 2014', 'Corolla')
  await page.locator('#field-fitments__0__yearFrom').fill('2014')
  await page.locator('#field-fitments__0__yearTo').fill('2022')

  await save(page, /^Publish changes$/)
  const { docs } = await api(`/products?where[sku][equals]=${sku}&depth=1`)
  expect(docs[0].images.length).toBe(1)
  expect(docs[0].fitments[0].yearFrom).toBe(2014)
  await page.goto(`/product/${docs[0].slug}`)
  await expect(page.locator('h1')).toContainText('E2E Cabin Filter')
  await api(`/products/${docs[0].id}`, { method: 'DELETE' })
})

test('3. change the WhatsApp number site-wide', async ({ page }) => {
  const before = await api('/globals/site-settings?depth=0')
  await page.goto('/admin/globals/site-settings')
  await page.getByRole('button', { name: 'Contact', exact: true }).click()
  await page.locator('#field-whatsapp').fill('923219998877')
  await save(page, /^Save$/)
  await page.goto('/contact')
  await expect(page.getByTestId('contact-whatsapp')).toHaveText('+923219998877')
  await expect(page.getByTestId('whatsapp-float')).toHaveAttribute('href', /wa\.me\/923219998877/)
  await api('/globals/site-settings', { method: 'POST', body: JSON.stringify({ whatsapp: before.whatsapp }) })
})

test('4. edit About Us', async ({ page }) => {
  const { docs } = await api('/pages?where[slug][equals]=about-us&depth=0')
  const pageDoc = docs[0]
  await page.goto(`/admin/collections/pages/${pageDoc.id}`)
  await page.locator('#field-intro').fill('Family-run since 2009 — genuine parts you can trust.')
  await save(page)
  await page.goto('/about-us')
  await expect(page.getByText('Family-run since 2009')).toBeVisible()
  await api(`/pages/${pageDoc.id}`, { method: 'PATCH', body: JSON.stringify({ intro: pageDoc.intro }) })
})

test('5. add a homepage banner', async ({ page }) => {
  const headline = `E2E Eid sale ${Date.now()}`
  await page.goto('/admin/collections/banners/create')
  await page.locator('#field-title').fill('E2E Eid banner')
  await choose(page, 'field-placement', 'Homepage — promo')
  await page.locator('#field-headline').fill(headline)
  await page.locator('#field-ctaText').fill('Shop the sale')
  await page.locator('#field-ctaLink').fill('/search?sale=1')
  await page.locator('#field-order').fill('-1')
  await save(page, /^Save$/)
  await page.goto('/')
  await expect(page.getByText(headline)).toBeVisible()
  const { docs } = await api(`/banners?where[title][equals]=E2E Eid banner&depth=0`)
  for (const b of docs) await api(`/banners/${b.id}`, { method: 'DELETE' })
})

test('6. mark an order Delivered', async ({ page }) => {
  const phone = '0300-5550001'
  const created = await api('/orders', {
    method: 'POST',
    body: JSON.stringify({ customerName: 'Acceptance Test', phone, city: 'Lahore', address: 'Test street 1', paymentMethod: 'cod', status: 'pending', paymentStatus: 'unpaid', items: [{ title: 'Test part', unitPrice: 1000, quantity: 1 }] }),
  })
  const order = created.doc
  await page.goto(`/admin/collections/orders/${order.id}`)
  await choose(page, 'field-status', 'Delivered')
  await save(page, /^Save$/)
  await page.goto(`/track?order=${order.orderNumber}`)
  await page.getByTestId('track-phone').fill(phone)
  await page.getByRole('button', { name: 'Track' }).click()
  await expect(page.getByTestId('track-result')).toContainText('Delivered')
  await api(`/orders/${order.id}`, { method: 'DELETE' })
})

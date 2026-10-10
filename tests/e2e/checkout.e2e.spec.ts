import { expect, test } from '@playwright/test'

const PRODUCT = '/product/front-brake-pads-toyota-corolla-14-22-04465-02220-hitachi'

test('guest checkout with COD, confirmation and tracking', async ({ page }) => {
  const phone = `0333${String(Date.now()).slice(-7)}`
  await page.goto(PRODUCT)
  await page.getByTestId('add-to-cart').first().click()
  await expect(page.getByTestId('cart-count').first()).toHaveText('1')
  await page.goto('/checkout')
  await page.fill('input[name=phone]', phone)
  await page.fill('input[name=name]', 'E2E Shopper')
  await page.fill('textarea[name=address]', 'House 1, Street 1, DHA Phase 5')
  await page.getByTestId('pay-cod').check()
  await expect(page.getByTestId('order-total')).toContainText('Rs')
  await page.getByTestId('place-order').click()
  await page.waitForURL(/\/order\/PY-\d+/)
  const orderNumber = (await page.getByTestId('order-number').innerText()).trim()
  expect(orderNumber).toMatch(/^PY-\d{6}$/)
  await expect(page.getByTestId('cart-count')).toHaveCount(0)

  await page.goto(`/track?order=${orderNumber}`)
  await page.getByTestId('track-phone').fill(phone)
  await page.getByRole('button', { name: 'Track' }).click()
  await expect(page.getByTestId('track-result')).toContainText('Pending')
})

test('checkout validates the phone number', async ({ page }) => {
  await page.goto(PRODUCT)
  await page.getByTestId('add-to-cart').first().click()
  await page.goto('/checkout')
  await page.fill('input[name=phone]', '12345')
  await page.getByTestId('place-order').click()
  await expect(page.getByText('Enter a mobile number like 0300-1234567')).toBeVisible()
})

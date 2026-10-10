import { expect, test } from '@playwright/test'

/** Storefront journeys against the seeded catalogue (`pnpm seed`). */
test.describe('Storefront', () => {
  test('home renders CMS sections and never disables pinch-zoom', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Partsyaar/)
    await expect(page.locator('h1').first()).toContainText('Genuine Parts.')
    await expect(page.getByTestId('vehicle-finder').first()).toBeVisible()
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).not.toMatch(/user-scalable=no|maximum-scale=1(?!\d)/)
  })

  test('vehicle finder sets the car and product pages show "Fits"', async ({ page }) => {
    await page.goto('/product/front-brake-pads-toyota-corolla-14-22-04465-02220-hitachi')
    await page.getByRole('button', { name: 'Check fitment' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: /^Toyota$/ }).click()
    await dialog.getByRole('button', { name: 'Corolla', exact: true }).click()
    await dialog.getByRole('button', { name: '2018', exact: true }).click()
    await expect(page.getByTestId('fit-check').getByTestId('fit-yes')).toBeVisible()
    await expect(page.getByTestId('vehicle-selector')).toContainText('Corolla 2018')

    await page.goto('/search?q=civic+brake+pads')
    await expect(page.getByTestId('product-card').first().getByTestId('fit-no')).toBeVisible()
  })

  test('search understands Roman Urdu and part numbers', async ({ page }) => {
    await page.goto('/search?q=brake+ki+pads')
    await expect(page.getByTestId('product-card').first()).toBeVisible()
    await page.goto('/search?q=0446502220')
    await expect(page.getByTestId('product-card')).toHaveCount(1)
    await expect(page.getByTestId('product-card')).toContainText('04465-02220')
  })

  test('live suggestions appear while typing', async ({ page }) => {
    await page.goto('/')
    const input = page.getByTestId('search-input').first()
    await input.fill('spark plug')
    await expect(page.getByRole('option').first()).toContainText(/Spark Plugs/i)
  })

  test('add to cart updates the badge and drawer', async ({ page }) => {
    await page.goto('/category/oil-filters')
    await page.getByTestId('add-to-cart').first().click()
    await expect(page.getByTestId('cart-count').first()).toHaveText('1')
    await expect(page.getByTestId('cart-subtotal')).toContainText('Rs')
    await expect(page.getByTestId('free-delivery')).toBeVisible()
  })

  test('CMS pages render from the admin content', async ({ page }) => {
    await page.goto('/about-us')
    await expect(page.getByTestId('page-title')).toHaveText('About Us')
    await page.goto('/faq')
    await expect(page.locator('details').first()).toBeVisible()
  })

  test('unknown pages return a branded 404', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist')
    expect(res?.status()).toBe(404)
    await expect(page.locator('h1')).toContainText('isn’t in the vault')
  })
})

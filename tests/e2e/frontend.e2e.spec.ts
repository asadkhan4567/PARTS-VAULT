import { expect, test } from '@playwright/test'

test.describe('Storefront', () => {
  test('home page renders the Partsyaar brand', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Partsyaar\.com/)
    await expect(page.locator('h1').first()).toContainText('Genuine Parts.')
    await expect(page.getByRole('img', { name: 'Partsyaar.com' }).first()).toBeVisible()
  })

  test('pinch-zoom is never disabled', async ({ page }) => {
    await page.goto('/')
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).not.toMatch(/user-scalable=no|maximum-scale=1(?!\d)/)
  })
})

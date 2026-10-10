import { expect, test } from '@playwright/test'

test.describe('motion', () => {
  test.describe('with motion allowed', () => {
    test.use({ contextOptions: { reducedMotion: 'no-preference' } })

    test('vault preloader shows once per session and clears within 1.5s', async ({ page }) => {
      await page.goto('/', { waitUntil: 'commit' })
      await expect(page.locator('.py-preloader')).toBeVisible()
      await page.waitForTimeout(1600)
      await expect(page.locator('.py-preloader')).toBeHidden()
      await page.reload()
      await expect(page.locator('html')).not.toHaveClass(/py-preload/)
    })
  })

  test('reduced motion: no preloader, no 3D canvas', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).not.toHaveClass(/py-preload/)
    await page.waitForTimeout(800)
    await expect(page.locator('[data-hero] canvas')).toHaveCount(0)
  })
})

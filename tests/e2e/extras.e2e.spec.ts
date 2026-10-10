import { expect, test } from '@playwright/test'

test('Urdu toggle switches to right-to-left and back', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('lang-toggle').click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByTestId('search-input').first()).toHaveAttribute('placeholder', /تلاش/)
  await page.getByTestId('lang-toggle').click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
})

test('a shopper can submit a review for approval', async ({ page }) => {
  await page.goto('/product/front-brake-pads-toyota-corolla-14-22-04465-02220-hitachi')
  await page.getByRole('tab', { name: /Reviews/ }).click()
  await page.getByTestId('write-review').click()
  await page.getByRole('radio', { name: '5 stars' }).click()
  await page.fill('input[name=title]', 'Great pads')
  await page.fill('textarea[name=text]', 'Fitted perfectly on my 2018 Corolla, very quiet.')
  await page.fill('input[name=name]', 'E2E Reviewer')
  await page.getByRole('button', { name: 'Submit review' }).click()
  await expect(page.getByText('will appear after a quick check')).toBeVisible()
})

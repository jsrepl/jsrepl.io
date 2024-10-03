import { expect, test } from '@playwright/test'

test('terms page', async ({ page }) => {
  await page.goto('/terms')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms and Conditions')
})

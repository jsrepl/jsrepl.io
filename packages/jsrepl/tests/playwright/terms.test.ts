import { expect, test } from '@nuxt/test-utils/playwright'

test('terms page', async ({ page, goto }) => {
  await goto('/terms', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms and Conditions')
})

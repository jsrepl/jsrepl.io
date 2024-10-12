import { expect, test } from '@playwright/test'
import dedent from 'string-dedent'
import { visitPlayground } from './utils'

test('preview', async ({ page }) => {
  await visitPlayground(page, {
    activeModel: '/test.ts',
    showPreview: true,
    models: new Map([
      [
        '/test.ts',
        {
          path: '/test.ts',
          content: dedent`
              const now = new Date('2024');
              const foo = document.querySelector('.foo');
              foo.innerHTML = now.toISOString();
            `,
        },
      ],
      [
        '/index.html',
        {
          path: '/index.html',
          content: dedent`
              <div class="foo">lorem ipsum <span>dolor sit amet</span></div>
              <script type="module" src="/test.ts"></script>
            `,
        },
      ],
    ]),
  })

  const frame = page.frameLocator('iframe').frameLocator('.preview.active')
  await expect(frame.getByText('2024-01-01T00:00:00.000Z', { exact: true })).toBeVisible()
})

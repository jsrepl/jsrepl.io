import { expect, test } from '@playwright/test'
import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import { visitPlayground } from './utils'

test('preview', async ({ page }) => {
  await visitPlayground(page, {
    opened_models: ['/test.ts'],
    active_model: '/test.ts',
    show_preview: true,
    fs: {
      root: {
        kind: ReplFS.Kind.Directory,
        children: {
          'test.ts': {
            kind: ReplFS.Kind.File,
            content: dedent`
              const now = new Date('2024');
              const foo = document.querySelector('.foo');
              foo.innerHTML = now.toISOString();
            `,
          },
          'index.html': {
            kind: ReplFS.Kind.File,
            content: dedent`
              <div class="foo">lorem ipsum <span>dolor sit amet</span></div>
              <script type="module" src="/test.ts"></script>
            `,
          },
        },
      },
    },
  })

  const frame = page.frameLocator('iframe').frameLocator('.preview.active')
  await expect(frame.getByText('2024-01-01T00:00:00.000Z', { exact: true })).toBeVisible()
})

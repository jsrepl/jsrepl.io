import { expect, test } from '@nuxt/test-utils/playwright'
import dedent from 'string-dedent'
import { visitPlayground } from './utils'

test('preview', async ({ page, goto }) => {
  await visitPlayground(goto, {
    activeModel: 'file:///index.tsx',
    showPreview: true,
    models: new Map([
      [
        'file:///index.tsx',
        {
          uri: 'file:///index.tsx',
          content: dedent`
            const now = new Date('2024');
            const foo = document.querySelector('.foo');
            foo.innerHTML = now.toISOString();
          `,
        },
      ],
      [
        'file:///index.html',
        {
          uri: 'file:///index.html',
          content: dedent`
            <div class="foo">lorem ipsum <span>dolor sit amet</span></div>
          `,
        },
      ],
      [
        'file:///index.css',
        {
          uri: 'file:///index.css',
          content: ``,
        },
      ],
    ]),
  })

  const frame = page.frameLocator('iframe').frameLocator('.preview.active')
  await expect(frame.getByText('2024-01-01T00:00:00.000Z', { exact: true })).toBeVisible()
})

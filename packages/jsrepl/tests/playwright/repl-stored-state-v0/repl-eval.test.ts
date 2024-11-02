import { test } from '@playwright/test'
import dedent from 'string-dedent'
import { assertMonacoContentsWithDecors, visitPlaygroundV0 } from '../utils'

test('simple expressions', async ({ page }) => {
  await visitPlaygroundV0(page, {
    activeModel: '/index.tsx',
    showPreview: false,
    models: [
      {
        path: '/index.tsx',
        content: dedent`
          const n = 1;
          const m = n + 2;

          const a = 'foo';
          const b = a + 'bar';

          let now = new Date('2024');
          now.toISOString();
        `,
      },
      {
        path: '/index.html',
        content: ``,
      },
      {
        path: '/index.css',
        content: ``,
      },
    ],
  })

  await assertMonacoContentsWithDecors(
    page,
    dedent`
      import './index.css'

      const n = 1; // → n = 1
      const m = n + 2; // → m = 3

      const a = 'foo'; // → a = "foo"
      const b = a + 'bar'; // → b = "foobar"

      let now = new Date('2024'); // → now = Date("2024-01-01T00:00:00.000Z")
      now.toISOString(); // → "2024-01-01T00:00:00.000Z"
    `
  )
})

import { test } from '@playwright/test'
import dedent from 'string-dedent'
import { assertReplLines, monacoLocator, visitPlaygroundV0 } from '../utils'

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

  const monaco = monacoLocator(page)
  await assertReplLines(monaco, [
    {
      line: 3,
      content: 'const n = 1;',
      decors: ['1'],
    },
    {
      line: 4,
      content: 'const m = n + 2;',
      decors: ['3'],
    },
    {
      line: 6,
      content: "const a = 'foo';",
      decors: ['"foo"'],
    },
    {
      line: 7,
      content: "const b = a + 'bar';",
      decors: ['"foobar"'],
    },
    {
      line: 9,
      content: "let now = new Date('2024');",
      decors: ['Date(2024-01-01T00:00:00.000Z)'],
    },
    {
      line: 10,
      content: 'now.toISOString();',
      decors: ['"2024-01-01T00:00:00.000Z"'],
    },
  ])
})

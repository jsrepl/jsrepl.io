import { test } from '@playwright/test'
import dedent from 'string-dedent'
import { assertReplLines, monacoLocator, visitPlayground } from './utils'

test('simple expressions', async ({ page }) => {
  await visitPlayground(page, {
    activeModel: '/test.ts',
    showPreview: false,
    models: new Map([
      [
        '/test.ts',
        {
          path: '/test.ts',
          content: dedent`
              const n = 1;
              const m = n + 2;

              const a = 'foo';
              const b = a + 'bar';

              let now = new Date('2024');
              now.toISOString();
            `,
        },
      ],
    ]),
  })

  const monaco = monacoLocator(page)
  await assertReplLines(monaco, [
    {
      line: 1,
      content: 'const n = 1;',
      decors: ['1'],
    },
    {
      line: 2,
      content: 'const m = n + 2;',
      decors: ['3'],
    },
    {
      line: 4,
      content: "const a = 'foo';",
      decors: ['"foo"'],
    },
    {
      line: 5,
      content: "const b = a + 'bar';",
      decors: ['"foobar"'],
    },
    {
      line: 7,
      content: "let now = new Date('2024');",
      decors: ['Date(2024-01-01T00:00:00.000Z)'],
    },
    {
      line: 8,
      content: 'now.toISOString();',
      decors: ['"2024-01-01T00:00:00.000Z"'],
    },
  ])
})

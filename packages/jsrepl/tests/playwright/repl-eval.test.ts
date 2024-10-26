import { test } from '@playwright/test'
import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import { assertReplLines, monacoLocator, visitPlayground } from './utils'

test('simple expressions', async ({ page }) => {
  await visitPlayground(page, {
    openedModels: ['/test.ts'],
    activeModel: '/test.ts',
    showPreview: false,
    fs: new ReplFS.FS({
      kind: ReplFS.Kind.Directory,
      children: {
        'test.ts': {
          kind: ReplFS.Kind.File,
          content: dedent`
            const n = 1;
            const m = n + 2;

            const a = 'foo';
            const b = a + 'bar';

            let now = new Date('2024');
            now.toISOString();

            const f2Val = 2;
            const [f1, f2 = f2Val, {x: f3}, [f4 = -1], ...f5] = foo();

            foo()
            ;[window.hhh] = foo();
            window.hadds = foo();
            ({ x: hhh } = foo({x: 1}));
            let h;
            ;[h] = foo()
            // TODO: Handle SequenceExpressions better
            ;[h] = foo(), [h] = foo([9])
            let hhhVar = window.hhh;
            h

            function foo(x) {
              return x ?? [1,, {x: 3}, [4], 5, 6];
            }
          `,
        },
      },
    }),
  })

  const monaco = monacoLocator(page)
  await assertReplLines(monaco, [
    {
      line: 1,
      content: 'const n = 1;',
      decors: ['n = 1'],
    },
    {
      line: 2,
      content: 'const m = n + 2;',
      decors: ['m = 3'],
    },
    {
      line: 4,
      content: "const a = 'foo';",
      decors: ['a = "foo"'],
    },
    {
      line: 5,
      content: "const b = a + 'bar';",
      decors: ['b = "foobar"'],
    },
    {
      line: 7,
      content: "let now = new Date('2024');",
      decors: ['now = Date(2024-01-01T00:00:00.000Z)'],
    },
    {
      line: 8,
      content: 'now.toISOString();',
      decors: ['"2024-01-01T00:00:00.000Z"'],
    },
    {
      line: 11,
      content: 'const [f1, f2 = f2Val, {x: f3}, [f4 = -1], ...f5] = foo();',
      decors: ['f1 = 1, f2 = 2, f3 = 3, f4 = 4, f5 = [5, 6]'],
    },
    {
      line: 13,
      content: 'foo()',
      decors: ['[1, , {x: 3}, [4], 5, 6]'],
    },
    {
      line: 14,
      content: ';[window.hhh] = foo();',
      decors: ['window.hhh = 1'],
    },
    {
      line: 15,
      content: 'window.hadds = foo();',
      decors: ['window.hadds = [1, , {x: 3}, [4], 5, 6]'],
    },
    {
      line: 16,
      content: '({ x: hhh } = foo({x: 1}));',
      decors: ['hhh = 1'],
    },
    {
      line: 17,
      content: 'let h;',
      decors: ['h = undefined'],
    },
    {
      line: 18,
      content: ';[h] = foo()',
      decors: ['h = 1'],
    },
    {
      line: 20,
      content: ';[h] = foo(), [h] = foo([9])',
      // TODO: Handle SequenceExpressions better
      decors: ['[9]'],
    },
    {
      line: 21,
      content: 'let hhhVar = window.hhh;',
      decors: ['hhhVar = 1'],
    },
    {
      line: 22,
      content: 'h',
      decors: ['9'],
    },
  ])
})

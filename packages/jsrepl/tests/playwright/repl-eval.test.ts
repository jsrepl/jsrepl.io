import { test } from '@playwright/test'
import dedent from 'string-dedent'
import * as ReplFS from '@/lib/repl-fs'
import { reactStarter } from '@/lib/repl-stored-state-library'
import { assertMonacoContentsWithDecors, visitPlayground } from './utils'

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

  await assertMonacoContentsWithDecors(
    page,
    dedent`
      const n = 1; // → n = 1
      const m = n + 2; // → m = 3

      const a = 'foo'; // → a = "foo"
      const b = a + 'bar'; // → b = "foobar"

      let now = new Date('2024'); // → now = Date("2024-01-01T00:00:00.000Z")
      now.toISOString(); // → "2024-01-01T00:00:00.000Z"

      const f2Val = 2; // → f2Val = 2
      const [f1, f2 = f2Val, {x: f3}, [f4 = -1], ...f5] = foo(); // → f1 = 1, f2 = 2, f3 = 3, f4 = 4, f5 = [5, 6]

      foo() // → [1, undefined, {…}, Array(1), 5, 6]
      ;[window.hhh] = foo(); // → window.hhh = 1
      window.hadds = foo(); // → window.hadds = [1, undefined, {…}, Array(1), 5, 6]
      ({ x: hhh } = foo({x: 1})); // → hhh = 1
      let h; // → h = undefined
      ;[h] = foo() // → h = 1
      // TODO: Handle SequenceExpressions better
      ;[h] = foo(), [h] = foo([9]) // → [9]
      let hhhVar = window.hhh; // → hhhVar = 1
      h // → 9

      function foo(x) {
        return x ?? [1,, {x: 3}, [4], 5, 6];
      }
    `
  )
})

test.skip('react starter', async ({ page }) => {
  await visitPlayground(page, reactStarter)

  await assertMonacoContentsWithDecors(
    page,
    dedent`
      import './index.css';
      import { createRoot } from 'react-dom/client?dev';
      import { useState } from 'react?dev';

      const root = createRoot(document.getElementById('root')); // → root = ReactDOMRoot {render: ƒ (children), unmount: ƒ}
      root.render(<App />); // → undefined

      function App() {
        const [counter, setCounter] = useState(0); // → counter = 0, setCounter = ƒ dispatchSetState

        return (
          <>
            <h1 className="italic">Hello, world!</h1>
            <p className="space-x-1">
              <button onClick={() => setCounter((x) => x - 1)}>-</button>
              <span>Counter: {counter}</span>
              <button onClick={() => setCounter((x) => x + 1)}>+</button>
            </p>
          </>
        );
      }
    `
  )
})

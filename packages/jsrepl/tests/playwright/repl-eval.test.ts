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

            foo();
            foo(); [window.hhh] = foo();
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

      let now = new Date('2024'); // → now = Date(2024-01-01T00:00:00.000Z)
      now.toISOString(); // → "2024-01-01T00:00:00.000Z"

      const f2Val = 2; // → f2Val = 2
      const [f1, f2 = f2Val, {x: f3}, [f4 = -1], ...f5] = foo(); // → f1 = 1, f2 = 2, f3 = 3, f4 = 4, f5 = [5, 6]

      foo(); // → [1, undefined, {…}, Array(1), 5, 6]
      foo(); [window.hhh] = foo(); // → [1, undefined, {…}, Array(1), 5, 6], window.hhh = 1
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

test('react starter', async ({ page }) => {
  await visitPlayground(page, reactStarter)

  await assertMonacoContentsWithDecors(
    page,
    dedent`
      import './index.css';
      import { createRoot } from 'react-dom/client?dev';
      import { useState } from 'react?dev';

      const root = createRoot(document.getElementById('root')); // → root = ReactDOMRoot {_internalRoot: FiberRootNode, render: ƒ (children), unmount: ƒ ()}
      root.render(<App />); // → undefined

      function App() {
        const [counter, setCounter] = useState(0); // → counter = 0, setCounter = ƒ dispatchSetState()

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

test('stuff', async ({ page }) => {
  await visitPlayground(page, {
    openedModels: ['/test.ts'],
    activeModel: '/test.ts',
    showPreview: false,
    fs: new ReplFS.FS({
      kind: ReplFS.Kind.Directory,
      children: {
        'index.html': {
          kind: ReplFS.Kind.File,
          content: dedent`
            <div class="flex items-center justify-center h-full dark:text-stone-100">
              <time id="clock" class="text-5xl font-bold">xx</time>
            </div>

            <script type="module" src="/test.ts"></script>
          `,
        },
        'test.ts': {
          kind: ReplFS.Kind.File,
          content: dedent`
            let now = new Date('2024-11-05T13:27:00.458Z');
            const str = '\\\\\\t'
            54

            let aa = 23, bb = 213,
            zcxzxc = 777

            aa = 123, bb = 123123;

            aa = 1; bb = 123;

            HTMLTimeElement

            const clock = document.getElementById('clock') as HTMLTimeElement;

            clock.dateTime = now.toISOString();

            const sasd = 'asdasda"asd';
              
            const asdasdads = \`asdasda
            adaas\\\`asdas\\t\\\\d\`;

            const a = { a: 1, b: 2, c: { d: 4 }, e: clock }

            ;({ a: 1, b: 2, c: { d: 4 }, z: 0.1 + 0.2 });

            const b = \`
            asa
            <b>asd</b>
            <script>
              alert(1)                     j dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
            </script>
            aasda


            asdads\`;

            console.log(1,2,3); console.error(1)

            console.log(clock.constructor.name, a, 'asd', a, a);

            const obj = {}
            const arr = [obj]
            arr.push(obj)
            arr.push([obj])
            arr.push(arr)
            arr.push([])
            console.log(arr)
            arr
            console.log(arr)

            ;123

            const inventory = [
              { name: "asparagus", type: "vegetables", quantity: 5 },
              { name: "bananas", type: "fruit", quantity: 0 },
              { name: "goat", type: "meat", quantity: 23 },
              { name: "cherries", type: "fruit", quantity: 5, vv: HTMLTimeElement },
              { name: "fish", type: "meat", quantity: 22, date: new Date() },
            ];

            console.log(inventory)

            class Foo {}

            let foo = new Foo()

            let set = new Set()
            set.add('asd')
            set.add('asdasddas')
            let obj2 = { set }

            let map = new Map()
            map.set('a', 'b')
            map.set({ x: 'xx' }, { f: 2 })
            map.set(1, new Map())
            map.set(new Map(), 5)
            map.set([], [])
            map.set([1], [2])
            map.set('now', now)
            let obj3 = { map, now }
            console.log(map)
          `,
        },
      },
    }),
  })

  await assertMonacoContentsWithDecors(
    page,
    dedent`
      let now = new Date('2024-11-05T13:27:00.458Z'); // → now = Date(2024-11-05T13:27:00.458Z)
      const str = '\\\\\\t' // → str = "\\\\\\t"
      54 // → 54

      let aa = 23, bb = 213, // → aa = 23, bb = 213
      zcxzxc = 777 // → zcxzxc = 777

      aa = 123, bb = 123123; // → 123123

      aa = 1; bb = 123; // → aa = 1, bb = 123

      HTMLTimeElement // → ƒ HTMLTimeElement()

      const clock = document.getElementById('clock') as HTMLTimeElement; // → clock = <time id="clock" class="text-5xl font-bold">…</time>

      clock.dateTime = now.toISOString(); // → clock.dateTime = "2024-11-05T13:27:00.458Z"

      const sasd = 'asdasda"asd'; // → sasd = "asdasda\\"asd"
        
      const asdasdads = \`asdasda // → asdasdads = "asdasda\\nadaas\`asdas\\t\\\\d"
      adaas\\\`asdas\\t\\\\d\`;

      const a = { a: 1, b: 2, c: { d: 4 }, e: clock } // → a = {a: 1, b: 2, c: {…}, e: time#clock.text-5xl.font-bold}

      ;({ a: 1, b: 2, c: { d: 4 }, z: 0.1 + 0.2 }); // → {a: 1, b: 2, c: {…}, z: 0.30000000000000004}

      const b = \` // → b = "\\nasa\\n<b>asd</b>\\n<script>\\n  alert(1)                     j ddddddddddddddddddddddddddddddddd…
      asa
      <b>asd</b>
      <script>
        alert(1)                     j dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
      </script>
      aasda


      asdads\`;

      console.log(1,2,3); console.error(1) // → 1 2 3, 1

      console.log(clock.constructor.name, a, 'asd', a, a); // → "HTMLTimeElement" {a: 1, b: 2, c: {…}, e: time#clock.text-5xl.font-bold} "asd" {a: 1, b: 2, c: {…}, …

      const obj = {} // → obj = {}
      const arr = [obj] // → arr = [{…}]
      arr.push(obj) // → 2
      arr.push([obj]) // → 3
      arr.push(arr) // → 4
      arr.push([]) // → 5
      console.log(arr) // → [ref *1] [{…}, {…}, Array(1), [Circular *1], Array(0)]
      arr // → [ref *1] [{…}, {…}, Array(1), [Circular *1], Array(0)]
      console.log(arr) // → [ref *1] [{…}, {…}, Array(1), [Circular *1], Array(0)]

      ;123 // → 123

      const inventory = [ // → inventory = [{…}, {…}, {…}, {…}, {…}]
        { name: "asparagus", type: "vegetables", quantity: 5 },
        { name: "bananas", type: "fruit", quantity: 0 },
        { name: "goat", type: "meat", quantity: 23 },
        { name: "cherries", type: "fruit", quantity: 5, vv: HTMLTimeElement },
        { name: "fish", type: "meat", quantity: 22, date: new Date() },
      ];

      console.log(inventory) // → [{…}, {…}, {…}, {…}, {…}]

      class Foo {}

      let foo = new Foo() // → foo = Foo {}

      let set = new Set() // → set = Set(0) {}
      set.add('asd') // → Set(1) {"asd"}
      set.add('asdasddas') // → Set(2) {"asd", "asdasddas"}
      let obj2 = { set } // → obj2 = {set: Set(2)}

      let map = new Map() // → map = Map(0) {}
      map.set('a', 'b') // → Map(1) {"a" => "b"}
      map.set({ x: 'xx' }, { f: 2 }) // → Map(2) {"a" => "b", {…} => {…}}
      map.set(1, new Map()) // → Map(3) {"a" => "b", {…} => {…}, 1 => Map(0)}
      map.set(new Map(), 5) // → Map(4) {"a" => "b", {…} => {…}, 1 => Map(0), Map(0) => 5}
      map.set([], []) // → Map(5) {"a" => "b", {…} => {…}, 1 => Map(0), Map(0) => 5, Array(0) => Array(0)}
      map.set([1], [2]) // → Map(6) {"a" => "b", {…} => {…}, 1 => Map(0), Map(0) => 5, Array(0) => Array(0), Array(1) => Array(1)…
      map.set('now', now) // → Map(7) {"a" => "b", {…} => {…}, 1 => Map(0), Map(0) => 5, Array(0) => Array(0), Array(1) => Array(1)…
      let obj3 = { map, now } // → obj3 = {map: Map(7), now: Date(2024-11-05T13:27:00.458Z)}
      console.log(map) // → Map(7) {"a" => "b", {…} => {…}, 1 => Map(0), Map(0) => 5, Array(0) => Array(0), Array(1) => Array(1)…
    `
  )
})

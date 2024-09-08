// @vitest-environment jsdom
import { expect, test } from 'vitest'
import { type ReplPayload, ReplPayloadCustomKind } from '../../jsrepl/types/repl.types'
import { transformPayload } from './payload'
import type { PreviewWindow, ReplRawPayload } from './types'

const payloadCommon = {
  isPromise: false,
  promiseInfo: undefined,
  isError: false,
  ctx: {
    id: -1,
    lineStart: 1,
    lineEnd: 1,
    colStart: 1,
    colEnd: 1,
    source: '',
    kind: 'expression',
  },
} as Omit<ReplRawPayload, 'rawResult'>

const testCases: [string, ReplRawPayload['rawResult'], ReplPayload['result']][] = [
  ['undefined', undefined, undefined],
  ['null', null, null],
  ['empty string', '', ''],
  ['0', 0, 0],
  ['1', 1, 1],
  ['NaN', NaN, NaN],
  ['Date', new Date('2024'), new Date('2024')],
  ['Invalid Date', new Date('qwerty'), new Date('qwerty')],
  [
    '<div>',
    document.createElement('div'),
    {
      __rpck__: ReplPayloadCustomKind.DomNode,
      tagName: 'div',
      attributes: [],
      hasChildNodes: false,
      childElementCount: 0,
      textContent: '',
    },
  ],
  [
    '<div class="foo">lorem ipsum <span>dolor sit amet</span></div>',
    (() => {
      const el = document.createElement('div')
      el.classList.add('foo')
      el.innerHTML = 'lorem ipsum '

      const span = document.createElement('span')
      span.innerHTML = 'dolor sit amet'
      el.appendChild(span)

      return el
    })(),
    {
      __rpck__: ReplPayloadCustomKind.DomNode,
      tagName: 'div',
      attributes: [
        {
          name: 'class',
          value: 'foo',
        },
      ],
      hasChildNodes: true,
      childElementCount: 1,
      textContent: 'lorem ipsum dolor sit amet',
    },
  ],
  [
    'function() {}',
    function () {},
    {
      __rpck__: ReplPayloadCustomKind.Function,
      name: '',
      // Weird whitespaces between curly braces?
      // It seems to only happen in tests due to some vite/vitest/ts code transforms?
      str: 'function() {\n    }',
    },
  ],
  [
    'function foo(bar) { return bar }',
    function foo(bar: unknown) {
      return bar
    },
    {
      __rpck__: ReplPayloadCustomKind.Function,
      name: 'foo',
      // Weird whitespaces between curly braces?
      // It seems to only happen in tests due to some vite/vitest/ts code transforms?
      str: 'function foo(bar) {\n      return bar;\n    }',
    },
  ],
  [
    'Symbol("foo")',
    Symbol('foo'),
    {
      __rpck__: ReplPayloadCustomKind.Symbol,
      str: 'Symbol(foo)',
    },
  ],
  [
    'Symbol.for("foo")',
    Symbol.for('foo'),
    {
      __rpck__: ReplPayloadCustomKind.Symbol,
      str: 'Symbol(foo)',
    },
  ],
  [
    'cyclic refs',
    (() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a: any = { b: 1 }
      a.a = a
      return a
    })(),
    {
      __rpck__: ReplPayloadCustomKind.RawObject,
      constructorName: 'Object',
      props: {
        a: {
          __rpck__: ReplPayloadCustomKind.CyclicRef,
        },
        b: 1,
      },
    },
  ],
  [
    'WeakSet()',
    (() => {
      const ws = new WeakSet()
      ws.add({})
      return ws
    })(),
    {
      __rpck__: ReplPayloadCustomKind.WeakSet,
    },
  ],
  [
    'WeakMap()',
    (() => {
      const wm = new WeakMap()
      wm.set({}, {})
      return wm
    })(),
    {
      __rpck__: ReplPayloadCustomKind.WeakMap,
    },
  ],
  [
    'WeakRef()',
    (() => {
      const wr = new WeakRef({})
      return wr
    })(),
    {
      __rpck__: ReplPayloadCustomKind.WeakRef,
    },
  ],
  ["[1, 2, 3, 'a', 'b', 'c']", [1, 2, 3, 'a', 'b', 'c'], [1, 2, 3, 'a', 'b', 'c']],
  ["[1, 2, 3, ['a', 'b'], 'c']", [1, 2, 3, ['a', 'b'], 'c'], [1, 2, 3, ['a', 'b'], 'c']],
  ['Error', new Error('foo'), new Error('foo')],
  ['ArrayBuffer', new ArrayBuffer(10), new ArrayBuffer(10)],
  [
    'POJO',
    { foo: 'bar' },
    {
      __rpck__: ReplPayloadCustomKind.RawObject,
      constructorName: 'Object',
      props: {
        foo: 'bar',
      },
    },
  ],
  [
    'POJO nested',
    { foo: 'bar', baz: { foo: 'bar' } },
    {
      __rpck__: ReplPayloadCustomKind.RawObject,
      constructorName: 'Object',
      props: {
        foo: 'bar',
        baz: {
          __rpck__: ReplPayloadCustomKind.RawObject,
          constructorName: 'Object',
          props: {
            foo: 'bar',
          },
        },
      },
    },
  ],
]

testCases.forEach(([desc, rawResult, expectedResult]) => {
  test(desc, () => {
    const payload = {
      ...payloadCommon,
      rawResult,
    }

    const transformed = transformPayload(window as PreviewWindow, payload)
    expect(transformed.result).toEqual(expectedResult)
  })
})

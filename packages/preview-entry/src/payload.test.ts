// @vitest-environment jsdom
import {
  MarshalledDomNode,
  MarshalledFunction,
  MarshalledObject,
  MarshalledSymbol,
  MarshalledType,
  MarshalledWeakMap,
  MarshalledWeakRef,
  MarshalledWeakSet,
  type ReplPayload,
  type ReplRawPayload,
} from '@jsrepl/shared-types'
import { expect, test } from 'vitest'
import { transformPayload } from './payload'
import type { PreviewWindow } from './types'

const payloadCommon = {
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
      __meta__: {
        type: MarshalledType.DomNode,
        tagName: 'div',
        constructorName: 'HTMLDivElement',
        attributes: [],
        hasChildNodes: false,
        childElementCount: 0,
        textContent: '',
      },
      serialized: '<div></div>',
    } as MarshalledDomNode,
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
      __meta__: {
        type: MarshalledType.DomNode,
        tagName: 'div',
        constructorName: 'HTMLDivElement',
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
      serialized: '<div class="foo">lorem ipsum <span>dolor sit amet</span></div>',
    } as MarshalledDomNode,
  ],
  [
    'function() {}',
    function () {},
    {
      __meta__: {
        type: MarshalledType.Function,
        name: '',
      },
      // Weird whitespaces between curly braces?
      // It seems to only happen in tests for some reason...
      serialized: 'function() {\n    }',
    } as MarshalledFunction,
  ],
  [
    'function foo(bar) { return bar }',
    function foo(bar: unknown) {
      return bar
    },
    {
      __meta__: {
        type: MarshalledType.Function,
        name: 'foo',
      },
      // Weird whitespaces between curly braces?
      // It seems to only happen in tests for some reason...
      serialized: 'function foo(bar) {\n      return bar;\n    }',
    } as MarshalledFunction,
  ],
  [
    'Symbol("foo")',
    Symbol('foo'),
    {
      __meta__: {
        type: MarshalledType.Symbol,
      },
      serialized: 'Symbol(foo)',
    } as MarshalledSymbol,
  ],
  [
    'Symbol.for("foo")',
    Symbol.for('foo'),
    {
      __meta__: {
        type: MarshalledType.Symbol,
      },
      serialized: 'Symbol(foo)',
    } as MarshalledSymbol,
  ],
  [
    'cyclic refs',
    (() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj: any = { a: 1 }
      obj.b = obj
      return obj
    })(),
    (() => {
      const obj = {
        __meta__: {
          type: MarshalledType.Object,
          constructorName: 'Object',
        },
        a: 1,
      } as MarshalledObject

      obj.b = obj
      return obj
    })(),
  ],
  [
    'WeakSet()',
    (() => {
      const ws = new WeakSet()
      ws.add({})
      return ws
    })(),
    {
      __meta__: {
        type: MarshalledType.WeakSet,
      },
    } as MarshalledWeakSet,
  ],
  [
    'WeakMap()',
    (() => {
      const wm = new WeakMap()
      wm.set({}, {})
      return wm
    })(),
    {
      __meta__: {
        type: MarshalledType.WeakMap,
      },
    } as MarshalledWeakMap,
  ],
  [
    'WeakRef()',
    (() => {
      const wr = new WeakRef({})
      return wr
    })(),
    {
      __meta__: {
        type: MarshalledType.WeakRef,
      },
    } as MarshalledWeakRef,
  ],
  ["[1, 2, 3, 'a', 'b', 'c']", [1, 2, 3, 'a', 'b', 'c'], [1, 2, 3, 'a', 'b', 'c']],
  ["[1, 2, 3, ['a', 'b'], 'c']", [1, 2, 3, ['a', 'b'], 'c'], [1, 2, 3, ['a', 'b'], 'c']],
  ['Error', new Error('foo'), new Error('foo')],
  ['ArrayBuffer', new ArrayBuffer(10), new ArrayBuffer(10)],
  [
    'POJO',
    { foo: 'bar' },
    {
      __meta__: {
        type: MarshalledType.Object,
        constructorName: 'Object',
      },
      foo: 'bar',
    } as MarshalledObject,
  ],
  [
    'POJO nested',
    { foo: 'bar', baz: { foo2: 'bar2' } },
    {
      __meta__: {
        type: MarshalledType.Object,
        constructorName: 'Object',
      },
      foo: 'bar',
      baz: {
        __meta__: {
          type: MarshalledType.Object,
          constructorName: 'Object',
        },
        foo2: 'bar2',
      },
    } as MarshalledObject,
  ],
  [
    // Like `navigator.connection`
    'Object with non-enumerable properties',
    (() => {
      const obj = {}
      Object.defineProperty(obj, 'foo', { value: 'bar', enumerable: false })
      return obj
    })(),
    {
      __meta__: {
        type: MarshalledType.Object,
        constructorName: 'Object',
      },
      foo: 'bar',
    } as MarshalledObject,
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

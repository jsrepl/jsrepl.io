import { MarshalledObject, MarshalledType, ReplPayload } from '@jsrepl/shared-types'
import { describe, expect, test } from 'vitest'
import { type StringifyResult, stringifyResult } from './stringify'

const testCasesTargetDecor: [string, ReplPayload['result'], StringifyResult['value']][] = [
  ['undefined', undefined, 'undefined'],
  ['null', null, 'null'],
  ['empty string', '', '""'],
  ['0', 0, '0'],
  ['1', 1, '1'],
  ['NaN', NaN, 'NaN'],
  ['Date', new Date('2024'), 'Date(2024-01-01T00:00:00.000Z)'],
  ['Invalid Date', new Date('qwerty'), 'Invalid Date'],
  [
    '{}',
    {
      __meta__: {
        type: MarshalledType.Object,
        constructorName: 'Object',
      },
    } as MarshalledObject,
    '{}',
  ],
  ['[]', [], '[]'],
  [
    '{ foo: 1, bar: [1,2,3] }',
    {
      __meta__: {
        type: MarshalledType.Object,
        constructorName: 'Object',
      },
      foo: 1,
      bar: [1, 2, 3],
    } as MarshalledObject,
    '{foo: 1, bar: Array(3)}',
  ],
  [
    'cyclic refs',
    (() => {
      const obj = {
        __meta__: {
          type: MarshalledType.Object,
          constructorName: 'Object',
        },
      } as MarshalledObject
      obj.x = obj
      return obj
    })(),
    '[ref *1] {x: [Circular *1]}',
  ],
]

describe('StringifyResultTarget = decor', () => {
  testCasesTargetDecor.forEach(([desc, result, expectedStringifiedValue]) => {
    test(desc, () => {
      const stringified = stringifyResult(result, 'decor')
      expect(stringified.value).toEqual(expectedStringifiedValue)
    })
  })
})

import {
  ReplPayload,
  ReplPayloadCustomKind,
  type ReplPayloadResultDomNode,
  type ReplPayloadResultFunction,
  type ReplPayloadResultObject,
  type ReplPayloadResultSymbol,
  type ReplPayloadResultWeakMap,
  type ReplPayloadResultWeakRef,
  type ReplPayloadResultWeakSet,
} from '@/types'
import { getBabel } from '../get-babel'

const MAX_NESTING_LEVEL = 20
const MAX_CYCLIC_REF_DEPTH = 10

export type StringifyResult = {
  value: string
  type?: string
  lang?: string | null
  detailsBefore?: StringifyResult
  detailsAfter?: StringifyResult
}

export function stringifyResult(
  result: ReplPayload['result'],
  target: 'decor' | 'details',
  nestingLevel = 0,
  refs: WeakMap<object, { depth?: number }> = new WeakMap()
): StringifyResult {
  if (nestingLevel++ > MAX_NESTING_LEVEL) {
    return { value: '(…)', type: 'unknown', lang: '' }
  }

  // Handle cyclic references
  if (result !== null && typeof result === 'object' && refs.has(result)) {
    const data = refs.get(result)!
    data.depth ??= 0
    if (data.depth++ >= MAX_CYCLIC_REF_DEPTH) {
      return { value: '(⟳ cyclic ref)', type: 'cyclic-ref', lang: '' }
    }
  }

  if (result === undefined) {
    return { value: 'undefined', type: 'keyword', lang: 'js' }
  }

  if (result === null) {
    return { value: 'null', type: 'keyword', lang: 'js' }
  }

  if (Number.isNaN(result)) {
    return { value: 'NaN', type: 'keyword', lang: 'js' }
  }

  if (result === Infinity) {
    return { value: 'Infinity', type: 'keyword', lang: 'js' }
  }

  if (result === -Infinity) {
    return { value: '-Infinity', type: 'keyword', lang: 'js' }
  }

  if (typeof result === 'bigint') {
    return { value: result.toString() + 'n', type: 'number', lang: 'js' }
  }

  if (typeof result === 'number') {
    return { value: result.toString(), type: 'number', lang: 'js' }
  }

  if (typeof result === 'string') {
    if (target === 'decor') {
      return { value: JSON.stringify(result), type: 'string', lang: 'js' }
    }

    return {
      value: result.includes('\n')
        ? '`' + result.replace(/\`/g, '\\`') + '`'
        : '"' + result.replace(/\"/g, '\\"') + '"',
      type: 'string',
      lang: 'js',
    }
  }

  if (typeof result === 'boolean') {
    return { value: result.toString(), type: 'boolean', lang: 'js' }
  }

  if (typeof result === 'symbol') {
    return { value: result.toString(), type: 'symbol', lang: 'js' }
  }

  if (result instanceof Error) {
    return {
      value:
        target === 'details' && result.stack
          ? result.stack.replace(/data:[\S]+/g, (match) => {
              return match.length > 50 ? match.slice(0, 40) + '…' + match.slice(-10) : match
            })
          : `${result.name}: ${result.message}`,
      type: 'error',
      lang: 'plaintext',
    }
  }

  if (result instanceof Set) {
    refs.set(result, {})

    let value: string
    if (target === 'details') {
      const inner = Array.from(result)
        .map(
          (item, index) =>
            '\n' +
            indent(`${index}: `, nestingLevel) +
            stringifyResult(item, target, nestingLevel, refs).value
        )
        .join('')
      value = `Set(${result.size}) `
      value += inner ? `{${inner}\n${indent('}', nestingLevel - 1)}` : '{}'
    } else {
      if (nestingLevel === 1) {
        value = `Set(${result.size}) {${Array.from(result)
          .map((item) => stringifyResult(item, target, nestingLevel, refs).value)
          .join(', ')}}`
      } else {
        value = `Set(${result.size})`
      }
    }

    return {
      value,
      type: 'set',
      lang: 'js',
    }
  }

  if (result instanceof Map) {
    refs.set(result, {})

    let value: string
    if (target === 'details') {
      const inner = Array.from(result)
        .map(([key, value], index) => {
          const keyStr = stringifyResult(key, 'decor', nestingLevel, refs).value
          const valueStr = stringifyResult(value, target, nestingLevel, refs).value
          return '\n' + indent(`${index}: `, nestingLevel) + `{${keyStr} => ${valueStr}}`
        })
        .join('')
      value = `Map(${result.size}) `
      value += inner ? `{${inner}\n${indent('}', nestingLevel - 1)}` : '{}'
    } else {
      if (nestingLevel === 1) {
        value = `Map(${result.size}) {${Array.from(result)
          .map(([key, value]) => {
            const keyStr = stringifyResult(key, 'decor', nestingLevel, refs).value
            const valueStr = stringifyResult(value, target, nestingLevel, refs).value
            return `${keyStr} => ${valueStr}`
          })
          .join(', ')}}`
      } else {
        value = `Map(${result.size})`
      }
    }

    return {
      value,
      type: 'map',
      lang: 'js',
    }
  }

  if (result instanceof Date) {
    return {
      value: `Date('${result.toISOString()}')`,
      type: 'date',
      lang: 'js',
      detailsAfter:
        target === 'details' && nestingLevel === 1
          ? {
              value: result.toString(),
              lang: 'plaintext',
              type: 'date',
            }
          : undefined,
    }
  }

  if (result instanceof ArrayBuffer) {
    return { value: `ArrayBuffer(${result.byteLength})`, type: 'arraybuffer', lang: 'js' }
  }

  if (Array.isArray(result)) {
    refs.set(result, {})

    let value: string
    if (target === 'details') {
      const inner = result
        .map(
          (item, index) =>
            '\n' +
            indent(`${index}: `, nestingLevel) +
            stringifyResult(item, target, nestingLevel, refs).value
        )
        .join('')
      value = nestingLevel === 1 ? `Array(${result.length}) ` : ''
      value += inner ? `[${inner}\n${indent(']', nestingLevel - 1)}` : '[]'
    } else {
      if (nestingLevel === 1) {
        value = `[${result.map((item) => stringifyResult(item, target, nestingLevel, refs).value).join(', ')}]`
      } else {
        value = `Array(${result.length})`
      }
    }

    return {
      value,
      type: 'array',
      lang: 'js',
    }
  }

  if (isDomNode(result)) {
    const meta = result.__meta__

    let value: string
    if (target === 'details') {
      value = nestingLevel === 1 ? result.serialized : stringifyDomNodeLong(result)
    } else {
      value = nestingLevel === 1 ? stringifyDomNodeLong(result) : stringifyDomNodeShort(result)
    }

    return {
      value,
      type: 'dom-node',
      lang: 'html',
      detailsBefore:
        target === 'details' && meta.constructorName
          ? { value: meta.constructorName, type: 'class-name', lang: 'js' }
          : undefined,
    }
  }

  if (isFunction(result)) {
    const meta = result.__meta__
    const isNative = result.serialized.includes('[native code]')

    let value: string
    if (target === 'details' && nestingLevel === 1 && !isNative) {
      value = result.serialized
    } else {
      const parsed = isNative ? null : parseFunction(result.serialized)
      const asyncPart = parsed?.isAsync ? 'async ' : ''
      const fnKeywordPart = target === 'decor' || nestingLevel > 1 ? 'ƒ ' : 'function '
      const fnName = meta.name.replace(/^bound /u, '')
      const fnArgsPart = `(${parsed?.args ?? ''})`
      const fnBodyPart =
        target === 'details' && nestingLevel === 1 && isNative ? ' { [native code] }' : ''
      value = `${asyncPart}${fnKeywordPart}${fnName}${fnArgsPart}${fnBodyPart}`
    }

    // TODO: support class definitions
    return { value, type: 'function', lang: 'js' }
  }

  if (isSymbol(result)) {
    return { value: result.serialized, type: 'symbol', lang: 'js' }
  }

  if (isWeakSet(result)) {
    return { value: 'WeakSet()', type: 'weakset', lang: 'js' }
  }

  if (isWeakMap(result)) {
    return { value: 'WeakMap()', type: 'weakmap', lang: 'js' }
  }

  if (isWeakRef(result)) {
    return { value: 'WeakRef()', type: 'weakref', lang: 'js' }
  }

  if (isObject(result)) {
    refs.set(result, {})
    const { __meta__: meta, ...props } = result

    const propEntries = () =>
      Object.entries(props).map(([key, value]) => {
        const stringified = stringifyResult(value, target, nestingLevel, refs)
        return [key, stringified.value]
      })

    if (target === 'decor') {
      if (nestingLevel === 1) {
        const propsStr = propEntries()
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
        const propsPart = propsStr.length > 0 ? `{${propsStr}}` : '{}'
        return {
          value:
            meta.constructorName && meta.constructorName !== 'Object'
              ? `${meta.constructorName} ${propsPart}`
              : `${propsPart}`,
          type: 'object',
          lang: '',
        }
      } else {
        return {
          value:
            meta.constructorName && meta.constructorName !== 'Object'
              ? `${meta.constructorName}`
              : `{…}`,
          type: 'object',
          lang: '',
        }
      }
    }

    const propsStr = propEntries()
      .map(([key, value]) => indent(`${key}: ${value}`, nestingLevel))
      .join('\n')
    const propsPart =
      propsStr.length > 0 ? `{\n${propsStr}\n${indent('}', nestingLevel - 1)}` : '{}'

    return {
      value:
        meta.constructorName && meta.constructorName !== 'Object'
          ? `${meta.constructorName} ${propsPart}`
          : `${propsPart}`,
      type: 'object',
      lang: '',
    }
  }

  return {
    value: '¯\\_(ツ)_/¯',
    type: 'unknown',
    lang: '',
  }
}

function indent(str: string, level: number): string {
  return '  '.repeat(level) + str
}

// Let babel to parse this madness.
// - function (arg1, arg2) {}
// - async function (arg1, arg2) {}
// - function name(arg1, arg2) {}
// - async function name(arg1, arg2) {}
// - function name(arg1, arg2 = 123, ...args) {}
// - () => {}
// - async () => {}
// - args1 => {}
// - async args1 => {}
// - (args1, args2) => {}
// - async (args1, args2) => {}
// - function ({ jhkhj, asdad = 123 } = {}) {}
// - () => 7
// - function (asd = adsasd({})) { ... }
function parseFunction(
  str: string
): { name: string; args: string; isAsync: boolean; isArrow: boolean } | null {
  const babel = getBabel()[0].value!

  // @ts-expect-error Babel standalone: https://babeljs.io/docs/babel-standalone#internal-packages
  const { parser } = babel.packages as { parser: typeof import('@babel/parser') }

  let ast: ReturnType<typeof parser.parseExpression>

  try {
    // ArrowFunctionExpression | FunctionExpression
    ast = parser.parseExpression(str)
  } catch {
    return null
  }

  if (ast.type === 'ArrowFunctionExpression') {
    return {
      name: '',
      args: ast.params.map((param) => str.slice(param.start!, param.end!)).join(', '),
      isAsync: ast.async,
      isArrow: true,
    }
  }

  if (ast.type === 'FunctionExpression') {
    return {
      name: ast.id?.name ?? '',
      args: ast.params.map((param) => str.slice(param.start!, param.end!)).join(', '),
      isAsync: ast.async,
      isArrow: false,
    }
  }

  return null
}

function stringifyDomNodeShort(result: ReplPayloadResultDomNode): string {
  const meta = result.__meta__
  const idAttr = meta.attributes.find((attr) => attr.name === 'id')
  const classAttr = meta.attributes.find((attr) => attr.name === 'class')
  const idPart = idAttr ? `#${idAttr.value}` : ''
  const classPart = classAttr
    ? classAttr.value
        .split(/\s+/u)
        .map((cls) => `.${cls}`)
        .join('')
    : ''
  return `${meta.tagName}${idPart}${classPart}`
}

function stringifyDomNodeLong(result: ReplPayloadResultDomNode): string {
  const meta = result.__meta__
  const attrsStr = meta.attributes.map((attr) => `${attr.name}="${attr.value}"`).join(' ')

  // https://developer.mozilla.org/en-US/docs/Glossary/Void_element
  const isSelfClosing = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ].includes(meta.tagName)

  const childrenStr = meta.hasChildNodes ? '…' : ''
  const closing = isSelfClosing ? '' : `${childrenStr}</${meta.tagName}>`
  return `<${meta.tagName}${attrsStr.length > 0 ? ' ' + attrsStr : ''}>${closing}`
}

export function isDomNode(result: object): result is ReplPayloadResultDomNode {
  return getMetaType(result) === ReplPayloadCustomKind.DomNode
}

export function isFunction(result: object): result is ReplPayloadResultFunction {
  return getMetaType(result) === ReplPayloadCustomKind.Function
}

export function isSymbol(result: object): result is ReplPayloadResultSymbol {
  return getMetaType(result) === ReplPayloadCustomKind.Symbol
}

export function isWeakSet(result: object): result is ReplPayloadResultWeakSet {
  return getMetaType(result) === ReplPayloadCustomKind.WeakSet
}

export function isWeakMap(result: object): result is ReplPayloadResultWeakMap {
  return getMetaType(result) === ReplPayloadCustomKind.WeakMap
}

export function isWeakRef(result: object): result is ReplPayloadResultWeakRef {
  return getMetaType(result) === ReplPayloadCustomKind.WeakRef
}

export function isObject(result: object): result is ReplPayloadResultObject {
  return getMetaType(result) === ReplPayloadCustomKind.Object
}

function getMetaType(result: object): ReplPayloadCustomKind | null {
  return '__meta__' in result &&
    result.__meta__ !== null &&
    typeof result.__meta__ === 'object' &&
    'type' in result.__meta__ &&
    typeof result.__meta__.type === 'string'
    ? (result.__meta__.type as ReplPayloadCustomKind)
    : null
}

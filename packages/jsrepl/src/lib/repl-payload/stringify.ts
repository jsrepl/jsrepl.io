import { type MarshalledDomNode, type ReplPayload } from '@jsrepl/shared-types'
import { parseFunction } from './parse-function'
import * as utils from './payload-utils'

const MAX_NESTING_LEVEL = 20
const MAX_CYCLIC_REF_DEPTH = 0

export type StringifyResult = {
  value: string
  type?: string
  lang?: string | null
  detailsBefore?: StringifyResult
  detailsAfter?: StringifyResult
}

export type StringifyResultTarget = 'decor' | 'details'

export function stringifyResult(
  result: ReplPayload['result'],
  target: StringifyResultTarget,
  startNestingLevel: number = 0
): StringifyResult {
  return _stringifyResult(result, target, startNestingLevel, {
    map: new WeakMap(),
    nextIndex: 1,
  })
}

function _stringifyResult(
  result: ReplPayload['result'],
  target: StringifyResultTarget,
  nestingLevel: number,
  refs: {
    map: WeakMap<object, { depth: number; index: number; caught: boolean }>
    nextIndex: number
  }
): StringifyResult {
  function putRef(ref: object) {
    const data = refs.map.get(ref)
    if (data) {
      data.depth++
    } else {
      refs.map.set(ref, { depth: 0, index: -1, caught: false })
    }

    return () => {
      refs.map.delete(ref)
    }
  }

  function renderRef(ref: object): string {
    const data = refs.map.get(ref)
    return data?.caught ? `[ref *${data.index}] ` : ''
  }

  function next(
    result: ReplPayload['result'],
    target: StringifyResultTarget,
    customNestingLevel?: number
  ): StringifyResult {
    return _stringifyResult(result, target, customNestingLevel ?? nestingLevel + 1, refs)
  }

  function t(str: string, relativeIndexLevel: number) {
    const level = nestingLevel + relativeIndexLevel
    return '  '.repeat(level) + str
  }

  if (nestingLevel > MAX_NESTING_LEVEL) {
    return { value: '(…)', type: 'unknown', lang: '' }
  }

  // Handle cyclic references
  if (result !== null && typeof result === 'object' && refs.map.has(result)) {
    const data = refs.map.get(result)!
    if (data.depth >= MAX_CYCLIC_REF_DEPTH) {
      data.caught = true
      data.index = refs.nextIndex++
      return { value: `[Circular *${data.index}]`, type: 'circular', lang: '' }
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
        ? '`' + result.replace(/\\/g, '\\\\').replace(/\`/g, '\\`') + '`'
        : JSON.stringify(result),
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
    const releaseRef = putRef(result)

    let value: string
    if (target === 'details') {
      const inner = Array.from(result)
        .map((item, index) => '\n' + t(`${index}: `, 1) + next(item, target).value)
        .join('')
      value = `${renderRef(result)}Set(${result.size})`
      value += inner ? ` {${inner}\n${t('}', 0)}` : ' {}'
    } else {
      if (nestingLevel === 0) {
        const inner = Array.from(result)
          .map((item) => next(item, target).value)
          .join(', ')
        value = `${renderRef(result)}Set(${result.size}) {${inner}}`
      } else {
        value = `Set(${result.size})`
      }
    }

    releaseRef()

    return {
      value,
      type: 'set',
      lang: 'js',
    }
  }

  if (result instanceof Map) {
    const releaseRef = putRef(result)

    let value: string
    if (target === 'details') {
      const inner = Array.from(result)
        .map(([key, value], index) => {
          const keyStr = next(key, 'decor').value
          const valueStr = next(value, target).value
          return '\n' + t(`${index}: `, 1) + `{${keyStr} => ${valueStr}}`
        })
        .join('')
      value = `${renderRef(result)}Map(${result.size})`
      value += inner ? ` {${inner}\n${t('}', 0)}` : ' {}'
    } else {
      if (nestingLevel === 0) {
        const inner = Array.from(result)
          .map(([key, value]) => {
            const keyStr = next(key, 'decor').value
            const valueStr = next(value, target).value
            return `${keyStr} => ${valueStr}`
          })
          .join(', ')
        value = `${renderRef(result)}Map(${result.size}) {${inner}}`
      } else {
        value = `Map(${result.size})`
      }
    }

    releaseRef()

    return {
      value,
      type: 'map',
      lang: 'js',
    }
  }

  if (result instanceof Date) {
    let value: string
    if (target === 'decor') {
      const isValid = !isNaN(result.getTime())
      value = isValid ? `Date(${result.toISOString()})` : 'Invalid Date'
    } else {
      value = result.toString()
    }

    return {
      value,
      type: 'date',
      lang: 'js',
    }
  }

  if (result instanceof ArrayBuffer) {
    return { value: `ArrayBuffer(${result.byteLength})`, type: 'arraybuffer', lang: 'js' }
  }

  if (Array.isArray(result)) {
    const releaseRef = putRef(result)

    let value: string
    if (target === 'details') {
      const inner = result
        .map((item, index) => '\n' + t(`${index}: `, 1) + next(item, target).value)
        .join('')
      value = nestingLevel === 0 ? `${renderRef(result)}Array(${result.length}) ` : ''
      value += inner ? `[${inner}\n${t(']', 0)}` : '[]'
    } else {
      if (nestingLevel === 0) {
        const inner = result.map((item) => next(item, target).value).join(', ')
        value = `${renderRef(result)}[${inner}]`
      } else {
        value = `Array(${result.length})`
      }
    }

    releaseRef()

    return {
      value,
      type: 'array',
      lang: 'js',
    }
  }

  if (utils.isMarshalledDomNode(result)) {
    let value: string
    if (target === 'details') {
      value = nestingLevel === 0 ? result.serialized : stringifyDomNodeLong(result)
    } else {
      value = nestingLevel === 0 ? stringifyDomNodeLong(result) : stringifyDomNodeShort(result)
    }

    return {
      value,
      type: 'dom-node',
      lang: 'jsx',
      // detailsAfter:
      //   target === 'details' && meta.constructorName
      //     ? { value: meta.constructorName, type: 'class-name', lang: 'js' }
      //     : undefined,
    }
  }

  if (utils.isMarshalledFunction(result)) {
    const meta = result.__meta__
    const isNative = result.serialized.includes('[native code]')

    let value: string
    if (target === 'details' && nestingLevel === 0 && !isNative) {
      const parsed = parseFunction(result.serialized)
      value = parsed?.origSource ?? result.serialized
    } else {
      const parsed = isNative ? null : parseFunction(result.serialized)
      const asyncPart = parsed?.isAsync ? 'async ' : ''
      const fnKeywordPart = target === 'decor' || nestingLevel > 0 ? 'ƒ ' : 'function '
      const fnName = meta.name
      const fnArgsPart = `(${parsed?.args ?? ''})`
      const fnBodyPart =
        target === 'details' && nestingLevel === 0 && isNative
          ? [' {', t('[native code]', 1), t('}', 0)].join('\n')
          : ''
      value = `${asyncPart}${fnKeywordPart}${fnName}${fnArgsPart}${fnBodyPart}`
    }

    // TODO: support class definitions
    return { value, type: 'function', lang: 'js' }
  }

  if (utils.isMarshalledSymbol(result)) {
    return { value: result.serialized, type: 'symbol', lang: 'js' }
  }

  if (utils.isMarshalledWeakSet(result)) {
    return { value: 'WeakSet()', type: 'weakset', lang: 'js' }
  }

  if (utils.isMarshalledWeakMap(result)) {
    return { value: 'WeakMap()', type: 'weakmap', lang: 'js' }
  }

  if (utils.isMarshalledWeakRef(result)) {
    return { value: 'WeakRef()', type: 'weakref', lang: 'js' }
  }

  if (utils.isMarshalledPromise(result)) {
    const value =
      target === 'decor'
        ? 'Promise'
        : `Promise {
${t('', 1)}then() { [native code] },
${t('', 1)}catch() { [native code] },
${t('', 1)}finally() { [native code] }
${t('', 0)}}`
    return { value, type: 'promise', lang: 'js' }
  }

  if (utils.isMarshalledProxy(result)) {
    const { target: targetObj, handler } = result.__meta__
    let value: string
    if (target === 'decor') {
      const targetStr = next(targetObj, target, nestingLevel).value
      const handlerStr = next(handler, target).value
      value = `Proxy(${targetStr}) ${handlerStr}`
    } else {
      const targetStr = next(targetObj, target).value
      const handlerStr = next(handler, target).value
      value = `Proxy {
${t('', 1)}[[Target]]: ${targetStr},
${t('', 1)}[[Handler]]: ${handlerStr}
${t('', 0)}}`
    }

    return {
      value,
      type: 'proxy',
      lang: 'js',
    }
  }

  if (utils.isMarshalledObject(result)) {
    const releaseRef = putRef(result)
    const { __meta__: meta, ...props } = result

    const propEntries = () =>
      Object.entries(props).map(([key, value]) => {
        const stringified = next(value, target)
        return [key, stringified.value]
      })

    let value: string

    if (target === 'decor') {
      if (nestingLevel === 0) {
        const propsStr = propEntries()
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
        const propsPart = propsStr.length > 0 ? `{${propsStr}}` : '{}'
        value =
          meta.constructorName && meta.constructorName !== 'Object'
            ? `${renderRef(result)}${meta.constructorName} ${propsPart}`
            : `${renderRef(result)}${propsPart}`
      } else {
        value =
          meta.constructorName && meta.constructorName !== 'Object'
            ? `${meta.constructorName}`
            : Object.keys(props).length > 0
              ? `{…}`
              : '{}'
      }
    } else {
      const propsStr = propEntries()
        .map(([key, value]) => t(`${key}: ${value}`, 1))
        .join('\n')
      const propsPart = propsStr.length > 0 ? `{\n${propsStr}\n${t('}', 0)}` : '{}'
      value =
        meta.constructorName && meta.constructorName !== 'Object'
          ? `${renderRef(result)}${meta.constructorName} ${propsPart}`
          : `${renderRef(result)}${propsPart}`
    }

    releaseRef()

    return {
      value,
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

function stringifyDomNodeShort(result: MarshalledDomNode): string {
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

function stringifyDomNodeLong(result: MarshalledDomNode): string {
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

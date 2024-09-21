import {
  type ReplPayload,
  ReplPayloadCustomKind,
  type ReplPayloadResultCyclicRef,
  type ReplPayloadResultDomNode,
  type ReplPayloadResultFunction,
  type ReplPayloadResultRawObject,
  type ReplPayloadResultSymbol,
  type ReplPayloadResultWeakMap,
  type ReplPayloadResultWeakRef,
  type ReplPayloadResultWeakSet,
} from '@/types/repl.types'
import type * as Babel from '@babel/standalone'

let _babel: typeof Babel | null = null

export function stringifyPayload(payload: ReplPayload, babel: typeof Babel): string | null {
  _babel = babel

  try {
    const str = _stringifyPayload(payload)
    if (str && str.length > 100) {
      return str.slice(0, 100) + '…'
    }

    return str
  } finally {
    _babel = null
  }
}

function _stringifyPayload(payload: ReplPayload): string | null {
  if (payload.isPromise) {
    switch (payload.promiseInfo!.status) {
      case 'pending':
        return 'Promise {<pending>}'
      case 'fulfilled':
        return `Promise {<fulfilled>: ${stringifyResult(payload.result)}}`
      case 'rejected':
        return `Promise {<rejected>: ${stringifyResult(payload.result)}}`
    }
  }

  if (
    ['console-log', 'console-debug', 'console-info', 'console-warn', 'console-error'].includes(
      payload.ctx.kind
    )
  ) {
    const args = payload.result as ReplPayload['result'][]
    return args.map((arg) => stringifyResult(arg)).join(' ')
  }

  return stringifyResult(payload.result)
}

function stringifyResult(result: ReplPayload['result']): string | null {
  if (result === undefined) {
    return 'undefined'
  }

  if (result === null) {
    return 'null'
  }

  if (Number.isNaN(result)) {
    return 'NaN'
  }

  if (result === Infinity) {
    return 'Infinity'
  }

  if (result === -Infinity) {
    return '-Infinity'
  }

  if (typeof result === 'bigint') {
    return result.toString() + 'n'
  }

  if (typeof result === 'number') {
    return result.toString()
  }

  if (typeof result === 'string') {
    return JSON.stringify(result)
  }

  if (typeof result === 'boolean') {
    return result.toString()
  }

  if (typeof result === 'symbol') {
    return result.toString()
  }

  if (result instanceof Error) {
    return result.toString()
  }

  if (result instanceof Set) {
    return `Set(${stringifyResult(Array.from(result))})`
  }

  if (result instanceof Map) {
    return `Map(${stringifyResult(Array.from(result))})`
  }

  if (result instanceof Date) {
    return `Date(${result.toISOString()})`
  }

  if (result instanceof ArrayBuffer) {
    return `ArrayBuffer(${result.byteLength})`
  }

  if (Array.isArray(result)) {
    return `[${result.map((item) => stringifyResult(item)).join(', ')}]`
  }

  if (isDomNode(result)) {
    const attrsStr = result.attributes.map((attr) => `${attr.name}="${attr.value}"`).join(' ')

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
    ].includes(result.tagName)

    const childrenStr = result.hasChildNodes ? '…' : ''
    const closing = isSelfClosing ? '' : `${childrenStr}</${result.tagName}>`
    return `<${result.tagName}${attrsStr.length > 0 ? ' ' + attrsStr : ''}>${closing}`
  }

  if (isFunction(result)) {
    const parsed = parseFunction(result.str)
    const fnArgs = parsed?.args
    const isAsync = parsed?.isAsync

    // TODO: support class definitions
    return `${isAsync ? 'async ' : ''}ƒ ${result.name || ''}(${fnArgs || ''})`
  }

  if (isSymbol(result)) {
    return result.str
  }

  if (isWeakSet(result)) {
    return 'WeakSet()'
  }

  if (isWeakMap(result)) {
    return 'WeakMap()'
  }

  if (isWeakRef(result)) {
    return 'WeakRef()'
  }

  if (isCyclicRef(result)) {
    return '...'
  }

  if (isRawObject(result)) {
    const { constructorName, props } = result

    const propsStr = Object.entries(props)
      .map(([key, value]) => `${key}: ${stringifyResult(value)}`)
      .join(', ')

    const propsPart = propsStr.length > 0 ? ` {${propsStr}}` : '{}'

    return constructorName !== 'Object' ? `${constructorName} ${propsPart}` : `${propsPart}`
  }

  return null
}

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
  const babel = _babel!

  // @ts-expect-error Babel standalone: https://babeljs.io/docs/babel-standalone#internal-packages
  const { parser } = babel.packages as { parser: typeof import('@babel/parser') }

  // ArrowFunctionExpression | FunctionExpression
  const ast = parser.parseExpression(str)

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

function isDomNode(result: object): result is ReplPayloadResultDomNode {
  return '__rpck__' in result && result.__rpck__ === ReplPayloadCustomKind.DomNode
}

function isFunction(result: object): result is ReplPayloadResultFunction {
  return '__rpck__' in result && result.__rpck__ === ReplPayloadCustomKind.Function
}

function isSymbol(result: object): result is ReplPayloadResultSymbol {
  return '__rpck__' in result && result.__rpck__ === ReplPayloadCustomKind.Symbol
}

function isWeakSet(result: object): result is ReplPayloadResultWeakSet {
  return '__rpck__' in result && result.__rpck__ === ReplPayloadCustomKind.WeakSet
}

function isWeakMap(result: object): result is ReplPayloadResultWeakMap {
  return '__rpck__' in result && result.__rpck__ === ReplPayloadCustomKind.WeakMap
}

function isWeakRef(result: object): result is ReplPayloadResultWeakRef {
  return '__rpck__' in result && result.__rpck__ === ReplPayloadCustomKind.WeakRef
}

function isCyclicRef(result: object): result is ReplPayloadResultCyclicRef {
  return '__rpck__' in result && result.__rpck__ === ReplPayloadCustomKind.CyclicRef
}

function isRawObject(result: object): result is ReplPayloadResultRawObject {
  return '__rpck__' in result && result.__rpck__ === ReplPayloadCustomKind.RawObject
}

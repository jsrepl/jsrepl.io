import {
  type ReplPayload,
  ReplPayloadCustomKind,
  ReplPayloadResultCyclicRef,
  ReplPayloadResultDomNode,
  ReplPayloadResultFunction,
  ReplPayloadResultRawObject,
  ReplPayloadResultSymbol,
  ReplPayloadResultWeakMap,
  ReplPayloadResultWeakRef,
  ReplPayloadResultWeakSet,
} from '../../jsrepl/types/repl.types'
import type { PreviewWindow, ReplRawPayload } from './types'

// Traverse everything and replace non-clonable stuff for structured clone algorithm,
// to ensure postMessage will be able to transfer the payload.
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#things_that_dont_work_with_structured_clone
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types
export function transformPayload(win: PreviewWindow, rawPayload: ReplRawPayload): ReplPayload {
  const { rawResult, ...props } = rawPayload
  const payload = props as unknown as ReplPayload
  const result = transformResult(win, rawResult, new WeakSet())
  payload.result = result
  return payload
}

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects#supported_objects
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#javascript_types
function transformResult(
  win: PreviewWindow,
  rawResult: unknown /* do not mutate `rawResult` */,
  refs: WeakSet<object>
): ReplPayload['result'] {
  // ReplPayloadCustomKind.DomNode
  if (rawResult instanceof win.HTMLElement) {
    return serializeDomNode(rawResult)
  }

  // ReplPayloadCustomKind.Function
  // It can be a "classic" function, or a class (which is a function actually).
  if (typeof rawResult === 'function') {
    return serializeFunction(rawResult)
  }

  if (typeof rawResult === 'symbol') {
    return {
      __rpck__: ReplPayloadCustomKind.Symbol,
      str: rawResult.toString(),
    } as ReplPayloadResultSymbol
  }

  if (rawResult instanceof win.Date) {
    return rawResult
  }

  if (typeof rawResult === 'object' && rawResult !== null) {
    if (refs.has(rawResult)) {
      return { __rpck__: ReplPayloadCustomKind.CyclicRef } as ReplPayloadResultCyclicRef
    } else {
      refs.add(rawResult)
    }
  }

  if (rawResult instanceof win.Set) {
    return new Set(Array.from(rawResult).map((item) => transformResult(win, item, refs)))
  }

  if (rawResult instanceof win.Map) {
    return new Map(
      Array.from(rawResult).map(([key, value]) => [key, transformResult(win, value, refs)])
    )
  }

  if (rawResult instanceof win.WeakSet) {
    return { __rpck__: ReplPayloadCustomKind.WeakSet } as ReplPayloadResultWeakSet
  }

  if (rawResult instanceof win.WeakMap) {
    return { __rpck__: ReplPayloadCustomKind.WeakMap } as ReplPayloadResultWeakMap
  }

  if (rawResult instanceof win.WeakRef) {
    return { __rpck__: ReplPayloadCustomKind.WeakRef } as ReplPayloadResultWeakRef
  }

  if (Array.isArray(rawResult)) {
    return rawResult.map((item) => transformResult(win, item, refs))
  }

  if (rawResult instanceof win.Error) {
    return rawResult
  }

  if (rawResult instanceof win.ArrayBuffer) {
    return rawResult
  }

  // TODO: support more built-in known transferable objects:
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects#supported_objects
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#javascript_types

  if (typeof rawResult === 'object' && rawResult !== null) {
    return serializeRawObject(win, rawResult, refs)
  }

  return rawResult
}

function serializeDomNode(el: HTMLElement): ReplPayloadResultDomNode {
  return {
    __rpck__: ReplPayloadCustomKind.DomNode,
    tagName: el.tagName.toLowerCase(),
    attributes: Array.from(el.attributes).map((attr) => ({ name: attr.name, value: attr.value })),
    hasChildNodes: el.hasChildNodes(),
    childElementCount: el.childElementCount,
    textContent: el.textContent,
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function serializeFunction(fn: Function): ReplPayloadResultFunction {
  return {
    __rpck__: ReplPayloadCustomKind.Function,
    name: fn.name,
    str: fn.toString(),
  }
}

function serializeRawObject(
  win: PreviewWindow,
  rawResult: object,
  refs: WeakSet<object>
): ReplPayloadResultRawObject {
  const obj = {
    __rpck__: ReplPayloadCustomKind.RawObject,
    constructorName: rawResult.constructor.name,
    props: {} as Record<string, unknown>,
  } as ReplPayloadResultRawObject

  Object.entries(rawResult).forEach(([key, value]) => {
    const newValue = transformResult(win, value, refs)
    obj.props[key] = newValue
  })

  return obj
}

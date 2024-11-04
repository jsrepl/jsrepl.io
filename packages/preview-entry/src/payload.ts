import {
  MarshalledDomNode,
  MarshalledFunction,
  MarshalledObject,
  MarshalledSymbol,
  MarshalledType,
  MarshalledWeakMap,
  MarshalledWeakRef,
  MarshalledWeakSet,
  ReplPayload,
  ReplRawPayload,
} from '@jsrepl/shared-types'
import type { PreviewWindow } from './types'

// Traverse everything and replace non-clonable stuff for structured clone algorithm,
// to ensure postMessage will be able to transfer the payload.
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#things_that_dont_work_with_structured_clone
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types
export function transformPayload(win: PreviewWindow, rawPayload: ReplRawPayload): ReplPayload {
  const { rawResult, ...props } = rawPayload
  const payload = props as unknown as ReplPayload
  const result = transformResult(win, rawResult, new WeakMap())
  payload.result = result
  return payload
}

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects#supported_objects
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#javascript_types
function transformResult(
  win: PreviewWindow,
  rawResult: unknown /* do not mutate `rawResult` */,
  refs: WeakMap<object, unknown>
): ReplPayload['result'] {
  if (rawResult !== null && typeof rawResult === 'object' && refs.has(rawResult)) {
    // Circular reference
    return refs.get(rawResult)
  }

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
      __meta__: {
        type: MarshalledType.Symbol,
      },
      serialized: rawResult.toString(),
    } as MarshalledSymbol
  }

  if (rawResult instanceof win.Date) {
    return rawResult
  }

  if (rawResult instanceof win.Set) {
    const set = new Set()
    refs.set(rawResult, set)
    for (const item of rawResult) {
      set.add(transformResult(win, item, refs))
    }
    return set
  }

  if (rawResult instanceof win.Map) {
    const map = new Map()
    refs.set(rawResult, map)
    for (const [key, value] of rawResult) {
      map.set(transformResult(win, key, refs), transformResult(win, value, refs))
    }
    return map
  }

  if (rawResult instanceof win.WeakSet) {
    return {
      __meta__: {
        type: MarshalledType.WeakSet,
      },
    } as MarshalledWeakSet
  }

  if (rawResult instanceof win.WeakMap) {
    return {
      __meta__: {
        type: MarshalledType.WeakMap,
      },
    } as MarshalledWeakMap
  }

  if (rawResult instanceof win.WeakRef) {
    return {
      __meta__: {
        type: MarshalledType.WeakRef,
      },
    } as MarshalledWeakRef
  }

  if (win.Array.isArray(rawResult)) {
    const arr: unknown[] = []
    refs.set(rawResult, arr)
    for (const item of rawResult) {
      arr.push(transformResult(win, item, refs))
    }
    return arr
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
    const obj = {} as MarshalledObject
    refs.set(rawResult, obj)

    getAllPropertyNames(win, rawResult).forEach((propName) => {
      const value = rawResult[propName as keyof typeof rawResult]
      const transformedValue = transformResult(win, value, refs)
      obj[propName] = transformedValue
    })

    obj.__meta__ = {
      type: MarshalledType.Object,
      constructorName: rawResult.constructor?.name,
    }

    return obj
  }

  return rawResult
}

function serializeDomNode(el: HTMLElement): MarshalledDomNode {
  return {
    __meta__: {
      type: MarshalledType.DomNode,
      tagName: el.tagName.toLowerCase(),
      constructorName: el.constructor?.name,
      attributes: Array.from(el.attributes).map((attr) => ({ name: attr.name, value: attr.value })),
      hasChildNodes: el.hasChildNodes(),
      childElementCount: el.childElementCount,
      textContent: el.textContent,
    },
    serialized: el.outerHTML,
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function serializeFunction(fn: Function): MarshalledFunction {
  return {
    __meta__: {
      type: MarshalledType.Function,
      name: fn.name,
    },
    serialized: fn.toString(),
  }
}

// TODO: improve this, check https://stackoverflow.com/q/8024149
function getAllPropertyNames(win: PreviewWindow, obj: object): string[] {
  const Object = win.Object
  const proto = Object.getPrototypeOf(obj)
  const inherited = proto && proto !== Object.prototype ? getAllPropertyNames(win, proto) : []
  return [...new Set(Object.getOwnPropertyNames(obj).concat(inherited))].filter(
    (name) => name !== 'constructor'
  )
}

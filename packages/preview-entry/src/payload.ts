import {
  MarshalledDomNode,
  MarshalledFunction,
  MarshalledObject,
  MarshalledSymbol,
  MarshalledType,
  MarshalledWeakMap,
  MarshalledWeakRef,
  MarshalledWeakSet,
} from '@jsrepl/shared-types'
import type { PreviewWindow } from './types'

// Traverse everything and replace non-clonable stuff for structured clone algorithm,
// to ensure postMessage will be able to transfer the payload.
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#things_that_dont_work_with_structured_clone
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects#supported_objects
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#javascript_types
export function transformPayloadResult(win: PreviewWindow, result: unknown): unknown {
  return transformResult(win, result, new WeakMap())
}

function transformResult(
  win: PreviewWindow,
  result: unknown /* do not mutate `result` */,
  refs: WeakMap<object, unknown>
): unknown {
  if (result !== null && typeof result === 'object' && refs.has(result)) {
    // Circular reference
    return refs.get(result)
  }

  // ReplPayloadCustomKind.DomNode
  if (result instanceof win.HTMLElement) {
    return serializeDomNode(result)
  }

  // ReplPayloadCustomKind.Function
  // It can be a "classic" function, or a class (which is a function actually).
  if (typeof result === 'function') {
    return serializeFunction(result)
  }

  if (typeof result === 'symbol') {
    return {
      __meta__: {
        type: MarshalledType.Symbol,
      },
      serialized: result.toString(),
    } as MarshalledSymbol
  }

  if (result instanceof win.Date) {
    return result
  }

  if (result instanceof win.Set) {
    const set = new Set()
    refs.set(result, set)
    for (const item of result) {
      set.add(transformResult(win, item, refs))
    }
    return set
  }

  if (result instanceof win.Map) {
    const map = new Map()
    refs.set(result, map)
    for (const [key, value] of result) {
      map.set(transformResult(win, key, refs), transformResult(win, value, refs))
    }
    return map
  }

  if (result instanceof win.WeakSet) {
    return {
      __meta__: {
        type: MarshalledType.WeakSet,
      },
    } as MarshalledWeakSet
  }

  if (result instanceof win.WeakMap) {
    return {
      __meta__: {
        type: MarshalledType.WeakMap,
      },
    } as MarshalledWeakMap
  }

  if (result instanceof win.WeakRef) {
    return {
      __meta__: {
        type: MarshalledType.WeakRef,
      },
    } as MarshalledWeakRef
  }

  if (win.Array.isArray(result)) {
    const arr: unknown[] = []
    refs.set(result, arr)
    for (const item of result) {
      arr.push(transformResult(win, item, refs))
    }
    return arr
  }

  if (result instanceof win.Error) {
    return result
  }

  if (result instanceof win.ArrayBuffer) {
    return result
  }

  // TODO: support more built-in known transferable objects:
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects#supported_objects
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#javascript_types

  if (typeof result === 'object' && result !== null) {
    const obj = {} as MarshalledObject
    refs.set(result, obj)

    const skipProps = result instanceof win.Window

    if (!skipProps) {
      getAllPropertyNames(win, result).forEach((propName) => {
        let value
        try {
          value = result[propName as keyof typeof result]
        } catch (e) {
          value = e
        }

        const transformedValue = transformResult(win, value, refs)
        obj[propName] = transformedValue
      })
    }

    let constructorName: string | undefined
    try {
      constructorName = result.constructor?.name
    } catch {
      // Ignore error.
      // For example, it can be Uncaught SecurityError: Failed to read a named property 'constructor' from 'Location': Blocked a frame with origin "http://localhost:5199" from accessing a cross-origin frame.
    }

    obj.__meta__ = {
      type: MarshalledType.Object,
      constructorName,
    }

    return obj
  }

  return result
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
      name: fn.name.replace(/^bound /u, ''),
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

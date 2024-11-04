import { type ReplPayload } from '@jsrepl/shared-types'
import * as utils from './payload-utils'

export function renderToMockObject(payload: ReplPayload): unknown {
  let value = structuredClone(payload.result)

  if (
    ['console-log', 'console-debug', 'console-info', 'console-warn', 'console-error'].includes(
      payload.ctx.kind
    )
  ) {
    const args = payload.result as ReplPayload['result'][]
    value = args.length > 1 ? args : args[0]
  }

  if (payload.ctx.kind === 'variable') {
    const vars = payload.result as Array<{ kind: string; name: string; value: unknown }>
    value = vars.length > 1 ? vars.map(({ value }) => value) : vars[0].value
  }

  if (payload.ctx.kind === 'assignment') {
    const vars = payload.result as Array<{ name: string; value: unknown }>
    value = vars.length > 1 ? vars.map(({ value }) => value) : vars[0].value
  }

  return revive(value, { domParser: new DOMParser(), refs: new WeakMap() })
}

function revive(
  value: unknown,
  context: { domParser: DOMParser; refs: WeakMap<object, unknown> }
): unknown {
  if (value !== null && typeof value === 'object') {
    switch (true) {
      case context.refs.has(value):
        // Circular reference
        return context.refs.get(value)

      case utils.isMarshalledDomNode(value): {
        const doc = context.domParser.parseFromString(value.serialized, 'text/html')
        return doc.head.firstChild ?? doc.body.firstChild
      }

      case utils.isMarshalledFunction(value): {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        let fn: Function
        try {
          fn = new Function(`return ${value.serialized}`)()
        } catch {}

        fn ??= new Function(`return function ${value.__meta__.name}() {}`)()

        return fn
      }

      case utils.isMarshalledSymbol(value): {
        const symbolKey = value.serialized.slice(7, -1)
        return Symbol(symbolKey)
      }

      case utils.isMarshalledWeakSet(value):
        return new WeakSet()

      case utils.isMarshalledWeakMap(value):
        return new WeakMap()

      case utils.isMarshalledWeakRef(value):
        return new WeakRef({})

      case utils.isMarshalledObject(value): {
        const { __meta__: meta, ...props } = value

        let obj: Record<string, unknown>
        if (meta.constructorName === 'Object') {
          obj = {}
        } else if (!meta.constructorName) {
          obj = Object.create(null)
        } else {
          const klass = new Function(`return class ${meta.constructorName} {}`)()
          obj = new klass()
        }

        context.refs.set(value, obj)

        for (const [key, propValue] of Object.entries(props)) {
          obj[key] = revive(propValue, context)
        }

        return obj
      }

      case value instanceof Set: {
        const set = new Set()
        context.refs.set(value, set)
        for (const item of value) {
          set.add(revive(item, context))
        }
        return set
      }

      case value instanceof Map: {
        const map = new Map()
        context.refs.set(value, map)
        for (const [key, propValue] of value) {
          map.set(revive(key, context), revive(propValue, context))
        }
        return map
      }

      case Array.isArray(value): {
        const arr: unknown[] = []
        context.refs.set(value, arr)
        for (const item of value) {
          arr.push(revive(item, context))
        }
        return arr
      }
    }
  }

  return value
}

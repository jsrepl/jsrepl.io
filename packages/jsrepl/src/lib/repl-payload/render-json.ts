import { type ReplPayload } from '@jsrepl/shared-types'
import * as utils from './payload-utils'

export function renderToJSONString(payload: ReplPayload, indent?: number): string {
  let value = payload.result

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

  return JSON.stringify(value, replacer, indent)
}

export function renderToJSON(payload: ReplPayload): unknown {
  return JSON.parse(renderToJSONString(payload))
}

function replacer(this: unknown, key: string, value: unknown): unknown {
  if (value !== null && typeof value === 'object') {
    switch (true) {
      case utils.isMarshalledDomNode(value):
        return value.serialized

      case utils.isMarshalledFunction(value):
        return value.serialized

      case utils.isMarshalledSymbol(value):
        return value.serialized

      case utils.isMarshalledWeakSet(value):
      case utils.isMarshalledWeakMap(value):
      case utils.isMarshalledWeakRef(value):
        return undefined

      case utils.isMarshalledObject(value): {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { __meta__, ...props } = value
        return props
      }
    }
  }

  if (value instanceof Set) {
    return Array.from(value)
  }

  if (value instanceof Map) {
    return Object.fromEntries(value)
  }

  return value
}

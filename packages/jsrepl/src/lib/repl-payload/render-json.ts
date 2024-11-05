import { type ReplPayload, ReplPayloadConsoleLog } from '@jsrepl/shared-types'
import * as utils from './payload-utils'

export function renderToJSONString(payload: ReplPayload, indent?: number): string {
  const kind = payload.ctx.kind
  let value = payload.result

  if (
    kind === 'console-log' ||
    kind === 'console-debug' ||
    kind === 'console-info' ||
    kind === 'console-warn' ||
    kind === 'console-error'
  ) {
    const args = (payload as ReplPayloadConsoleLog).result
    value = args.length > 1 ? args : args[0]
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

import {
  type ReplPayload,
  ReplPayloadConsoleLog,
  ReplPayloadFunctionCall,
} from '@jsrepl/shared-types'
import { stringifyResult } from './stringify'

export function renderToDecorString(payload: ReplPayload): string | null {
  const str = renderPayload(payload)
  if (str && str.length > 100) {
    return str.slice(0, 100) + '…'
  }

  return str
}

function renderPayload(payload: ReplPayload): string | null {
  const kind = payload.ctx.kind

  if (kind === 'variable') {
    const { varName } = payload.ctx
    return `${varName} = ${stringifyResult(payload.result, 'decor').value}`
  }

  if (kind === 'assignment') {
    const { memberName } = payload.ctx
    return `${memberName} = ${stringifyResult(payload.result, 'decor').value}`
  }

  if (kind === 'function-call') {
    const { name } = payload.ctx
    const { result } = payload as ReplPayloadFunctionCall
    const args = result.map((arg) => stringifyResult(arg, 'decor', 1).value).join(', ')
    return `ƒƒ ${name ?? 'anonymous'}(${args})`
  }

  if (kind === 'return') {
    return `ƒƒ => ${stringifyResult(payload.result, 'decor').value}`
  }

  if (
    kind === 'console-log' ||
    kind === 'console-debug' ||
    kind === 'console-info' ||
    kind === 'console-warn' ||
    kind === 'console-error'
  ) {
    const args = (payload as ReplPayloadConsoleLog).result
    return args.map((arg) => stringifyResult(arg, 'decor').value).join(' ')
  }

  return stringifyResult(payload.result, 'decor').value
}

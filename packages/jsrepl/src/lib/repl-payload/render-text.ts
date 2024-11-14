import {
  type ReplPayload,
  ReplPayloadConsoleLog,
  ReplPayloadFunctionCall,
} from '@jsrepl/shared-types'
import { type StringifyResult, stringifyResult } from './stringify'

export function renderToText(payload: ReplPayload): string {
  const kind = payload.ctx.kind

  if (kind === 'variable') {
    const { varKind, varName } = payload.ctx
    const prefix = `${varKind} ${varName} = `
    const stringified = stringifyResult(payload.result, 'details')
    return renderStringified(stringified, prefix)
  }

  if (kind === 'assignment') {
    const { memberName } = payload.ctx
    const prefix = `${memberName} = `
    const stringified = stringifyResult(payload.result, 'details')
    return renderStringified(stringified, prefix)
  }

  if (kind === 'function-call') {
    const { result } = payload as ReplPayloadFunctionCall
    const prefix = `arguments = `
    const stringified = stringifyResult(result, 'details')
    return renderStringified(stringified, prefix)
  }

  if (
    kind === 'console-log' ||
    kind === 'console-debug' ||
    kind === 'console-info' ||
    kind === 'console-warn' ||
    kind === 'console-error'
  ) {
    const args = (payload as ReplPayloadConsoleLog).result
    return args
      .map((arg) => {
        const stringified = stringifyResult(arg, 'details')
        return renderStringified(stringified)
      })
      .join('\n\n')
  }

  const stringified = stringifyResult(payload.result, 'details')
  return renderStringified(stringified)
}

function renderStringified(stringified: StringifyResult, prefix: string = ''): string {
  const value = prefix + stringified.value
  return value
}

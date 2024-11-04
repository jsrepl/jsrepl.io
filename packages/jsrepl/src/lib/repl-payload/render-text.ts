import { type ReplPayload } from '@/types'
import { type StringifyResult, stringifyResult } from './stringify'

export function renderToText(payload: ReplPayload): string {
  if (
    ['console-log', 'console-debug', 'console-info', 'console-warn', 'console-error'].includes(
      payload.ctx.kind
    )
  ) {
    const args = payload.result as ReplPayload['result'][]
    return args
      .map((arg) => {
        const stringified = stringifyResult(arg, 'details')
        return renderStringified(stringified)
      })
      .join('\n\n')
  }

  if (payload.ctx.kind === 'variable') {
    const vars = payload.result as Array<{ kind: string; name: string; value: unknown }>
    return vars
      .map(({ kind, name, value }) => {
        const prefix = `${kind} ${name} = `
        const stringified = stringifyResult(value, 'details')
        return renderStringified(stringified, prefix)
      })
      .join('\n\n')
  }

  if (payload.ctx.kind === 'assignment') {
    const vars = payload.result as Array<{ name: string; value: unknown }>
    return vars
      .map(({ name, value }) => {
        const prefix = `${name} = `
        const stringified = stringifyResult(value, 'details')
        return renderStringified(stringified, prefix)
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

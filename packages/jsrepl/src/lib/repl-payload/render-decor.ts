import { type ReplPayload } from '@/types'
import { stringifyResult } from './stringify'

export function renderToDecorString(payload: ReplPayload): string | null {
  const str = renderPayload(payload)
  if (str && str.length > 100) {
    return str.slice(0, 100) + '…'
  }

  return str
}

function renderPayload(payload: ReplPayload): string | null {
  if (
    ['console-log', 'console-debug', 'console-info', 'console-warn', 'console-error'].includes(
      payload.ctx.kind
    )
  ) {
    const args = payload.result as ReplPayload['result'][]
    return args.map((arg) => stringifyResult(arg, 'decor').value).join(' ')
  }

  if (payload.ctx.kind === 'variable' || payload.ctx.kind === 'assignment') {
    const vars = payload.result as Array<{ name: string; value: unknown }>
    return vars
      .map(({ name, value }) => `${name} = ${stringifyResult(value, 'decor').value}`)
      .join(', ')
  }

  return stringifyResult(payload.result, 'decor').value
}

import { type ReplPayload } from '@jsrepl/shared-types'
import type * as monaco from 'monaco-editor'
import { type StringifyResult, stringifyResult } from './stringify'

export function renderToHoverContents(payloads: ReplPayload[]): monaco.IMarkdownString[] {
  return [
    {
      value: `**REPL SNAPSHOT** <span style="color:#01;"></span><span 
          style="color:#777777;" 
          title="This value was evaluated upon code execution in this line. It may have changed since then."
        ><span style="color:#02;"></span>$(info)</span>
      `,
      supportThemeIcons: true,
      supportHtml: true,
      isTrusted: true,
    },
    ...payloads.flatMap((payload, index) => [
      ...(index === 0 ? [] : [{ value: '<hr>', supportHtml: true }]),
      ...renderPayload(payload).map((str) => ({ value: str, supportHtml: true })),
      {
        value: `<span style="color:#03;">
          <a href="${getCommandHref('jsrepl.dumpPayloadAsMockObjectToConsole', payload.id, true)}" title="Write snapshot value into global variable and output it to Browser Console">Dump object</a>
          <a href="${getCommandHref('jsrepl.copyPayloadAsText', payload.id, true)}" title="Copy snapshot as text">Copy text</a>
          <a href="${getCommandHref('jsrepl.copyPayloadAsJSON', payload.id, true)}" title="Copy snapshot value as JSON">Copy json</a>
          &nbsp;&nbsp;
        </span>`,
        supportThemeIcons: true,
        supportHtml: true,
        isTrusted: true,
      },
    ]),
  ]
}

function getCommandHref(commandId: string, ...args: unknown[]) {
  return `command:${commandId}?${encodeURIComponent(JSON.stringify(args))}`
}

function renderPayload(payload: ReplPayload): string[] {
  if (
    ['console-log', 'console-debug', 'console-info', 'console-warn', 'console-error'].includes(
      payload.ctx.kind
    )
  ) {
    const args = payload.result as ReplPayload['result'][]
    return args.flatMap((arg) => {
      const stringified = stringifyResult(arg, 'details')
      return renderStringified(stringified)
    })
  }

  if (payload.ctx.kind === 'variable') {
    const vars = payload.result as Array<{ kind: string; name: string; value: unknown }>
    return vars.flatMap(({ kind, name, value }, index) => {
      const prefix = `${kind} ${name} = `
      const stringified = stringifyResult(value, 'details')
      return [...(index === 0 ? [] : ['<hr>']), ...renderStringified(stringified, prefix)]
    })
  }

  if (payload.ctx.kind === 'assignment') {
    const vars = payload.result as Array<{ name: string; value: unknown }>
    return vars.flatMap(({ name, value }, index) => {
      const prefix = `${name} = `
      const stringified = stringifyResult(value, 'details')
      return [...(index === 0 ? [] : ['<hr>']), ...renderStringified(stringified, prefix)]
    })
  }

  const stringified = stringifyResult(payload.result, 'details')
  return renderStringified(stringified)
}

function renderStringified(stringified: StringifyResult, prefix: string = ''): string[] {
  const strs: string[] = []

  if (stringified.detailsBefore) {
    strs.push(...renderStringified(stringified.detailsBefore))
  }

  const value = prefix + stringified.value
  strs.push(stringified.lang != null ? pre(value, stringified.lang) : value)

  if (stringified.detailsAfter) {
    strs.push(...renderStringified(stringified.detailsAfter))
  }

  return strs
}

function pre(contents: string, lang: string) {
  return `\`\`\`${lang}\n${contents}\n\`\`\``
}

import {
  type ReplPayload,
  ReplPayloadConsoleLog,
  ReplPayloadFunctionCall,
} from '@jsrepl/shared-types'
import type * as monaco from 'monaco-editor'
import { type StringifyResult, stringifyResult } from './stringify'

export function renderToHoverContents(payloads: ReplPayload[]): monaco.IMarkdownString[] {
  return [
    ...payloads.flatMap((payload, index) => [
      ...(index === 0 ? [] : [{ value: '<hr>', supportHtml: true }]),
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
  const kind = payload.ctx.kind

  if (kind === 'variable') {
    const { varName, varKind } = payload.ctx
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
    stringified.detailsBefore = {
      value: `Function \`${payload.ctx.name ?? 'anonymous'}\` called with`,
      lang: null,
    }
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
    return args.flatMap((arg) => {
      const stringified = stringifyResult(arg, 'details')
      return renderStringified(stringified)
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

const langAlias: Record<string, string> = {
  jsx: 'js',
  tsx: 'ts',
}

function pre(contents: string, lang: string) {
  return `\`\`\`${langAlias[lang] ?? lang}\n${contents}\n\`\`\``
}

import type * as monaco from 'monaco-editor'
import { type ReplPayload } from '@/types'
import { StringifyResult, stringifyResult } from './utils'

export function getHoverMessages(payload: ReplPayload): monaco.IMarkdownString[] {
  const strArr = stringifyPayload(payload)

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
    ...strArr.map((str) => ({ value: str })),
    {
      value: `<span style="color:#03;">
        <a href="command:editor.foldAll" title="fold all1123">Fold All</a>
      </span>`,
      supportThemeIcons: true,
      supportHtml: true,
      isTrusted: {
        enabledCommands: ['editor.foldAll'],
      },
    },
    // {
    //   value:
    //     'hey <b>Explore/View/Stick (details between lines)</b> <b>Copy value</b> <b>Dump to console</b> <span style="color:#ff0000;">yes</span>',
    //   isTrusted: {
    //     enabledCommands: ['editor.foldAll'],
    //   },
    //   supportThemeIcons: true,
    //   supportHtml: true,
    // },
  ]
}

function stringifyPayload(payload: ReplPayload): string[] {
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

  if (payload.ctx.kind === 'variable' || payload.ctx.kind === 'assignment') {
    const vars = payload.result as Array<{ name: string; value: unknown }>
    return vars.flatMap(({ name, value }) => {
      const stringified = stringifyResult(value, 'details')
      // TODO: add `var/let/const` prefix (if it is a variable [const a = 1], not a assignment expression [window.a = 1])
      return [`\`${name}\``, ...renderStringified(stringified)]
    })
  }

  const stringified = stringifyResult(payload.result, 'details')
  return renderStringified(stringified)
}

function renderStringified(stringified: StringifyResult): string[] {
  const strs = []

  if (stringified.detailsBefore) {
    strs.push(...renderStringified(stringified.detailsBefore))
  }

  strs.push(stringified.lang != null ? pre(stringified.value, stringified.lang) : stringified.value)

  if (stringified.detailsAfter) {
    strs.push(...renderStringified(stringified.detailsAfter))
  }

  return strs
}

function pre(contents: string, lang: string) {
  return `\`\`\`${lang}\n${contents}\n\`\`\``
}

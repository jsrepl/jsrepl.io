import { type ReplPayload } from '@jsrepl/shared-types'
import * as monaco from 'monaco-editor'
import codeEditorStyles from '@/components/code-editor.module.css'
import { cssInject } from '@/lib/css-inject'
import { renderToDecorString } from './render-decor'

let decorationUniqId = -1

export function createDecorations(
  editor: monaco.editor.ICodeEditor,
  payloads: ReplPayload[],
  { highlightedPayloadIds }: { highlightedPayloadIds: string[] }
) {
  const cssStylesRef: string[] = []
  const decorationDefs = payloads
    .map((payload) =>
      getDecorDef(payload, {
        cssStylesRef,
        isHighlighted: highlightedPayloadIds.includes(payload.id),
      })
    )
    .filter((x) => x !== null)

  const decorations = editor.createDecorationsCollection(decorationDefs)
  const removeCSS = cssInject(cssStylesRef.join('\n'), 'jsrepl-decor-defs')

  return () => {
    decorations.clear()
    removeCSS()
  }
}

function getDecorDef(
  payload: ReplPayload,
  { cssStylesRef, isHighlighted }: { cssStylesRef: string[]; isHighlighted: boolean }
): monaco.editor.IModelDeltaDecoration | null {
  try {
    const { /* result, */ ctx } = payload
    const { lineEnd, kind, lineStart, colStart, colEnd /*, source */ } = ctx

    decorationUniqId = (decorationUniqId + 1) % Number.MAX_SAFE_INTEGER
    const uniqClassName = `jsrepl-decor-${decorationUniqId}`

    const decorStr = renderToDecorString(payload)
    if (decorStr === null) {
      return null
    }

    const valueCssVar = CSS.escape(decorStr)
    cssStylesRef.push(`.${uniqClassName} { --value: "${valueCssVar}"; }`)

    return {
      // line starts with 1, column starts with 1
      range: new monaco!.Range(lineStart, colStart, lineEnd, Math.max(colEnd - 1, colStart)),
      options: {
        isWholeLine: true,
        afterContentClassName: `${codeEditorStyles.jsreplDecor} ${codeEditorStyles[`jsreplDecor-${kind}`] ?? ''} ${uniqClassName} ${isHighlighted ? codeEditorStyles.jsreplDecorHighlighted : ''}`,
      },
    }
  } catch (e) {
    console.error('create decoration error', e, payload)
    return null
  }
}

import * as monaco from 'monaco-editor'
import codeEditorStyles from '@/app/repl/components/code-editor.module.css'
import { cssInject } from '@/lib/css-inject'
import { type ReplPayload } from '@/types'
import { getDecorString } from './decor-string'

let decorationUniqIndex = -1

export function createDecorations(editor: monaco.editor.ICodeEditor, payloads: ReplPayload[]) {
  const cssStyles: string[] = []
  const decorationDefs = payloads
    .map((payload) => getDecorDef(payload, cssStyles))
    .filter((x) => x !== null)

  const decorations = editor.createDecorationsCollection(decorationDefs)
  const removeStyle = cssInject(cssStyles.join('\n'))

  return () => {
    decorations.clear()
    removeStyle()
  }
}

function getDecorDef(
  payload: ReplPayload,
  cssStylesRef: string[]
): monaco.editor.IModelDeltaDecoration | null {
  try {
    const { /* result, */ ctx } = payload
    const { lineStart, kind /* lineEnd, colStart, colEnd, source */ } = ctx

    decorationUniqIndex = (decorationUniqIndex + 1) % Number.MAX_VALUE
    const uniqClassName = `jsrepl-decor-${decorationUniqIndex}`

    const decorStr = getDecorString(payload)
    if (decorStr === null) {
      return null
    }

    const valueCssVar = CSS.escape(decorStr)
    cssStylesRef.push(`.${uniqClassName}::after { --value: "${valueCssVar}"; }`)

    return {
      // line starts with 1, column starts with 1
      // FIXME: sometimes when editing decors rendered shifted. Check token?
      range: new monaco!.Range(lineStart, 1, lineStart, 1),
      options: {
        isWholeLine: true,
        afterContentClassName: `${codeEditorStyles.jsreplDecor} ${codeEditorStyles[`jsreplDecor-${kind}`] ?? ''} ${uniqClassName}`,
      },
    }
  } catch (e) {
    console.error('create decoration error', e, payload)
    return null
  }
}

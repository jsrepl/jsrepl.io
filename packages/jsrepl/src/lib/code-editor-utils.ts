import type * as monaco from 'monaco-editor'
import { cssUnescape } from './css-unescape'

export function getEditorContentsWithReplDecors(editor: monaco.editor.ICodeEditor): string | null {
  const model = editor.getModel()
  if (!model) {
    return null
  }

  const decorDefsStyle = document.getElementById('jsrepl-decor-defs') as HTMLStyleElement | null
  const decorValuesMap = Array.from(decorDefsStyle?.sheet?.cssRules ?? []).reduce(
    (acc, rule) => {
      const { selectorText, style } = rule as CSSStyleRule
      const decorId = selectorText.slice(14 /* .jsrepl-decor-ID */)
      // Remove double quotation marks around the edges, and unescape the value, escaped by `CSS.escape`.
      const value = cssUnescape(style.getPropertyValue('--value').slice(1, -1))
      acc[decorId] = value
      return acc
    },
    {} as Record<string, string>
  )

  let selection = editor.getSelection()
  let startLineNumber: number
  let contents: string
  if (selection !== null && !selection.isEmpty()) {
    startLineNumber = selection.startLineNumber

    // Expand the selection to the full line.
    selection = selection
      .setStartPosition(selection.startLineNumber, 1)
      .setEndPosition(selection.endLineNumber, model.getLineMaxColumn(selection.endLineNumber))

    editor.setSelection(selection)

    contents = model.getValueInRange(selection)
  } else {
    startLineNumber = 1
    contents = model.getValue()
  }

  const lines = contents.split('\n')

  const linesWithDecors: string[] = lines.map((line, lineIndex) => {
    const lineDecors = editor.getLineDecorations(startLineNumber + lineIndex) ?? []
    const decorValues: string[] = lineDecors
      .map((decor) => {
        const decorId = decor.options.afterContentClassName?.match(/jsrepl-decor-([0-9]+)/)?.[1]
        return decorId ? decorValuesMap[decorId] : null
      })
      .filter((x) => x != null)

    return (
      line +
      decorValues
        .map((decorValue, index) => (index === 0 ? ` // → ${decorValue}` : `, ${decorValue}`))
        .join('')
    )
  })

  const contentsWithDecors: string = linesWithDecors.join('\n')
  return contentsWithDecors
}

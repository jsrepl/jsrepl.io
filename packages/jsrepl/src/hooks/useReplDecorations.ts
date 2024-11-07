import { RefObject, useCallback, useContext, useEffect, useRef } from 'react'
import { ReplPayload } from '@jsrepl/shared-types'
import * as monaco from 'monaco-editor'
import { ReplHistoryModeContext } from '@/context/repl-history-mode-context'
import { ReplPayloadsContext } from '@/context/repl-payloads-context'
import { ReplStateContext } from '@/context/repl-state-context'
import { getEditorContentsWithReplDecors } from '@/lib/code-editor-utils'
import { createDecorations } from '@/lib/repl-payload/decorations'
import { renderToHoverContents } from '@/lib/repl-payload/render-hover'

export default function useReplDecorations(
  editorRef: RefObject<monaco.editor.IStandaloneCodeEditor | null>
) {
  const { replState } = useContext(ReplStateContext)!
  const { historyMode } = useContext(ReplHistoryModeContext)!
  const { payloads } = useContext(ReplPayloadsContext)!

  const decorationsDisposable = useRef<() => void>()
  const provideHoverRef = useRef<typeof provideHover>()

  const getDisplayedPayloads = useCallback(
    (predicate: (payload: ReplPayload) => boolean) => {
      const map = new Map<number | string, ReplPayload>()
      for (const payload of payloads) {
        if (predicate(payload)) {
          map.set(payload.ctx.id, payload)
        }

        if (historyMode?.currentPayloadId === payload.id) {
          break
        }
      }

      return Array.from(map.values())
    },
    [payloads, historyMode?.currentPayloadId]
  )

  const updateDecorations = useCallback(() => {
    const editor = editorRef.current
    const activeModel = replState.activeModel
    if (!editor || !activeModel) {
      return
    }

    decorationsDisposable.current?.()

    const payloads = getDisplayedPayloads((payload) => payload.ctx.filePath === activeModel)
    const highlightedPayloadIds = historyMode?.currentPayloadId
      ? [historyMode.currentPayloadId]
      : []

    decorationsDisposable.current =
      payloads.length > 0
        ? createDecorations(editor, payloads, { highlightedPayloadIds })
        : undefined
  }, [editorRef, getDisplayedPayloads, historyMode, replState.activeModel])

  useEffect(() => {
    updateDecorations()
  }, [updateDecorations])

  useEffect(() => {
    return () => {
      decorationsDisposable.current?.()
    }
  }, [])

  const provideHover = useCallback(
    (model: monaco.editor.ITextModel, position: monaco.Position) => {
      const maxColumn = model.getLineMaxColumn(position.lineNumber)
      if (position.column !== maxColumn) {
        return
      }

      const hoverPayloads: ReplPayload[] = getDisplayedPayloads(
        (payload) =>
          payload.ctx.filePath === model.uri.path && payload.ctx.lineStart === position.lineNumber
      )

      if (hoverPayloads.length === 0) {
        return
      }

      return { contents: renderToHoverContents(hoverPayloads) }
    },
    [getDisplayedPayloads]
  )

  useEffect(() => {
    provideHoverRef.current = provideHover
  }, [provideHover])

  useEffect(() => {
    const disposable = monaco.languages.registerHoverProvider('*', {
      provideHover(model, position /*, token, context*/) {
        return provideHoverRef.current!(model, position)
      },
    })

    return () => {
      disposable.dispose()
    }
  }, [])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    const disposable = editor.addAction({
      id: 'jsrepl.copyContentsWithDecors',
      label: 'Copy With REPL Decorations',
      async run(editor) {
        const contents = getEditorContentsWithReplDecors(editor)
        if (contents !== null) {
          await navigator.clipboard.writeText(contents)
        }
      },
    })

    return () => {
      disposable.dispose()
    }
  }, [editorRef])
}

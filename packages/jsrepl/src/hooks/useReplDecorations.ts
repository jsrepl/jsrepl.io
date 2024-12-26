import { useCallback, useEffect, useRef } from 'react'
import { ReplPayload } from '@jsrepl/shared-types'
import * as monaco from 'monaco-editor'
import { getEditorContentsWithReplDecors } from '@/lib/code-editor-utils'
import { createDecorations } from '@/lib/repl-payload/decorations'
import { renderToHoverContents } from '@/lib/repl-payload/render-hover'
import { useMonacoEditor } from './useMonacoEditor'
import useReplOutdatedDecorations from './useReplOutdatedDecorations'
import { useReplPayloads } from './useReplPayloads'
import { useReplRewindMode } from './useReplRewindMode'
import { useReplStoredState } from './useReplStoredState'

export default function useReplDecorations() {
  const [replState] = useReplStoredState()
  const [rewindMode] = useReplRewindMode()
  const { payloads } = useReplPayloads()
  const { editor, editorRef } = useMonacoEditor()
  const { setDecorationsOutdated } = useReplOutdatedDecorations()

  const decorationsDisposable = useRef<() => void>(undefined)
  const provideHoverRef = useRef<typeof provideHover>(undefined)

  const getVisiblePayloads = useCallback(
    (predicate: (payload: ReplPayload) => boolean) => {
      const arr: ReplPayload[] = []
      for (const payload of payloads) {
        if (predicate(payload)) {
          arr.push(payload)
        }

        if (rewindMode.active && rewindMode.currentPayloadId === payload.id) {
          break
        }
      }

      return arr
    },
    [payloads, rewindMode.active, rewindMode.currentPayloadId]
  )

  const getDisplayedPayloads = useCallback(
    (predicate: (payload: ReplPayload) => boolean) => {
      const map = new Map<number | string, ReplPayload>()
      for (const payload of payloads) {
        if (predicate(payload)) {
          map.set(payload.ctx.displayId ?? payload.ctx.id, payload)
        }

        if (rewindMode.active && rewindMode.currentPayloadId === payload.id) {
          break
        }
      }

      return Array.from(map.values())
    },
    [payloads, rewindMode.currentPayloadId, rewindMode.active]
  )

  const updateDecorations = useCallback(() => {
    const activeModel = replState.activeModel
    if (!editorRef.current || !activeModel) {
      return
    }

    decorationsDisposable.current?.()
    setDecorationsOutdated(false)

    const payloads = getDisplayedPayloads((payload) => payload.ctx.filePath === activeModel)
    const highlightedPayloadIds =
      rewindMode.active && rewindMode.currentPayloadId ? [rewindMode.currentPayloadId] : []

    decorationsDisposable.current =
      payloads.length > 0
        ? createDecorations(editorRef.current, payloads, { highlightedPayloadIds })
        : undefined
  }, [
    editorRef,
    getDisplayedPayloads,
    rewindMode.active,
    rewindMode.currentPayloadId,
    replState.activeModel,
    setDecorationsOutdated,
  ])

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
          payload.ctx.filePath === model.uri.path && payload.ctx.lineEnd === position.lineNumber
      )

      if (hoverPayloads.length === 0) {
        return
      }

      const visiblePayloads = getVisiblePayloads(
        (payload) => payload.ctx.filePath === model.uri.path
      )

      return {
        contents: renderToHoverContents(hoverPayloads, visiblePayloads),
      }
    },
    [getDisplayedPayloads, getVisiblePayloads]
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
  }, [editor])
}

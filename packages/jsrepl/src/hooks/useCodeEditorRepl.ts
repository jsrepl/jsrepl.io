import { RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import debounce, { DebouncedFunction } from 'debounce'
import * as monaco from 'monaco-editor'
import { toast } from 'sonner'
import { ReplInfoContext } from '@/context/repl-info-context'
import { UserStateContext } from '@/context/user-state-context'
import { getBundler } from '@/lib/bundler/get-bundler'
import type { CodeEditorModel } from '@/lib/code-editor-model'
import { consoleLogRepl } from '@/lib/console-utils'
import { getBabel } from '@/lib/get-babel'
import { createDecorations } from '@/lib/repl-decorations'
import { getHoverMessages } from '@/lib/repl-decorations/hover-messages'
import { onPreviewMessage } from '@/lib/repl/on-preview-message'
import { abortRepl, sendRepl } from '@/lib/repl/send-repl'
import { updatePreviewTheme } from '@/lib/repl/update-preview-theme'
import { type ReplPayload, type Theme } from '@/types'

export default function useCodeEditorRepl(
  editorRef: RefObject<monaco.editor.IStandaloneCodeEditor | null>,
  models: Map<string, InstanceType<typeof CodeEditorModel>>,
  { theme }: { theme: Theme }
) {
  const { setReplInfo } = useContext(ReplInfoContext)!
  const { userState } = useContext(UserStateContext)!

  const payloadMap = useMemo(() => new Map<number, ReplPayload>(), [])
  const allPayloads = useMemo(() => new Set<ReplPayload>(), [])
  const decorationsDisposable = useRef<() => void>()
  const previewIframe = useRef<HTMLIFrameElement>()
  const themeRef = useRef(theme)
  const [previewIframeReadyId, setPreviewIframeReadyId] = useState<string | null>(null)
  const [depsReady, setDepsReady] = useState(false)
  const bundler = useMemo(() => getBundler(), [])
  const debouncedDoRepl = useRef<DebouncedFunction<typeof doRepl>>()
  const debouncedUpdateDecorations = useRef<DebouncedFunction<typeof updateDecorations>>()

  const updateDecorations = useCallback(() => {
    const editor = editorRef.current
    const activeModel = editor?.getModel()
    if (!editor || !activeModel) {
      return
    }

    decorationsDisposable.current?.()
    const payloads = Array.from(payloadMap.values()).filter(
      (payload) => payload.ctx.filePath === activeModel.uri.path
    )
    decorationsDisposable.current =
      payloads.length > 0 ? createDecorations(editor, payloads) : undefined
  }, [editorRef, payloadMap])

  const doRepl = useCallback(async () => {
    try {
      if (!depsReady || !previewIframeReadyId) {
        return
      }

      const replInfo = await sendRepl({
        models,
        allPayloads,
        payloadMap,
        updateDecorations,
        previewIframe: previewIframe.current!,
        theme: themeRef.current,
      })

      setReplInfo(replInfo)
    } catch (e) {
      if (e === 'aborted') {
        return
      }

      const msg = `Unexpected error bundling repl: ${e instanceof Error ? e.message : 'Something went wrong'}`
      consoleLogRepl('error', msg)
      console.error(e)
      toast.error(msg, {
        duration: Infinity,
      })
    }
  }, [
    payloadMap,
    allPayloads,
    models,
    setReplInfo,
    updateDecorations,
    depsReady,
    previewIframeReadyId,
  ])

  const onMessage = useCallback(
    (event: MessageEvent) => {
      onPreviewMessage(event, {
        setPreviewIframeReadyId,
        allPayloads,
        payloadMap,
        debouncedUpdateDecorations() {
          debouncedUpdateDecorations.current?.()
        },
      })
    },
    [payloadMap, allPayloads]
  )

  useEffect(() => {
    const debounced = debounce(doRepl, 300)
    debouncedDoRepl.current = debounced

    return () => {
      debounced.clear()
    }
  }, [doRepl])

  useEffect(() => {
    const debounced = debounce(updateDecorations, 1)
    debouncedUpdateDecorations.current = debounced

    return () => {
      debounced.clear()
    }
  }, [updateDecorations])

  useEffect(() => {
    previewIframe.current = document.getElementById('preview-iframe') as HTMLIFrameElement
  }, [])

  useEffect(() => {
    return () => {
      decorationsDisposable.current?.()
      abortRepl()
    }
  }, [])

  useEffect(() => {
    const [, loadBabel] = getBabel()
    Promise.all([bundler.setup(), loadBabel()]).then(([bundlerSetupResult]) => {
      if (!bundlerSetupResult.ok) {
        toast.error('Failed to setup bundler', {
          duration: Infinity,
        })
        return
      }

      setDepsReady(true)
    })
  }, [models, bundler])

  useEffect(() => {
    if (!userState.autostartOnCodeChange) {
      return
    }

    const disposables = Array.from(models.values()).map((model) => {
      return model.monacoModel.onDidChangeContent(() => {
        debouncedDoRepl.current?.()
      })
    })

    return () => {
      disposables.forEach((disposable) => disposable.dispose())
    }
  }, [models, userState.autostartOnCodeChange])

  useEffect(() => {
    themeRef.current = theme
    if (previewIframeReadyId) {
      updatePreviewTheme(previewIframe.current!, theme)
    }
  }, [theme, previewIframeReadyId])

  useEffect(() => {
    window.addEventListener('message', onMessage)

    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [onMessage])

  useEffect(() => {
    if (depsReady && previewIframeReadyId) {
      doRepl()
    }
  }, [depsReady, previewIframeReadyId, doRepl])

  useEffect(() => {
    const onStartReplEvent = () => {
      doRepl()
    }

    window.addEventListener('jsrepl-start-repl', onStartReplEvent)

    return () => {
      window.removeEventListener('jsrepl-start-repl', onStartReplEvent)
    }
  }, [userState.autostartOnCodeChange, doRepl])

  useEffect(() => {
    const disposable = editorRef.current?.onDidChangeModel(() => {
      updateDecorations()
    })

    return () => {
      disposable?.dispose()
    }
  }, [editorRef, updateDecorations])

  useEffect(() => {
    const disposable = monaco.languages.registerHoverProvider('*', {
      provideHover(model, position /*, token, context*/) {
        const maxColumn = model.getLineMaxColumn(position.lineNumber)
        if (position.column !== maxColumn) {
          return
        }

        const hoverPayloads: ReplPayload[] = []
        for (const payload of payloadMap.values()) {
          if (
            payload.ctx.filePath === model.uri.path &&
            payload.ctx.lineStart === position.lineNumber
          ) {
            hoverPayloads.push(payload)
          }
        }

        if (hoverPayloads.length === 0) {
          return
        }

        return { contents: getHoverMessages(hoverPayloads) }
      },
    })

    return () => {
      disposable.dispose()
    }
  }, [payloadMap])
}

import { RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import debounce from 'debounce'
import * as monaco from 'monaco-editor'
import { toast } from 'sonner'
import { ReplInfoContext } from '@/context/repl-info-context'
import { getBundler } from '@/lib/bundler/get-bundler'
import type { CodeEditorModel } from '@/lib/code-editor-model'
import { consoleLogRepl } from '@/lib/console-utils'
import { createDecorations } from '@/lib/repl-decorations'
import { onPreviewMessage } from '@/lib/repl/on-preview-message'
import { sendRepl } from '@/lib/repl/send-repl'
import { updatePreviewTheme } from '@/lib/repl/update-preview-theme'
import { type ReplPayload, type Theme } from '@/types'

export default function useCodeEditorRepl(
  editorRef: RefObject<monaco.editor.IStandaloneCodeEditor | null>,
  models: Map<string, InstanceType<typeof CodeEditorModel>>,
  { theme }: { theme: Theme }
) {
  const { setReplInfo } = useContext(ReplInfoContext)!

  const payloadMap = useMemo(() => new Map<number, ReplPayload>(), [])
  const allPayloads = useMemo(() => new Set<ReplPayload>(), [])
  const decorationsDisposable = useRef<() => void>()
  const previewIframe = useRef<HTMLIFrameElement>()
  const themeRef = useRef(theme)
  const [previewIframeReadyId, setPreviewIframeReadyId] = useState<string | null>(null)
  const [depsReady, setDepsReady] = useState(false)
  const bundler = useMemo(() => getBundler(), [])

  const updateDecorations = useCallback(() => {
    const editor = editorRef.current!
    const activeModel = editorRef.current?.getModel()
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
  }, [payloadMap, allPayloads, models, setReplInfo, updateDecorations])

  const debouncedDoRepl = useMemo(() => debounce(doRepl, 300), [doRepl])

  const debouncedUpdateDecorations = useMemo(
    () => debounce(updateDecorations, 1),
    [updateDecorations]
  )

  const onMessage = useCallback(
    (event: MessageEvent) => {
      onPreviewMessage(event, {
        setPreviewIframeReadyId,
        allPayloads,
        payloadMap,
        //models,
        debouncedUpdateDecorations,
      })
    },
    [payloadMap, allPayloads, debouncedUpdateDecorations]
  )

  useEffect(() => {
    previewIframe.current = document.getElementById('preview-iframe') as HTMLIFrameElement
  }, [])

  useEffect(() => {
    return () => {
      decorationsDisposable.current?.()
    }
  }, [])

  useEffect(() => {
    return () => {
      debouncedDoRepl.clear()
    }
  }, [debouncedDoRepl])

  useEffect(() => {
    return () => {
      debouncedUpdateDecorations.clear()
    }
  }, [debouncedUpdateDecorations])

  useEffect(() => {
    bundler.setup().then((bundlerSetupResult) => {
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
    const disposables = Array.from(models.values()).map((model) => {
      return model.monacoModel.onDidChangeContent(() => {
        debouncedDoRepl()
      })
    })

    return () => {
      disposables.forEach((disposable) => disposable.dispose())
    }
  }, [models, debouncedDoRepl])

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

  return { updateDecorations }
}

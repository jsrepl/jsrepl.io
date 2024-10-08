import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import debounce from 'debounce'
import * as monaco from 'monaco-editor'
import { toast } from 'sonner'
import { getBundler } from '@/lib/bundler/get-bundler'
import type { CodeEditorModel } from '@/lib/code-editor-models/code-editor-model'
import { onPreviewMessage, sendRepl, updatePreviewTheme } from '@/lib/repl'
import { createDecorations } from '@/lib/repl-decorations'
import { type ReplPayload, type Theme } from '@/types'

export default function useCodeEditorRepl(
  editorRef: RefObject<monaco.editor.IStandaloneCodeEditor | null>,
  models: Map<string, InstanceType<typeof CodeEditorModel>>,
  {
    theme,
    onRepl,
    onReplBodyMutation,
  }: { theme: Theme; onRepl: () => void; onReplBodyMutation: () => void }
) {
  const payloadMap = useMemo(() => new Map<number, ReplPayload>(), [])
  const allPayloads = useMemo(() => new Set<ReplPayload>(), [])
  const changedModels = useMemo(() => new Set<InstanceType<typeof CodeEditorModel>>(), [])
  const decorationsDisposable = useRef<() => void>()
  const replDisposable = useRef<() => void>()
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

  // TODO: setErrors(), type Error = { text, location? }
  const doRepl = useCallback(async () => {
    try {
      replDisposable.current = await sendRepl({
        models,
        changedModels,
        allPayloads,
        payloadMap,
        updateDecorations,
        previewIframe: previewIframe.current!,
        theme: themeRef.current,
      })

      changedModels.clear()
      onRepl()
    } catch (e) {
      if (e === 'cancelled') {
        return
      }

      if (e instanceof Error) {
        toast.error(e.message, {
          duration: Infinity,
        })
      } else {
        toast.error('Something went wrong', {
          duration: Infinity,
        })
      }
    }
  }, [payloadMap, allPayloads, changedModels, models, onRepl, updateDecorations])

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

      if (event.data.type === 'body-mutation') {
        onReplBodyMutation()
      }
    },
    [payloadMap, allPayloads, debouncedUpdateDecorations, onReplBodyMutation]
  )

  useEffect(() => {
    previewIframe.current = document.getElementById('preview-iframe') as HTMLIFrameElement
  }, [])

  useEffect(() => {
    return () => {
      decorationsDisposable.current?.()
      replDisposable.current?.()
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
    models.forEach((model) => {
      changedModels.add(model)
    })

    bundler.setup().then((bundlerSetupResult) => {
      if (!bundlerSetupResult.ok) {
        toast.error('Failed to setup bundler', {
          duration: Infinity,
        })
        return
      }

      setDepsReady(true)
    })
  }, [models, changedModels, bundler])

  useEffect(() => {
    const disposables = Array.from(models.values()).map((model) => {
      return model.monacoModel.onDidChangeContent(() => {
        changedModels.add(model)
        debouncedDoRepl()
      })
    })

    return () => {
      disposables.forEach((disposable) => disposable.dispose())
    }
  }, [models, debouncedDoRepl, changedModels])

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

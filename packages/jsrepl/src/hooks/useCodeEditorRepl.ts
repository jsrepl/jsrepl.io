import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import debounce from 'debounce'
import * as monaco from 'monaco-editor'
import { CodeEditorModel } from '@/lib/code-editor-model'
import { getBabel } from '@/lib/get-babel'
import { onPreviewMessage, sendRepl, updatePreviewTheme } from '@/lib/repl'
import { createDecorations } from '@/lib/repl-decorations'
import { TsxCodeEditorModel } from '@/lib/tsx-code-editor-model'
import { type ReplPayload, type ThemeDef } from '@/types'

export default function useCodeEditorRepl(
  editorRef: RefObject<monaco.editor.IStandaloneCodeEditor | null>,
  models: Map<string, InstanceType<typeof CodeEditorModel>>,
  {
    theme,
    onRepl,
    onReplBodyMutation,
  }: { theme: ThemeDef; onRepl: () => void; onReplBodyMutation: () => void }
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
  const configureMonacoTailwindcss =
    useRef<typeof import('@nag5000/monaco-tailwindcss').configureMonacoTailwindcss>()
  const [, loadBabel] = useMemo(() => getBabel(), [])

  const updateDecorations = useCallback(() => {
    const editor = editorRef.current!
    const tsxModel = models.get('file:///index.tsx') as TsxCodeEditorModel
    if (!editor || !tsxModel || editor.getModel() !== tsxModel.monacoModel) {
      return
    }

    decorationsDisposable.current?.()
    const payloads = Array.from(payloadMap.values())
    decorationsDisposable.current = createDecorations(editor, payloads)
  }, [editorRef, models, payloadMap])

  const doRepl = useCallback(async () => {
    try {
      replDisposable.current = await sendRepl({
        models,
        configureMonacoTailwindcss: configureMonacoTailwindcss.current!,
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
      if (e !== 'cancelled') {
        throw e
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
        models,
        debouncedUpdateDecorations,
      })

      if (event.data.type === 'body-mutation') {
        onReplBodyMutation()
      }
    },
    [payloadMap, allPayloads, debouncedUpdateDecorations, models, onReplBodyMutation]
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

    Promise.all([loadBabel(), import('@nag5000/monaco-tailwindcss')]).then(
      ([, { configureMonacoTailwindcss: _configureMonacoTailwindcss }]) => {
        configureMonacoTailwindcss.current = _configureMonacoTailwindcss
        console.log('deps ready')
        setDepsReady(true)
      }
    )
  }, [loadBabel, models, changedModels])

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

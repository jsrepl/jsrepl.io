import { createElement, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { type Theme } from '@jsrepl/shared-types'
import debounce, { DebouncedFunction } from 'debounce'
import * as monaco from 'monaco-editor'
import { toast } from 'sonner'
import ToastDescriptionCopiedToClipboard from '@/components/toast-description-copied-to-clipboard'
import { ReplInfoContext } from '@/context/repl-info-context'
import { ReplPayloadsContext } from '@/context/repl-payloads-context'
import { UserStateContext } from '@/context/user-state-context'
import { getBundler } from '@/lib/bundler/get-bundler'
import type { CodeEditorModel } from '@/lib/code-editor-model'
import { consoleLogRepl } from '@/lib/console-utils'
import { getBabel } from '@/lib/get-babel'
import { renderToJSONString } from '@/lib/repl-payload/render-json'
import { renderToMockObject } from '@/lib/repl-payload/render-mock-object'
import { renderToText } from '@/lib/repl-payload/render-text'
import { replDataRef } from '@/lib/repl/data'
import { onPreviewMessage } from '@/lib/repl/on-preview-message'
import { abortRepl, sendRepl } from '@/lib/repl/send-repl'
import { updatePreviewTheme } from '@/lib/repl/update-preview-theme'
import useReplDecorations from './useReplDecorations'

export default function useCodeEditorRepl(
  models: Map<string, InstanceType<typeof CodeEditorModel>>,
  { theme }: { theme: Theme }
) {
  const { userState } = useContext(UserStateContext)!
  const { setReplInfo } = useContext(ReplInfoContext)!
  const { addPayload, refreshPayloads, payloads } = useContext(ReplPayloadsContext)!

  useReplDecorations()

  const previewIframe = useRef<HTMLIFrameElement>()
  const themeRef = useRef(theme)
  const [previewIframeReadyId, setPreviewIframeReadyId] = useState<string | null>(null)
  const [depsReady, setDepsReady] = useState(false)
  const debouncedDoRepl = useRef<DebouncedFunction<typeof doRepl>>()

  const doRepl = useCallback(async () => {
    try {
      if (!depsReady || !previewIframeReadyId) {
        return
      }

      const replInfo = await sendRepl({
        models,
        addPayload,
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
  }, [addPayload, models, setReplInfo, depsReady, previewIframeReadyId])

  const onMessage = useCallback(
    (event: MessageEvent) => {
      onPreviewMessage(event, {
        setPreviewIframeReadyId,
        addPayload,
        refreshPayloads,
      })
    },
    [addPayload, refreshPayloads]
  )

  useEffect(() => {
    const debounced = debounce(doRepl, 300)
    debouncedDoRepl.current = debounced

    return () => {
      debounced.clear()
    }
  }, [doRepl])

  useEffect(() => {
    previewIframe.current = document.getElementById('preview-iframe') as HTMLIFrameElement
  }, [])

  useEffect(() => {
    return () => {
      abortRepl()
    }
  }, [])

  useEffect(() => {
    const [, loadBabel] = getBabel()
    Promise.all([getBundler().setup(), loadBabel()]).then(([bundlerSetupResult]) => {
      if (!bundlerSetupResult.ok) {
        toast.error('Failed to setup bundler', {
          duration: Infinity,
        })
        return
      }

      setDepsReady(true)
    })
  }, [])

  useEffect(() => {
    if (!userState.autostartOnCodeChange) {
      return
    }

    const disposables = Array.from(models.values()).map((model) => {
      return model.monacoModel.onDidChangeContent(() => {
        updateToken()
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
    updateToken()
    doRepl()
  }, [doRepl])

  useEffect(() => {
    const onStartReplEvent = () => {
      updateToken()
      doRepl()
    }

    window.addEventListener('jsrepl-restart-repl', onStartReplEvent)

    return () => {
      window.removeEventListener('jsrepl-restart-repl', onStartReplEvent)
    }
  }, [doRepl])

  useEffect(() => {
    const disposable = monaco.editor.registerCommand(
      'jsrepl.copyPayloadAsText',
      async (accessor, payloadId: string, showNotification: boolean) => {
        const payload = payloads.find((payload) => payload.id === payloadId)
        if (!payload) {
          return
        }

        let text: string
        try {
          text = renderToText(payload)
          await navigator.clipboard.writeText(text)
        } catch (e) {
          toast.error('Failed to copy snapshot as text', {
            description: e instanceof Error ? e.message : undefined,
            duration: 2000,
          })

          return
        }

        if (showNotification) {
          toast.success('Copied to clipboard', {
            description: createElement(ToastDescriptionCopiedToClipboard, { text }),
            duration: 2000,
          })
        }
      }
    )

    return () => {
      disposable.dispose()
    }
  }, [payloads])

  useEffect(() => {
    const disposable = monaco.editor.registerCommand(
      'jsrepl.copyPayloadAsJSON',
      async (accessor, payloadId: string, showNotification: boolean) => {
        const payload = payloads.find((payload) => payload.id === payloadId)
        console.log('test')
        if (!payload) {
          return
        }

        let text: string
        try {
          text = renderToJSONString(payload, 2)
          await navigator.clipboard.writeText(text)
        } catch (e) {
          toast.error('Failed to copy snapshot as JSON', {
            description: e instanceof Error ? e.message : undefined,
            duration: 2000,
          })

          return
        }

        if (showNotification) {
          toast.success('Copied to clipboard', {
            description: createElement(ToastDescriptionCopiedToClipboard, { text }),
            duration: 2000,
          })
        }
      }
    )

    return () => {
      disposable.dispose()
    }
  }, [payloads])

  useEffect(() => {
    const disposable = monaco.editor.registerCommand(
      'jsrepl.dumpPayloadAsMockObjectToConsole',
      async (accessor, payloadId: string, showNotification: boolean) => {
        const payload = payloads.find((payload) => payload.id === payloadId)
        if (!payload) {
          return
        }

        let obj: unknown
        try {
          obj = renderToMockObject(payload)
        } catch (e) {
          toast.error('Failed to dump snapshot value', {
            description: e instanceof Error ? e.message : undefined,
            duration: 2000,
          })

          return
        }

        let suffix = 1
        while (`tmp${suffix}` in window) {
          suffix++
        }

        const varName = `tmp${suffix}`

        // @ts-expect-error -- I don't care
        window[varName] = obj

        // eslint-disable-next-line no-console
        console.log(varName)
        const isChrome = 'chrome' in window && navigator.userAgent.includes('Chrome')
        const isSafari = 'safari' in window && navigator.userAgent.includes('Safari')
        if (isChrome || isSafari) {
          // eslint-disable-next-line no-console
          console.log('%o', obj)
        } else {
          // eslint-disable-next-line no-console
          console.log(typeof obj === 'string' ? JSON.stringify(obj) : obj)
        }

        if (showNotification) {
          toast.success('Snapshot dumped to console', {
            description: createElement('pre', null, `↪ window.${varName}`),
            duration: 2000,
          })
        }
      }
    )

    return () => {
      disposable.dispose()
    }
  }, [payloads])
}

function updateToken() {
  replDataRef.current = {
    token: (replDataRef.current.token + 1) % Number.MAX_VALUE,
  }
}

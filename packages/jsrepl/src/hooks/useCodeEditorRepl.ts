import { useCallback, useEffect, useRef, useState } from 'react'
import { type Theme } from '@jsrepl/shared-types'
import { toast } from 'sonner'
import { getBundler } from '@/lib/bundler/get-bundler'
import type { CodeEditorModel } from '@/lib/code-editor-model'
import { consoleLogRepl } from '@/lib/console-utils'
import { getBabel } from '@/lib/get-babel'
import { replDataRef } from '@/lib/repl/data'
import { onPreviewMessage } from '@/lib/repl/on-preview-message'
import { abortRepl, sendRepl } from '@/lib/repl/send-repl'
import { updatePreviewTheme } from '@/lib/repl/update-preview-theme'
import { useMonacoCopyPayloadAsJSONCommand } from './monaco-commands/useMonacoCopyPayloadAsJSONCommand'
import { useMonacoCopyPayloadAsTextCommand } from './monaco-commands/useMonacoCopyPayloadAsTextCommand'
import { useMonacoDumpPayloadAsMockObjectToConsoleCommand } from './monaco-commands/useMonacoDumpPayloadAsMockObjectToConsoleCommand'
import { useMonacoDumpPayloadHistoryToConsoleCommand } from './monaco-commands/useMonacoDumpPayloadHistoryToConsoleCommand'
import useReplDecorations from './useReplDecorations'
import { useReplInfo } from './useReplInfo'
import { useReplPayloads } from './useReplPayloads'
import { useUserStoredState } from './useUserStoredState'

export default function useCodeEditorRepl(
  models: Map<string, InstanceType<typeof CodeEditorModel>>,
  { theme }: { theme: Theme }
) {
  const [userState] = useUserStoredState()
  const [, setReplInfo] = useReplInfo()
  const { addPayload, refreshPayloads } = useReplPayloads()

  useReplDecorations()
  useMonacoCopyPayloadAsTextCommand()
  useMonacoCopyPayloadAsJSONCommand()
  useMonacoDumpPayloadAsMockObjectToConsoleCommand()
  useMonacoDumpPayloadHistoryToConsoleCommand()

  const previewIframe = useRef<HTMLIFrameElement>(undefined)
  const themeRef = useRef(theme)
  const [previewIframeReadyId, setPreviewIframeReadyId] = useState<string | null>(null)
  const [depsReady, setDepsReady] = useState(false)

  const doRepl = useCallback(async () => {
    try {
      if (!depsReady || !previewIframeReadyId) {
        return
      }

      updateToken()

      const replInfo = await sendRepl({
        models,
        addPayload,
        previewIframe: previewIframe.current!,
        theme: themeRef.current,
        packageProvider: userState.packageProvider,
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
  }, [addPayload, models, setReplInfo, depsReady, previewIframeReadyId, userState.packageProvider])

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

  const autostartOnCodeChangeRef = useRef(userState.autostartOnCodeChange)
  useEffect(() => {
    autostartOnCodeChangeRef.current = userState.autostartOnCodeChange
  }, [userState.autostartOnCodeChange])

  useEffect(() => {
    // Auto-start repl for the first time or when autostartOnCodeChange is enabled
    if (autostartOnCodeChangeRef.current || replDataRef.current.token === 0) {
      doRepl()
    }
  }, [doRepl])

  useEffect(() => {
    window.addEventListener('jsrepl-restart-repl', doRepl)

    return () => {
      window.removeEventListener('jsrepl-restart-repl', doRepl)
    }
  }, [doRepl])
}

function updateToken() {
  replDataRef.current = {
    token: (replDataRef.current.token + 1) % Number.MAX_SAFE_INTEGER,
  }
}

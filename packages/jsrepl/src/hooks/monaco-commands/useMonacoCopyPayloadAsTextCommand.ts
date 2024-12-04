import { createElement, useCallback, useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'
import { toast } from 'sonner'
import ToastDescriptionCopiedToClipboard from '@/components/toast-description-copied-to-clipboard'
import { renderToText } from '@/lib/repl-payload/render-text'
import { useReplPayloads } from '../useReplPayloads'

export function useMonacoCopyPayloadAsTextCommand() {
  const { payloads } = useReplPayloads()

  const callback = useCallback(
    async (payloadId: string, showNotification: boolean) => {
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
    },
    [payloads]
  )

  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const disposable = monaco.editor.registerCommand(
      'jsrepl.copyPayloadAsText',
      async (accessor, payloadId: string, showNotification: boolean) => {
        await callbackRef.current(payloadId, showNotification)
      }
    )

    return () => {
      disposable.dispose()
    }
  }, [])
}

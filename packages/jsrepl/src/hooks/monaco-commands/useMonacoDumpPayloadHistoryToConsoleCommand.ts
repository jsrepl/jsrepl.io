import { useCallback, useEffect, useRef } from 'react'
import { ReplPayload } from '@jsrepl/shared-types'
import * as monaco from 'monaco-editor'
import { toast } from 'sonner'
import { formatTimestamp } from '@/lib/repl-payload/payload-utils'
import { renderToMockObject } from '@/lib/repl-payload/render-mock-object'
import { useReplPayloads } from '../useReplPayloads'
import { useReplRewindMode } from '../useReplRewindMode'

export function useMonacoDumpPayloadHistoryToConsoleCommand() {
  const { payloads } = useReplPayloads()
  const [rewindMode] = useReplRewindMode()

  const callback = useCallback(
    (ctxId: string, showNotification: boolean) => {
      let visiblePayloads: ReplPayload[]
      if (rewindMode.active && rewindMode.currentPayloadId) {
        const currentPayloadIndex = payloads.findIndex(
          (payload) => payload.id === rewindMode.currentPayloadId
        )
        visiblePayloads =
          currentPayloadIndex !== -1 ? payloads.slice(0, currentPayloadIndex + 1) : payloads
      } else {
        visiblePayloads = payloads
      }

      const ctxPayloads = visiblePayloads.filter((payload) => payload.ctx.id === ctxId)

      let arr: { timestamp: string; value: unknown }[]
      try {
        arr = ctxPayloads.map((payload) => ({
          timestamp: formatTimestamp(payload.timestamp),
          value: renderToMockObject(payload),
        }))
      } catch (e) {
        toast.error('Failed to dump snapshot history', {
          description: e instanceof Error ? e.message : undefined,
          duration: 2000,
        })

        return
      }

      // eslint-disable-next-line no-console
      console.group('REPL SNAPSHOT HISTORY:', ctxPayloads[0]?.ctx.source, `(${ctxPayloads.length})`)
      arr.forEach(({ timestamp, value }, index) => {
        // eslint-disable-next-line no-console
        console.log(`${(index + 1).toString().padStart(3)}. [${timestamp}]`, value)
      })
      // eslint-disable-next-line no-console
      console.groupEnd()

      if (showNotification) {
        toast.success('Snapshot history dumped to console', {
          duration: 2000,
        })
      }
    },
    [payloads, rewindMode.active, rewindMode.currentPayloadId]
  )

  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const disposable = monaco.editor.registerCommand(
      'jsrepl.dumpPayloadHistoryToConsole',
      (accessor, ctxId: string, showNotification: boolean) => {
        callbackRef.current(ctxId, showNotification)
      }
    )

    return () => {
      disposable.dispose()
    }
  }, [])
}

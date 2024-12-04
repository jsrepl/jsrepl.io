import { createElement, useCallback, useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'
import { toast } from 'sonner'
import { renderToMockObject } from '@/lib/repl-payload/render-mock-object'
import { useReplPayloads } from '../useReplPayloads'

export function useMonacoDumpPayloadAsMockObjectToConsoleCommand() {
  const { payloads } = useReplPayloads()

  const callback = useCallback(
    (payloadId: string, showNotification: boolean) => {
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

      const varName = dumpObject(obj)

      if (showNotification) {
        toast.success('Snapshot dumped to console', {
          description: createElement('pre', null, `↪ window.${varName}`),
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
      'jsrepl.dumpPayloadAsMockObjectToConsole',
      (accessor, payloadId: string, showNotification: boolean) => {
        callbackRef.current(payloadId, showNotification)
      }
    )

    return () => {
      disposable.dispose()
    }
  }, [])
}

function dumpObject(obj: unknown) {
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

  return varName
}

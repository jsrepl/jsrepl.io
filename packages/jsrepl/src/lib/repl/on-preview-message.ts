import { type Dispatch, type SetStateAction } from 'react'
import type debounce from 'debounce'
import { getOriginalPosition } from '@/lib/sourcemap-utils'
import { type ReplPayload } from '@/types'
import { replDataRef } from './data'

const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL!

export function onPreviewMessage(
  event: MessageEvent,
  {
    setPreviewIframeReadyId,
    allPayloads,
    payloadMap,
    //models,
    debouncedUpdateDecorations,
  }: {
    setPreviewIframeReadyId: Dispatch<SetStateAction<string | null>>
    allPayloads: Set<ReplPayload>
    payloadMap: Map<number | string, ReplPayload>
    //models: Map<string, CodeEditorModel>
    debouncedUpdateDecorations: debounce.DebouncedFunction<() => void>
  }
) {
  if (
    event.origin === previewUrl &&
    event.data?.source === 'jsreplPreview' &&
    event.data.type === 'ready' &&
    event.data.token === -1
  ) {
    setPreviewIframeReadyId(event.data.previewId as string)
    return
  }

  if (
    event.origin === previewUrl &&
    event.data?.source === 'jsreplPreview' &&
    event.data.token === replDataRef.current.token
  ) {
    if (event.data.type === 'repl') {
      const payload = event.data.payload as ReplPayload

      if (payload.ctx.kind === 'window-error') {
        // const babel = getBabel()[0].value!
        // const tsxModel = models.get('/index.tsx') as TsxCodeEditorModel
        //const { sourcemap } = tsxModel.getBabelTransformResult(babel)

        // base64 url -> output file path
        const filePath = Array.from(replDataRef.current.output?.js.entries() ?? []).find(
          ([, { url }]) => url === payload.ctx.filePath
        )?.[0]
        const sourcemap = filePath
          ? replDataRef.current.bundle?.result?.outputFiles?.find(
              (x) => x.path === filePath + '.map'
            )?.text
          : undefined

        if (sourcemap) {
          const { line, column, source } = getOriginalPosition(
            sourcemap,
            payload.ctx.lineStart,
            payload.ctx.colStart
          )

          if (line && source) {
            payload.ctx.lineStart = line
            payload.ctx.lineEnd = line
            payload.ctx.colStart = column ?? 1
            payload.ctx.colEnd = column ?? 1
            payload.ctx.filePath = '/' + source

            allPayloads.add(payload)
            payloadMap.set(payload.ctx.id, payload)
          }
        }
      } else {
        allPayloads.add(payload)
        payloadMap.set(payload.ctx.id, payload)
      }
    }

    if (event.data.type === 'repl' || event.data.type === 'script-complete') {
      // clearTimeout(delayedUpdateDecorationsTimeoutId)
      debouncedUpdateDecorations()
    }
  }
}

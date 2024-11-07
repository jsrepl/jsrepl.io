import { type Dispatch, type SetStateAction } from 'react'
import {
  type ReplPayload,
  ReplPayloadMessageData,
  ReplStatusMessageData,
} from '@jsrepl/shared-types'
import { getOriginalPosition } from '@/lib/sourcemap-utils'
import { replDataRef } from './data'

const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL!

export function onPreviewMessage(
  event: MessageEvent,
  {
    setPreviewIframeReadyId,
    addPayload,
    refreshPayloads,
  }: {
    setPreviewIframeReadyId: Dispatch<SetStateAction<string | null>>
    addPayload: (token: number | string, payload: ReplPayload) => void
    refreshPayloads: (token: number | string) => void
  }
) {
  if (!validateEvent(event)) {
    return
  }

  const { data } = event

  if (data.type === 'ready' && data.token === -1) {
    setPreviewIframeReadyId(data.previewId)
  }

  if (data.type === 'repl' && data.token === replDataRef.current.token) {
    const { payload } = data

    if (payload.ctx.kind === 'window-error') {
      if (resolveErrorLocation(payload)) {
        addPayload(data.token, payload)
      }
    } else {
      addPayload(data.token, payload)
    }
  }

  if (
    (data.type === 'repl' || data.type === 'script-complete') &&
    data.token === replDataRef.current.token
  ) {
    refreshPayloads(data.token)
  }
}

function validateEvent(
  event: MessageEvent<unknown>
): event is MessageEvent<ReplPayloadMessageData | ReplStatusMessageData> {
  return (
    event.origin === previewUrl &&
    event.data !== null &&
    typeof event.data === 'object' &&
    'source' in event.data &&
    event.data.source === 'jsreplPreview'
  )
}

function resolveErrorLocation(payload: ReplPayload): boolean {
  const filePath = payload.ctx.filePath

  const outputFiles = replDataRef.current.bundle?.result?.outputFiles
  const sourcemap = filePath
    ? outputFiles?.find((x) => x.path === filePath + '.map')?.text
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

      return true
    }
  }

  const fileExists = outputFiles?.some((x) => x.path === filePath)
  if (fileExists) {
    payload.ctx.filePath = filePath
    return true
  }

  return false
}

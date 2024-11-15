import { type Dispatch, type SetStateAction } from 'react'
import {
  IReplPayload,
  type ReplPayload,
  ReplPayloadContextKind,
  ReplPayloadContextMessageData,
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

  if (
    data.type === 'repl-payload-context' &&
    data.token === replDataRef.current.token &&
    replDataRef.current.bundle
  ) {
    replDataRef.current.bundle.replMeta.ctxMap.set(data.ctx.id, data.ctx)
  }

  if (
    data.type === 'repl-payload' &&
    data.token === replDataRef.current.token &&
    replDataRef.current.bundle
  ) {
    const ctx = replDataRef.current.bundle.replMeta.ctxMap.get(data.payload.ctxId)
    if (!ctx) {
      return
    }

    const payload = {
      id: data.payload.id,
      isError: data.payload.isError,
      result: data.payload.result,
      timestamp: data.payload.timestamp,
      ctx,
    } satisfies IReplPayload as ReplPayload

    if (payload.ctx.kind === ReplPayloadContextKind.WindowError) {
      if (resolveErrorLocation(payload)) {
        addPayload(data.token, payload)
      }
    } else {
      addPayload(data.token, payload)
    }
  }

  if (
    (data.type === 'repl-payload' ||
      data.type === 'repl-payload-context' ||
      data.type === 'script-complete') &&
    data.token === replDataRef.current.token
  ) {
    refreshPayloads(data.token)
  }
}

function validateEvent(
  event: MessageEvent<unknown>
): event is MessageEvent<
  ReplPayloadMessageData | ReplPayloadContextMessageData | ReplStatusMessageData
> {
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

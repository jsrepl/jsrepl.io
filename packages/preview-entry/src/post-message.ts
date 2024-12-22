import {
  ReplPayloadContext,
  ReplPayloadContextId,
  ReplPayloadContextMessageData,
  ReplPayloadMessageData,
  ReplStatusMessageData,
} from '@jsrepl/shared-types'
import { transformPayloadResult } from './payload'
import { previewId } from './preview-id'
import { PreviewWindow } from './types'

const JSREPL_ORIGIN = __JSREPL_ORIGIN__

export function postMessage(
  token: number,
  data:
    | Pick<ReplPayloadMessageData, 'type' | 'payload'>
    | Pick<ReplPayloadContextMessageData, 'type' | 'ctx'>
    | Pick<ReplStatusMessageData, 'type'>
) {
  const baseProps = {
    source: 'jsreplPreview' as const,
    previewId,
    token,
  }

  let message: ReplPayloadMessageData | ReplPayloadContextMessageData | ReplStatusMessageData
  if (data.type === 'repl-payload') {
    message = { ...baseProps, type: data.type, payload: data.payload }
  } else if (data.type === 'repl-payload-context') {
    message = { ...baseProps, type: data.type, ctx: data.ctx }
  } else {
    message = { ...baseProps, type: data.type }
  }

  try {
    window.top!.postMessage(message, JSREPL_ORIGIN)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'DataCloneError') {
      console.error('JSRepl Error: DataCloneError on postMessage', data)
      return
    }

    console.error('JSRepl Error: unknown error on postMessage', err)
  }
}

export function postMessageRepl(
  token: number,
  win: PreviewWindow,
  result: unknown,
  isError: boolean,
  ctxId: ReplPayloadContextId
) {
  postMessage(token, {
    type: 'repl-payload',
    payload: {
      id: crypto.randomUUID(),
      isError,
      result: transformPayloadResult(win, result),
      timestamp: Date.now(),
      ctxId,
    },
  })
}

export function postMessageReplContext(token: number, ctx: ReplPayloadContext) {
  postMessage(token, {
    type: 'repl-payload-context',
    ctx,
  })
}

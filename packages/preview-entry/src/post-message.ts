import {
  ReplPayloadContextMessageData,
  ReplPayloadMessageData,
  ReplStatusMessageData,
} from '@jsrepl/shared-types'
import { previewId } from './preview-id'

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

import { ReplPayload } from '../../jsrepl/src/types'
import { previewId } from './preview-id'

const JSREPL_ORIGIN = __JSREPL_ORIGIN__

export function postMessage(
  token: number,
  data: { type: 'repl'; payload: ReplPayload } | { type: 'ready' } | { type: 'script-complete' }
) {
  try {
    window.top!.postMessage(
      {
        source: 'jsreplPreview',
        previewId,
        token,
        type: data.type,
        payload: data.type === 'repl' ? data.payload : undefined,
      },
      JSREPL_ORIGIN
    )
  } catch (err) {
    if (err instanceof DOMException && err.name === 'DataCloneError') {
      console.error('JSRepl Error: DataCloneError on postMessage', data)
      return
    }

    console.error('JSRepl Error: unknown error on postMessage', err)
  }
}

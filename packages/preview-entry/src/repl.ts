import {
  ReplPayloadContext,
  ReplPayloadContextId,
  ReplPayloadContextKind,
  ReplPayloadContextWindowError,
  identifierNameFunctionMeta,
  identifierNameRepl,
} from '@jsrepl/shared-types'
import { transformPayloadResult } from './payload'
import { postMessage } from './post-message'
import type { PreviewWindow } from './types'

export function setupRepl(win: PreviewWindow, token: number) {
  win[identifierNameRepl] = repl.bind({ token, win })
  win[identifierNameFunctionMeta] = () => {}

  win.addEventListener('error', (event) => {
    onWindowError(event, token)
  })
}

function repl(this: { token: number; win: PreviewWindow }, ctxId: string | number, value: unknown) {
  const { token, win } = this
  postMessageRepl(token, win, value, false, ctxId)
  return value
}

function postMessageRepl(
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
      ctxId,
    },
  })
}

function postMessageReplContext(token: number, ctx: ReplPayloadContext) {
  postMessage(token, {
    type: 'repl-payload-context',
    ctx,
  })
}

function onWindowError(event: ErrorEvent, token: number) {
  const error = event.error
  const win = event.target as PreviewWindow

  let filePath = event.filename
  if (filePath.startsWith('data:')) {
    // base64 url -> bundle output file path
    filePath =
      Array.from(win.document.scripts).find((script) => script.src === event.filename)?.dataset
        .path ?? ''
  } else if (filePath === 'about:srcdoc') {
    filePath = '/index.html'
  }

  const ctx: ReplPayloadContextWindowError = {
    id: `window-error-${event.filename}-${event.lineno}:${event.colno}`,
    // Normally lineno and colno start with 1.
    // There are edge cases where they might appear as zero, which usually indicates that the browser couldn't
    // determine the exact location of the error. For example, SecurityError case when trying to evaluate
    // "window.top.location.href", in that case lineno is 0, colno is 0 (Google Chrome).
    // Later they will be resolved to the original position taking into account
    // the sourcemap (see the handler for the kind 'window-error').
    lineStart: event.lineno === 0 ? 1 : event.lineno,
    lineEnd: event.lineno === 0 ? 1 : event.lineno,
    colStart: event.colno === 0 ? 1 : event.colno,
    colEnd: event.colno === 0 ? 1 : event.colno,
    source: '',
    // Will be resolved to the original filePath taking into account the sourcemap.
    filePath,
    kind: ReplPayloadContextKind.WindowError,
  }

  postMessageReplContext(token, ctx)
  postMessageRepl(token, win, error, true, ctx.id)
}

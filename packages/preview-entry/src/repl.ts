import { ReplPayload } from '../../jsrepl/src/types'
import { transformPayload } from './payload'
import { postMessage } from './post-message'
import type { PreviewWindow } from './types'

export function setupRepl(win: PreviewWindow, token: number) {
  win.__r = repl.bind({ token, win })

  win.addEventListener('error', (event) => {
    onWindowError(event, token)
  })
}

function repl(
  this: { token: number; win: PreviewWindow },
  ctx: ReplPayload['ctx'],
  ...args: unknown[]
) {
  const { token, win } = this

  switch (ctx.kind) {
    case 'expression': {
      const value = args[0]
      postMessageRepl(token, win, value, false, ctx)
      return value
    }

    case 'variable': {
      const value = args[0]
      postMessageRepl(token, win, value, false, ctx)
      return value
    }

    case 'console-log':
    case 'console-debug':
    case 'console-info':
    case 'console-warn':
    case 'console-error': {
      postMessageRepl(token, win, args, false, ctx)
      return args
    }

    default:
      throw new Error('JSRepl Error. Unhandled ctx kind: ' + ctx.kind)
  }
}

function postMessageRepl(
  token: number,
  win: PreviewWindow,
  result: unknown,
  isError: boolean,
  ctx: ReplPayload['ctx']
) {
  const isPromise = checkIsPromise(result)
  postMessage(token, {
    type: 'repl',
    payload: transformPayload(win, {
      isPromise,
      promiseInfo: isPromise ? { status: 'pending' } : undefined,
      isError,
      rawResult: isPromise ? undefined : result,
      ctx,
    }),
  })

  if (isPromise) {
    result.then(
      (resolvedValue) => {
        postMessage(token, {
          type: 'repl',
          payload: transformPayload(win, {
            isPromise: true,
            promiseInfo: { status: 'fulfilled' },
            isError: false,
            rawResult: resolvedValue,
            ctx,
          }),
        })
      },
      (error) => {
        postMessage(token, {
          type: 'repl',
          payload: transformPayload(win, {
            isPromise: true,
            promiseInfo: { status: 'rejected' },
            isError: true,
            rawResult: error,
            ctx,
          }),
        })
      }
    )
  }
}

function checkIsPromise<T, S>(value: PromiseLike<T> | S): value is PromiseLike<T> {
  return (
    !!value &&
    (typeof value === 'object' || typeof value === 'function') &&
    'then' in value &&
    typeof value.then === 'function'
  )
}

function onWindowError(event: ErrorEvent, token: number) {
  const error = event.error
  const win = event.target as PreviewWindow

  const filePath = event.filename.startsWith('data:')
    ? // base64 url -> bundle output file path
      Array.from(win.document.scripts).find((script) => script.src === event.filename)?.dataset
        .path ?? ''
    : event.filename

  postMessageRepl(token, win, error, true, {
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
    kind: 'window-error',
  })
}

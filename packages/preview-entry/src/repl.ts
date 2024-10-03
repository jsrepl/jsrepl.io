import { ReplPayload } from '../../jsrepl/src/types'
import { transformPayload } from './payload'
import { postMessage } from './post-message'
import type { PreviewWindow } from './types'

export function setupRepl(win: PreviewWindow, token: number) {
  win.__r = repl.bind({ token, win })

  win.addEventListener('error', (event) => {
    const userScriptLineNo =
      win.document.documentElement.outerHTML
        .split('\n')
        .findIndex((line) => line.includes('<script id="repl-script"')) + 1
    onWindowError(event, token, userScriptLineNo)
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

function onWindowError(event: ErrorEvent, token: number, userScriptLineNo: number) {
  const error = event.error
  const win = event.target as PreviewWindow

  let lineno: number | undefined
  let colno: number | undefined

  // Normally lineno starts with 1, colno starts with 0 (FIXME: colno starts with 1?)
  // There are edge cases where they might appear as zero, which usually indicates that the browser couldn't
  // determine the exact location of the error. For example, SecurityError case when trying to evaluate
  // "window.top.location.href", in that case lineno is 0, colno is 0 (Google Chrome).
  if (
    event.filename === 'about:srcdoc' &&
    event.lineno != null &&
    event.lineno > 0 &&
    event.colno != null
  ) {
    lineno = event.lineno - userScriptLineNo
    colno = event.colno
  } else {
    const stacktrace = event.error?.stack ?? ''
    const match = stacktrace.match(/about:srcdoc:(\d+):(\d+)/)
    if (match) {
      lineno = Number(match[1]) - userScriptLineNo
      colno = Number(match[2])
    }
  }

  postMessageRepl(token, win, error, true, {
    id: -1,
    // Later it will be resolved to the original position taking into account
    // the sourcemap (see the handler for the kind 'error').
    lineStart: lineno ?? 1,
    lineEnd: lineno ?? 1,
    colStart: colno ?? 0,
    colEnd: colno ?? 0,
    source: 'window.onerror',
    kind: 'error',
  })
}

import { identifierNameFunctionMeta, identifierNameRepl } from '@jsrepl/shared-types'
import { postMessageRepl } from './post-message'
import { setupProxyProxy } from './repl/proxy-proxy'
import { setupWindowErrorHandler } from './repl/window-error'
import type { PreviewWindow } from './types'

// Traversing the object props in `transformPayloadResult` can cause calling `repl`
// again in some cases, which is not desired and may cause infinite recursion which
// is not handled by circular reference prevention mechanism in `transformPayloadResult`.
// Although that mechanism can be extended to the entire event loop stack, these
// side-effects are not the intended behavior anyway: `repl` is intended to be
// called by user-code only, and not during traversing the object props within `transformPayloadResult`.
// See https://github.com/jsrepl/jsrepl.io/issues/3 for the reference.
let skipReplAsSideEffect = false

export function setupRepl(win: PreviewWindow, token: number) {
  win[identifierNameRepl] = repl.bind({ token, win })
  win[identifierNameFunctionMeta] = () => {}
  setupWindowErrorHandler(win, token)
  setupProxyProxy(win)
}

function repl(this: { token: number; win: PreviewWindow }, ctxId: string | number, value: unknown) {
  if (!skipReplAsSideEffect) {
    skipReplAsSideEffect = true
    try {
      const { token, win } = this
      postMessageRepl(token, win, value, false, ctxId)
    } catch (err) {
      console.error('JSRepl Error: repl failed', err)
    } finally {
      skipReplAsSideEffect = false
    }
  }

  return value
}

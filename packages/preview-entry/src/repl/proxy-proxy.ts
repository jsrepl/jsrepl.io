import { ProxyMetadata, identifierNameProxyMap } from '@jsrepl/shared-types'
import { PreviewWindow } from '../types'

export function setupProxyProxy(win: PreviewWindow) {
  win[identifierNameProxyMap] = new WeakMap<object, ProxyMetadata>()

  win.Proxy = new win.Proxy(win.Proxy, {
    construct(target, args: [object, ProxyHandler<object>]) {
      const proxy = new target(...args)
      win[identifierNameProxyMap].set(proxy, { target: args[0], handler: args[1] })
      return proxy
    },
  })
}

/**
 * Returns a proxy metadata if the value is a proxy object
 * and it has been catched by overriden `Proxy` constructor.
 *
 * `undefined` otherwise.
 */
export function getProxyMetadata(win: PreviewWindow, value: unknown): ProxyMetadata | undefined {
  return typeof value === 'object' && value !== null
    ? win[identifierNameProxyMap]?.get(value)
    : undefined
}

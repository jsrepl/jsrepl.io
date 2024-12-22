import { ReplPayloadContext, ReplPayloadContextId } from './repl-payload-context'

export type ReplMeta = {
  ctxMap: Map<ReplPayloadContextId, ReplPayloadContext>
}

export type ProxyMetadata = {
  target: object
  handler: ProxyHandler<object>
}

export const identifierNameRepl = '__repl'
export const identifierNameFunctionMeta = '__repl_fn'
export const identifierNameProxyMap = '__repl_proxy_map'

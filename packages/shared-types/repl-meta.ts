import { ReplPayloadContext, ReplPayloadContextId } from './repl-payload-context'

export type ReplMeta = {
  ctxMap: Map<ReplPayloadContextId, ReplPayloadContext>
}

export const identifierNameRepl = '__repl'
export const identifierNameFunctionMeta = '__repl_fn'

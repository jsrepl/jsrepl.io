import { ReplPayload } from './repl-payload'
import { ReplPayloadContext, ReplPayloadContextId } from './repl-payload-context'
import { Theme } from './theme'

export type UpdateReplMessageData = {
  source: 'jsrepl'
  type: 'repl'
  token: number
  srcdoc: string
}

export type UpdateThemeMessageData = {
  source: 'jsrepl'
  type: 'update-theme'
  theme: Pick<Theme, 'id' | 'isDark'>
}

export type ReplPayloadMessageData = {
  source: 'jsreplPreview'
  previewId: string
  token: number
  type: 'repl-payload'
  payload: Omit<ReplPayload, 'ctx'> & { ctxId: ReplPayloadContextId }
}

export type ReplPayloadContextMessageData = {
  source: 'jsreplPreview'
  previewId: string
  token: number
  type: 'repl-payload-context'
  ctx: ReplPayloadContext
}

export type ReplStatusMessageData = {
  source: 'jsreplPreview'
  previewId: string
  token: number
  type: 'ready' | 'script-complete'
}

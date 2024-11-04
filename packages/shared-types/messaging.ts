import { ReplPayload } from './repl-payload'
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
  type: 'repl'
  payload: ReplPayload
}

export type ReplStatusMessageData = {
  source: 'jsreplPreview'
  previewId: string
  token: number
  type: 'ready' | 'script-complete'
}

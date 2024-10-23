import type { ReplPayload, Theme } from '../../jsrepl/src/types'

declare global {
  const __JSREPL_ORIGIN__: string
}

export type ReplRawPayload = Omit<ReplPayload, 'result'> & { rawResult: unknown }

export type PreviewEntryWindow = Window &
  typeof globalThis & {
    hooks: unknown
  }

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type PreviewWindow = Window & typeof globalThis & { __r: Function }

export type ReplMessageData = {
  type: 'repl'
  token: number
  srcdoc: string
}

export type UpdateThemeMessageData = {
  type: 'update-theme'
  theme: Pick<Theme, 'id' | 'isDark'>
}

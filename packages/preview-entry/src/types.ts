import type { ReplPayload, Theme } from '../../jsrepl/src/types'

declare global {
  const __JSREPL_ORIGIN__: string
}

export type ImportMap = {
  imports: Record<string, string>
}

export type ReplRawPayload = Omit<ReplPayload, 'result'> & { rawResult: unknown }

export type PreviewEntryWindow = Window &
  typeof globalThis & {
    hooks: unknown
  }

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type PreviewWindow = Window & typeof globalThis & { __r: Function }

export type ReplMessageData = {
  token: number
  type: 'repl'
  jsCode: string
  htmlCode: string
  cssCode: string
  importmap: ImportMap
  theme: Pick<Theme, 'id' | 'isDark'>
}

export type UpdateThemeMessageData = {
  type: 'update-theme'
  theme: Pick<Theme, 'id' | 'isDark'>
}

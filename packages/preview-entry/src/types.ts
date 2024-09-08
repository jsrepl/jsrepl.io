import type { ReplPayload } from '../../jsrepl/types/repl.types'

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

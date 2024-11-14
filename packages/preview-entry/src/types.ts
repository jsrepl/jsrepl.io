import { identifierNameFunctionMeta, identifierNameRepl } from '@jsrepl/shared-types'

declare global {
  const __JSREPL_ORIGIN__: string
}

export type PreviewEntryWindow = Window &
  typeof globalThis & {
    hooks: unknown
  }

export type PreviewWindow = Window &
  typeof globalThis & {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    [identifierNameRepl]: Function
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    [identifierNameFunctionMeta]: Function
  }

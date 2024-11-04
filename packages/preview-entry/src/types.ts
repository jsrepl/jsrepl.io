declare global {
  const __JSREPL_ORIGIN__: string
}

export type PreviewEntryWindow = Window &
  typeof globalThis & {
    hooks: unknown
  }

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type PreviewWindow = Window & typeof globalThis & { __r: Function }

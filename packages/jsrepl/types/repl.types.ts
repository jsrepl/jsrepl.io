import type * as monaco from 'monaco-editor'

export enum ReplPayloadCustomKind {
  DomNode = 'dom-node', // non-cloneable
  Function = 'function', // non-cloneable
  Symbol = 'symbol', // non-cloneable
  WeakSet = 'weak-set', // non-cloneable
  WeakMap = 'weak-map', // non-cloneable
  WeakRef = 'weak-ref', // non-cloneable
  CyclicRef = 'cyclic-ref', // cloneable, but we simplify this case for traversing in transformPayload
  RawObject = 'raw-object', // prototype chain is not preserved in structured clone
}

export type ReplPayloadResultDomNode = {
  __rpck__: ReplPayloadCustomKind.DomNode
  tagName: string
  attributes: { name: string; value: string }[]
  hasChildNodes: boolean
  childElementCount: number
  textContent: string | null
}

export type ReplPayloadResultFunction = {
  __rpck__: ReplPayloadCustomKind.Function
  name: string
  str: string
}

export type ReplPayloadResultSymbol = {
  __rpck__: ReplPayloadCustomKind.Symbol
  str: string
}

export type ReplPayloadResultWeakSet = {
  __rpck__: ReplPayloadCustomKind.WeakSet
}

export type ReplPayloadResultWeakMap = {
  __rpck__: ReplPayloadCustomKind.WeakMap
}

export type ReplPayloadResultWeakRef = {
  __rpck__: ReplPayloadCustomKind.WeakRef
}

export type ReplPayloadResultCyclicRef = {
  __rpck__: ReplPayloadCustomKind.CyclicRef
}

export type ReplPayloadResultRawObject = {
  __rpck__: ReplPayloadCustomKind.RawObject
  constructorName: string
  props: Record<string, unknown>
}

export type ReplPayload = {
  isError: boolean
  result: unknown
  ctx: {
    id: number
    lineStart: number
    lineEnd: number
    colStart: number
    colEnd: number
    source: string
    kind:
      | 'expression'
      | 'variable'
      | 'error'
      | 'babel-parse-error'
      | 'console-log'
      | 'console-debug'
      | 'console-info'
      | 'console-warn'
      | 'console-error'
  }
} & (ReplPromiseFields | ReplNonPromiseFields)

type ReplPromiseFields = {
  isPromise: true
  promiseInfo: { status: 'pending' | 'fulfilled' | 'rejected' }
}

type ReplNonPromiseFields = {
  isPromise: false
  promiseInfo: undefined
}

export type ReplStoredState = {
  info: string
  tsx: string
  html: string
  css: string
  tailwindConfig: string
  currentModelName: 'info' | 'tsx' | 'html' | 'css' | 'tailwindConfig'
  showPreview: boolean
}

export type UserStoredState = {
  version: string | undefined
  theme: Theme
  previewPos: PreviewPosition
}

export enum Theme {
  // Built-in themes
  Light = 'vs',
  Dark = 'vs-dark',
  HighContrastLight = 'hc-light',
  HighContrastDark = 'hc-black',

  // Shiki themes
  DarkPlus = 'dark-plus',
  LightPlus = 'light-plus',
  GithubDark = 'github-dark',
  GithubLight = 'github-light',
  Monokai = 'monokai',
  Dracula = 'dracula',
  OneLight = 'one-light',
}

type ThemeDefBase = {
  id: Theme
  label: string
  isDark: boolean
}

type ThemeDefBuiltin = ThemeDefBase & {
  provider: 'builtin'
}

type ThemeDefCustom = ThemeDefBase & {
  provider: 'custom'
  load: () => Promise<monaco.editor.IStandaloneThemeData>
}

type ThemeDefShiki = ThemeDefBase & {
  provider: 'shiki'
}

export type ThemeDef = ThemeDefBuiltin | ThemeDefCustom | ThemeDefShiki

export enum PreviewPosition {
  FloatBottomRight = 'float-bottom-right',
  FloatTopRight = 'float-top-right',
  AsideRight = 'aside-right',
}

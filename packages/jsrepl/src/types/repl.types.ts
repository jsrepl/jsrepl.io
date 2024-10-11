import type { BundledTheme } from 'shiki'

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
    id: number | string
    /**
     * Starts with 1.
     */
    lineStart: number
    /**
     * Starts with 1.
     */
    lineEnd: number
    /**
     * Starts with 1.
     */
    colStart: number
    /**
     * Starts with 1.
     */
    colEnd: number
    source: string
    /**
     * Path relative to the root of the project, starting with '/'.
     * For example: '/index.tsx', '/index.html', '/index.css', '/tailwind.config.ts'
     */
    filePath: string
    kind:
      | 'expression'
      | 'variable'
      | 'window-error'
      | 'error'
      | 'warning'
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
  models: Map<string, ModelDef>
  activeModel: string
  showPreview: boolean
}

export type ModelDef = {
  /**
   * Path is relative to the root of the project.
   * For example: '/index.tsx', '/index.html', '/index.css', '/tailwind.config.ts'
   */
  path: string
  content: string
}

export type UserStoredState = {
  version: string | undefined
  previewPos: PreviewPosition
}

export type Theme = {
  id: BundledTheme
  label: string
  isDark: boolean
}

export enum PreviewPosition {
  FloatBottomRight = 'float-bottom-right',
  FloatTopRight = 'float-top-right',
  AsideRight = 'aside-right',
}

export type ImportMap = {
  imports: Record<string, string>
}

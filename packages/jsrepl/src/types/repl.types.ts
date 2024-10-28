import type * as esbuild from 'esbuild-wasm'
import type { BundledTheme } from 'shiki'
import * as ReplFS from '@/lib/repl-fs'

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
  constructorName: string | undefined
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
  fs: ReplFS.FS
  /**
   * Array of absolute paths to the opened models. Paths start with '/'.
   */
  openedModels: string[]
  /**
   * Absolute path to the active model, starting with '/'.
   * In case of no active model use '' (empty string).
   */
  activeModel: string
  showPreview: boolean
}

export type UserStoredState = {
  /**
   * Last used App version. It is used to show New Version toast.
   */
  version: string | undefined
  previewPos: PreviewPosition
  /**
   * [width, height]
   */
  previewSize: [number, number]
  showLeftSidebar: boolean
  leftSidebarWidth: number
  autostartOnCodeChange: boolean
  editorFontSize: number
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

export type ReplInfo = {
  ok: boolean
  errors: esbuild.Message[]
  warnings: esbuild.Message[]
}

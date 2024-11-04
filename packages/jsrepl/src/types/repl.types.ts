import type * as esbuild from 'esbuild-wasm'
import type { BundledTheme } from 'shiki'
import type * as ReplFS from '@/lib/repl-fs'

export enum ReplPayloadMarshalledType {
  DomNode = 'dom-node', // non-cloneable
  Function = 'function', // non-cloneable
  Symbol = 'symbol', // non-cloneable
  WeakSet = 'weak-set', // non-cloneable
  WeakMap = 'weak-map', // non-cloneable
  WeakRef = 'weak-ref', // non-cloneable
  Object = 'object', // prototype chain is not preserved in structured clone
}

export type ReplPayloadResultDomNode = {
  __meta__: {
    type: ReplPayloadMarshalledType.DomNode
    tagName: string
    constructorName: string | undefined
    attributes: { name: string; value: string }[]
    hasChildNodes: boolean
    childElementCount: number
    textContent: string | null
  }
  serialized: string
}

export type ReplPayloadResultFunction = {
  __meta__: {
    type: ReplPayloadMarshalledType.Function
    name: string
  }
  serialized: string
}

export type ReplPayloadResultSymbol = {
  __meta__: {
    type: ReplPayloadMarshalledType.Symbol
  }
  serialized: string
}

export type ReplPayloadResultWeakSet = {
  __meta__: {
    type: ReplPayloadMarshalledType.WeakSet
  }
}

export type ReplPayloadResultWeakMap = {
  __meta__: {
    type: ReplPayloadMarshalledType.WeakMap
  }
}

export type ReplPayloadResultWeakRef = {
  __meta__: {
    type: ReplPayloadMarshalledType.WeakRef
  }
}

export type ReplPayloadResultObject = Record<string, unknown> & {
  __meta__: {
    type: ReplPayloadMarshalledType.Object
    constructorName: string | undefined
  }
}

export type ReplPayload = {
  /**
   * Unique identifier for the payload.
   */
  id: string
  /**
   * Whether `result` is an error (not necessarily of type Error).
   */
  isError: boolean
  /**
   * Result of the expression.
   * Structured cloneable, but may not be serializable with JSON.stringify (Date, Set, Map, circular references, etc).
   */
  result: unknown
  ctx: {
    /**
     * Expression identifier.
     */
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
      | 'assignment'
      | 'window-error'
      | 'error'
      | 'warning'
      | 'console-log'
      | 'console-debug'
      | 'console-info'
      | 'console-warn'
      | 'console-error'
  }
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

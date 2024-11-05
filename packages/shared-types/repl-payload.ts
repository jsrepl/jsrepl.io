export type ReplPayloadBase = {
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
  }
}

export type ReplPayloadExpression = ReplPayloadBase & {
  ctx: {
    kind: 'expression'
  }
}

export type ReplPayloadVariable = ReplPayloadBase & {
  ctx: {
    kind: 'variable'
    varName: string
    varKind: string
  }
}

export type ReplPayloadAssignment = ReplPayloadBase & {
  ctx: {
    kind: 'assignment'
    memberName: string
  }
}

export type ReplPayloadConsoleLog = ReplPayloadBase & {
  result: unknown[]
  ctx: {
    kind: 'console-log' | 'console-debug' | 'console-info' | 'console-warn' | 'console-error'
  }
}

export type ReplPayloadOther = ReplPayloadBase & {
  ctx: {
    kind: 'window-error' | 'error' | 'warning'
  }
}

export type ReplPayload =
  | ReplPayloadExpression
  | ReplPayloadVariable
  | ReplPayloadAssignment
  | ReplPayloadConsoleLog
  | ReplPayloadOther

export type ReplRawPayload = Omit<ReplPayload, 'result'> & { rawResult: unknown }

export enum MarshalledType {
  DomNode = 'dom-node', // non-cloneable
  Function = 'function', // non-cloneable
  Symbol = 'symbol', // non-cloneable
  WeakSet = 'weak-set', // non-cloneable
  WeakMap = 'weak-map', // non-cloneable
  WeakRef = 'weak-ref', // non-cloneable
  Object = 'object', // prototype chain is not preserved in structured clone
}

export type MarshalledDomNode = {
  __meta__: {
    type: MarshalledType.DomNode
    tagName: string
    constructorName: string | undefined
    attributes: { name: string; value: string }[]
    hasChildNodes: boolean
    childElementCount: number
    textContent: string | null
  }
  serialized: string
}

export type MarshalledFunction = {
  __meta__: {
    type: MarshalledType.Function
    name: string
  }
  serialized: string
}

export type MarshalledSymbol = {
  __meta__: {
    type: MarshalledType.Symbol
  }
  serialized: string
}

export type MarshalledWeakSet = {
  __meta__: {
    type: MarshalledType.WeakSet
  }
}

export type MarshalledWeakMap = {
  __meta__: {
    type: MarshalledType.WeakMap
  }
}

export type MarshalledWeakRef = {
  __meta__: {
    type: MarshalledType.WeakRef
  }
}

export type MarshalledObject = Record<string, unknown> & {
  __meta__: {
    type: MarshalledType.Object
    constructorName: string | undefined
  }
}

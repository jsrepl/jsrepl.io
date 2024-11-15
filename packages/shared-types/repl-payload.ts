import {
  IReplPayloadContext,
  ReplPayloadContextAssignment,
  ReplPayloadContextConsoleDebug,
  ReplPayloadContextConsoleError,
  ReplPayloadContextConsoleInfo,
  ReplPayloadContextConsoleLog,
  ReplPayloadContextConsoleWarn,
  ReplPayloadContextError,
  ReplPayloadContextExpression,
  ReplPayloadContextFunctionCall,
  ReplPayloadContextKind,
  ReplPayloadContextReturn,
  ReplPayloadContextVariable,
  ReplPayloadContextWarning,
  ReplPayloadContextWindowError,
} from './repl-payload-context'

interface Base<T = ReplPayloadContextKind> {
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
  /**
   * Timestamp of the payload.
   */
  timestamp: number
  /**
   * Expression context.
   */
  ctx: IReplPayloadContext<T>
}

export interface ReplPayloadExpression extends Base {
  ctx: ReplPayloadContextExpression
}

export interface ReplPayloadVariable extends Base {
  ctx: ReplPayloadContextVariable
}

export interface ReplPayloadAssignment extends Base {
  ctx: ReplPayloadContextAssignment
}

export interface ReplPayloadReturn extends Base {
  ctx: ReplPayloadContextReturn
}

export interface ReplPayloadFunctionCall extends Base {
  ctx: ReplPayloadContextFunctionCall
  /**
   * Array of function call arguments.
   * For arrow functions this is also available.
   */
  result: unknown[]
}

export interface ReplPayloadConsoleLog extends Base {
  result: unknown[]
  ctx: ReplPayloadContextConsoleLog
}

export interface ReplPayloadConsoleDebug extends Base {
  result: unknown[]
  ctx: ReplPayloadContextConsoleDebug
}

export interface ReplPayloadConsoleInfo extends Base {
  result: unknown[]
  ctx: ReplPayloadContextConsoleInfo
}

export interface ReplPayloadConsoleWarn extends Base {
  result: unknown[]
  ctx: ReplPayloadContextConsoleWarn
}

export interface ReplPayloadConsoleError extends Base {
  result: unknown[]
  ctx: ReplPayloadContextConsoleError
}

export interface ReplPayloadWindowError extends Base {
  ctx: ReplPayloadContextWindowError
}

export interface ReplPayloadError extends Base {
  ctx: ReplPayloadContextError
}

export interface ReplPayloadWarning extends Base {
  ctx: ReplPayloadContextWarning
}

export type ReplPayload =
  | ReplPayloadExpression
  | ReplPayloadVariable
  | ReplPayloadAssignment
  | ReplPayloadReturn
  | ReplPayloadFunctionCall
  | ReplPayloadConsoleLog
  | ReplPayloadConsoleDebug
  | ReplPayloadConsoleInfo
  | ReplPayloadConsoleWarn
  | ReplPayloadConsoleError
  | ReplPayloadWindowError
  | ReplPayloadError
  | ReplPayloadWarning

export type IReplPayload<T = ReplPayloadContextKind> = Base<T>

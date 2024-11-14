export type ReplPayloadContextId = number | string

export enum ReplPayloadContextKind {
  Expression = 'expression',
  Variable = 'variable',
  Assignment = 'assignment',
  Return = 'return',
  FunctionCall = 'function-call',
  ConsoleLog = 'console-log',
  ConsoleDebug = 'console-debug',
  ConsoleInfo = 'console-info',
  ConsoleWarn = 'console-warn',
  ConsoleError = 'console-error',
  WindowError = 'window-error',
  Error = 'error',
  Warning = 'warning',
}

interface Base<T = ReplPayloadContextKind> {
  /**
   * Expression identifier.
   */
  id: ReplPayloadContextId
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
  /**
   * Source code.
   */
  source: string
  /**
   * Path relative to the root of the project, starting with '/'.
   * For example: '/index.tsx', '/index.html', '/index.css', '/tailwind.config.ts'
   */
  filePath: string
  /**
   * Context kind.
   */
  kind: T
}

export interface ReplPayloadContextExpression extends Base<ReplPayloadContextKind.Expression> {}

export interface ReplPayloadContextVariable extends Base<ReplPayloadContextKind.Variable> {
  varName: string
  varKind: string
}

export interface ReplPayloadContextAssignment extends Base<ReplPayloadContextKind.Assignment> {
  memberName: string
}

export interface ReplPayloadContextReturn extends Base<ReplPayloadContextKind.Return> {}

export interface ReplPayloadContextFunctionCall extends Base<ReplPayloadContextKind.FunctionCall> {
  name: string | null
  isAsync: boolean
  isGenerator: boolean
  isArrow: boolean
}

export interface ReplPayloadContextConsoleLog extends Base<ReplPayloadContextKind.ConsoleLog> {}
export interface ReplPayloadContextConsoleDebug extends Base<ReplPayloadContextKind.ConsoleDebug> {}
export interface ReplPayloadContextConsoleInfo extends Base<ReplPayloadContextKind.ConsoleInfo> {}
export interface ReplPayloadContextConsoleWarn extends Base<ReplPayloadContextKind.ConsoleWarn> {}
export interface ReplPayloadContextConsoleError extends Base<ReplPayloadContextKind.ConsoleError> {}

export interface ReplPayloadContextWindowError extends Base<ReplPayloadContextKind.WindowError> {}
export interface ReplPayloadContextError extends Base<ReplPayloadContextKind.Error> {}
export interface ReplPayloadContextWarning extends Base<ReplPayloadContextKind.Warning> {}

export type ReplPayloadContext =
  | ReplPayloadContextExpression
  | ReplPayloadContextVariable
  | ReplPayloadContextAssignment
  | ReplPayloadContextReturn
  | ReplPayloadContextFunctionCall
  | ReplPayloadContextConsoleLog
  | ReplPayloadContextConsoleDebug
  | ReplPayloadContextConsoleInfo
  | ReplPayloadContextConsoleWarn
  | ReplPayloadContextConsoleError
  | ReplPayloadContextWindowError
  | ReplPayloadContextError
  | ReplPayloadContextWarning

export type IReplPayloadContext<T = ReplPayloadContextKind> = Base<T>

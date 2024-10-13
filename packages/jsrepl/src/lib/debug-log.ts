import { consoleLogRepl } from './console-utils'

export enum DebugLog {
  TS = 'ts',
  DTS = 'dts',
  REPL = 'repl',
  OTHER = 'other',
}

// Example: http://localhost:3000/repl?debug=dts&debug=repl
const debugFlags =
  typeof window !== 'undefined' ? new URLSearchParams(location.search).getAll('debug') : undefined

export function debugLog(key: DebugLog, ...args: unknown[]) {
  if (debugFlags?.includes(key)) {
    consoleLogRepl('debug', '[DEBUG]', ...args)
  }
}

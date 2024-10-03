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
    console.debug(
      '%cDEBUG%c %s',
      'color: light-dark(#000, #FFF); background-color: light-dark(#93e0ff, #004697); border-radius: 2px; padding: 1px 4px;',
      'font-weight: 400;',
      ...args
    )
  }
}

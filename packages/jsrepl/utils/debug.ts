export enum Debug {
  TS = 'ts',
  REPL = 'repl',
  OTHER = 'other',
}

export function debug(key: Debug, ...args: unknown[]) {
  if (window.debug?.[key]) {
    console.debug(
      '%cDEBUG%c %s',
      'color: light-dark(#000, #FFF); background-color: light-dark(#93e0ff, #004697); border-radius: 2px; padding: 1px 4px;',
      'font-weight: 400;',
      ...args
    )
  }
}

if (import.meta.client) {
  window.debug = {
    [Debug.TS]: true,
    [Debug.REPL]: true,
    [Debug.OTHER]: true,
  }

  window.debugAll = () => {
    Object.values(Debug).forEach((key) => {
      window.debug[key] = true
    })
  }
}

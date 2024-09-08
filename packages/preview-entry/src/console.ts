import type { PreviewWindow } from './types'

const consoleLogCommonStyles = [
  'border-radius: 2px',
  'padding: 1px 4px',
  'margin-right: 8px',
  'border: 1px solid',
]

const consoleLogStyles = {
  log: [
    ...consoleLogCommonStyles,
    'color: light-dark(#000, #FFF)',
    'background-color: light-dark(#EEE, #4b4b4b)',
  ].join(';'),
  debug: [
    ...consoleLogCommonStyles,
    'color: light-dark(#000, #FFF)',
    'background-color: light-dark(#93e0ff, #004697)',
  ].join(';'),
  info: [
    ...consoleLogCommonStyles,
    'color: light-dark(#000, #FFF)',
    'background-color: light-dark(#EEE, #4b4b4b)',
  ].join(';'),
  warn: [
    ...consoleLogCommonStyles,
    'color: light-dark(#000, #FFF)',
    'background-color: light-dark(#EEE, #4b4b4b)',
  ].join(';'),
  error: [
    ...consoleLogCommonStyles,
    'color: light-dark(#000, #FFF)',
    'background-color: light-dark(#EEE, #4b4b4b)',
  ].join(';'),
}

export function setupConsole(win: PreviewWindow) {
  const origConsole = {
    log: win.console.log.bind(win.console),
    debug: win.console.debug.bind(win.console),
    info: win.console.info.bind(win.console),
    warn: win.console.warn.bind(win.console),
    error: win.console.error.bind(win.console),
  }

  win.console.log = (...args: unknown[]) => consoleLog(origConsole.log, 'log', ...args)
  win.console.debug = (...args: unknown[]) => consoleLog(origConsole.debug, 'debug', ...args)
  win.console.info = (...args: unknown[]) => consoleLog(origConsole.info, 'info', ...args)
  win.console.warn = (...args: unknown[]) => consoleLog(origConsole.warn, 'warn', ...args)
  win.console.error = (...args: unknown[]) => consoleLog(origConsole.error, 'error', ...args)
}

function consoleLog(
  origFn: (...args: unknown[]) => void,
  level: 'log' | 'debug' | 'info' | 'warn' | 'error',
  ...args: unknown[]
) {
  const firstArg = args[0]
  if (
    typeof firstArg === 'string' &&
    ['%s', '%d', '%i', '%o', '%O', '%c', '%f'].some((x) => firstArg.includes(x))
  ) {
    args = [`%cREPL%c${firstArg}`, consoleLogStyles[level], '', ...args.slice(1)]
  } else {
    args = [`%cREPL%c`, consoleLogStyles[level], '', ...args]
  }

  return origFn(...args)
}

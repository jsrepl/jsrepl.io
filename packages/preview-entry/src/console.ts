import type { PreviewWindow } from './types'

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
  _level: 'log' | 'debug' | 'info' | 'warn' | 'error',
  ...args: unknown[]
) {
  // TODO: Implement console UI
  return origFn(...args)
}

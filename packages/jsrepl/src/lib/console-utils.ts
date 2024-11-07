const commonStyles = [
  'border-radius: 2px',
  'padding: 1px 4px',
  'margin-right: 4px',
  'border: 1px solid',
]

const styles = {
  log: [
    ...commonStyles,
    'color: light-dark(#000, #FFF)',
    'background-color: light-dark(#EEE, #4b4b4b)',
  ].join(';'),
  debug: [
    ...commonStyles,
    'color: light-dark(#000, #FFF)',
    'background-color: light-dark(#93e0ff, #004697)',
  ].join(';'),
  info: [
    ...commonStyles,
    'color: light-dark(#000, #FFF)',
    'background-color: light-dark(#93e0ff, #004697)',
  ].join(';'),
  warn: [
    ...commonStyles,
    'color: light-dark(#000, #FFF)',
    'background-color: light-dark(#ffda74, #d48e00)',
  ].join(';'),
  error: [
    ...commonStyles,
    'color: light-dark(#FFF, #FFF)',
    'background-color: light-dark(#ff4343, #d90000)',
  ].join(';'),
}

export function consoleLogRepl(
  level: 'log' | 'debug' | 'info' | 'warn' | 'error',
  ...args: unknown[]
) {
  const extraStyles = typeof args[0] === 'string' && args[0].startsWith('%c') ? args.shift() : ''
  args = [`%cREPL${extraStyles}`, styles[level], ...args]
  // eslint-disable-next-line no-console
  console[level](...args)
}

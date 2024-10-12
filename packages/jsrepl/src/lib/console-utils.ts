const consoleLogCommonStyles = [
  'border-radius: 2px',
  'padding: 1px 4px',
  'margin-right: 8px',
  'border: 1px solid',
]

export const consoleLogStyles = {
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

export type BabelParseError = Error & {
  code: 'BABEL_PARSE_ERROR'
  clone(): BabelParseError
  loc?: {
    /** 1-based */
    line: number | null
    /** 0-based */
    column: number | null
  }
}

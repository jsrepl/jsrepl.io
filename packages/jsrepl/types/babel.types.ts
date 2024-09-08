import type { BabelFileResult } from '@babel/core'

export interface BabelTransformResult {
  code: string
  sourcemap: BabelFileResult['map']
  metadata: BabelTransformResultMetadata
  error: null
}

export interface BabelTransformResultError {
  code: null
  sourcemap: null
  metadata: null
  error: Error | BabelParseError
}

export interface BabelTransformResultMetadata {
  importPaths: string[] | undefined
}

export type BabelParseError = Error & {
  code: 'BABEL_PARSE_ERROR'
  clone(): BabelParseError
  loc?: { line: number | null; column: number | null }
}

export function isBabelParseError(e: unknown): e is BabelParseError {
  return e instanceof Error && 'code' in e && e.code === 'BABEL_PARSE_ERROR'
}

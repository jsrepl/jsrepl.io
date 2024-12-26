import type * as esbuild from 'esbuild-wasm'
import type { BabelParseError } from '@/types'

export type BabelParsePartialEsbuildError = Omit<esbuild.PartialMessage, 'detail'> & {
  detail: {
    isBabelParseError: true
    shortMessage: string
    code: 'BABEL_PARSE_ERROR'
    name: string
  }
}

export type BabelParseEsbuildError = Omit<esbuild.Message, 'detail'> & {
  detail: {
    isBabelParseError: true
    shortMessage: string
    code: 'BABEL_PARSE_ERROR'
    name: string
  }
}

export function babelParseErrorToEsbuildError(
  error: BabelParseError,
  filePath: string
): BabelParsePartialEsbuildError {
  return {
    text: error.message,
    location: {
      file: filePath,
      line: error.loc?.line ?? undefined,
      column: error.loc?.column ?? undefined,
    },
    detail: {
      isBabelParseError: true as const,
      // HACK: `error.clone()` removes "codeFrame" part from error message
      shortMessage: error.clone().message.replace(/\ \(\d+:\d+\)$/g, ''),
      code: error.code,
      name: error.name,
    },
  }
}

export function isBabelParseEsbuildError(
  message: esbuild.Message
): message is BabelParseEsbuildError {
  return (
    typeof message.detail === 'object' &&
    message.detail !== null &&
    message.detail.isBabelParseError === true
  )
}

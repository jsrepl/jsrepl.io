import type * as esbuild from 'esbuild-wasm'
import type { BabelParseError } from '@/types'

export function babelParseErrorToEsbuildError(
  error: BabelParseError,
  filePath: string
): esbuild.PartialMessage {
  return {
    // HACK: `error.clone()` removes "codeFrame" part from error message
    text: error.clone().message,
    location: {
      file: filePath,
      line: error.loc?.line ?? undefined,
      column: error.loc?.column ?? undefined,
    },
    detail: {
      message: error.message,
      code: error.code,
      name: error.name,
    },
  }
}

import type { BabelFileResult } from '@babel/core'
import { type SourceMapInput, TraceMap, originalPositionFor } from '@jridgewell/trace-mapping'

// line starts with 1, column starts with 0
export function getOriginalPosition(
  sourcemap: BabelFileResult['map'],
  line: number,
  column: number
): { line: number | null; column: number | null } {
  if (line < 1 || column < 0) {
    console.error(`getOriginalPosition: invalid position ${line}:${column}`)
    return { line: null, column: null }
  }

  try {
    const tracer = new TraceMap(sourcemap as SourceMapInput)
    const originalPosition = originalPositionFor(tracer, { line, column })
    return originalPosition
  } catch (e) {
    console.error('getOriginalPosition error', e)
    return { line: null, column: null }
  }
}

import { type SourceMapInput, TraceMap, originalPositionFor } from '@jridgewell/trace-mapping'

/**
 * @param line - starts with 1
 * @param column - starts with 1
 * @returns line and column starting with 1
 */
export function getOriginalPosition(sourcemap: SourceMapInput, line: number, column: number) {
  if (line < 1 || column < 1) {
    throw new Error(`getOriginalPosition: invalid position ${line}:${column}`)
  }

  const tracer = new TraceMap(sourcemap as SourceMapInput)
  const originalPosition = originalPositionFor(tracer, { line, column: column - 1 })
  if (originalPosition.column !== null) {
    originalPosition.column += 1
  }

  return originalPosition
}

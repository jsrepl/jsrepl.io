import type * as Babel from '@babel/standalone'
import { BabelParseError } from '@/types'

const babel: { value: typeof Babel | null } = { value: null }

async function loadBabel() {
  babel.value = await import('@babel/standalone')
}

export function getBabel(): [typeof babel, typeof loadBabel] {
  return [babel, loadBabel]
}

export function isBabelParseError(e: unknown): e is BabelParseError {
  return e instanceof Error && 'code' in e && e.code === 'BABEL_PARSE_ERROR'
}

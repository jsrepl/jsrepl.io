import type * as Babel from '@babel/standalone'

const babel: { value: typeof Babel | null } = { value: null }

async function loadBabel() {
  babel.value = await import('@babel/standalone')
}

export function getBabel(): [typeof babel, typeof loadBabel] {
  return [babel, loadBabel]
}

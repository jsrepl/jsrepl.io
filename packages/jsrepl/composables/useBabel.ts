import type * as Babel from '@babel/standalone'
import { type ShallowRef } from 'vue'

const babel: ShallowRef<typeof Babel | null> = shallowRef(null)

async function loadBabel() {
  babel.value = await import('@babel/standalone')
}

export function useBabel(): [typeof babel, typeof loadBabel] {
  return [babel, loadBabel]
}

import type TS from 'typescript'
import { type ShallowRef } from 'vue'

const ts: ShallowRef<typeof TS | null> = shallowRef(null)

async function loadTS() {
  ts.value = await import('typescript')
}

export function useTypescript(): [typeof ts, typeof loadTS] {
  return [ts, loadTS]
}

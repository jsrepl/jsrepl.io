import type TS from 'typescript'

const ts: { value: typeof TS | null } = { value: null }

async function loadTS() {
  ts.value = await import('typescript')
}

export function getTypescript(): [typeof ts, typeof loadTS] {
  return [ts, loadTS]
}

import type TS from 'typescript'

let ts: typeof TS | null = null

export async function loadTypescript() {
  if (!ts) {
    ts = await import('typescript')
  }

  return ts
}

export function getTypescript() {
  return ts
}

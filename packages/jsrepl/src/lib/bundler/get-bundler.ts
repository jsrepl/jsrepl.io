import * as Comlink from 'comlink'
import type { Expose } from './bundler-worker'

let bundler: Comlink.Remote<Expose> | null = null

export function getBundler(): Comlink.Remote<Expose> {
  if (!bundler) {
    const worker = new Worker(new URL('@/lib/bundler/bundler-worker.ts', import.meta.url))
    bundler = Comlink.wrap<Expose>(worker)
  }

  return bundler
}

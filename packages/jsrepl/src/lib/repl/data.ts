import { type BuildResult } from '@/lib/bundler/bundler-worker'
import { Output } from '@/types'

export type ReplData = {
  token: number
  bundle: BuildResult | null
  output: Output | null
}

export const replDataRef: { current: ReplData } = {
  current: {
    token: -1,
    bundle: null,
    output: null,
  },
}

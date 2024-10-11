import { type BuildResult } from '@/lib/bundler/bundler-worker'

export type ReplData = {
  token: number
  bundle: BuildResult | null
}

export const replDataRef: { current: ReplData } = {
  current: {
    token: -1,
    bundle: null,
  },
}

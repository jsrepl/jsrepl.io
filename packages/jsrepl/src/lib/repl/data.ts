import { type BuildResult } from '@/lib/bundler/bundler-worker'

export type ReplData = {
  token: number
  bundle?: BuildResult
}

export const replDataRef: { current: ReplData } = {
  current: {
    token: 0,
  },
}

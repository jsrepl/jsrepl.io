import { Dispatch, SetStateAction, useContext } from 'react'
import {
  ReplRewindMode,
  ReplRewindModeContext,
} from '@/components/providers/repl-rewind-mode-provider'

export function useReplRewindMode(): [ReplRewindMode, Dispatch<SetStateAction<ReplRewindMode>>] {
  const { rewindMode, setRewindMode } = useContext(ReplRewindModeContext)!
  return [rewindMode, setRewindMode]
}

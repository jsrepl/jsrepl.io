import { Dispatch, SetStateAction, useContext } from 'react'
import { ReplInfoContext } from '@/components/providers/repl-info-provider'
import { ReplInfo } from '@/types/repl.types'

export function useReplInfo(): [ReplInfo | null, Dispatch<SetStateAction<ReplInfo | null>>] {
  const { replInfo, setReplInfo } = useContext(ReplInfoContext)!
  return [replInfo, setReplInfo]
}

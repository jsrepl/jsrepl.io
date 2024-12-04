import { useContext } from 'react'
import { ReplModelsContext } from '@/components/providers/repl-models-provider'

export function useReplModels() {
  const { models, readOnlyModels } = useContext(ReplModelsContext)!
  return { models, readOnlyModels }
}

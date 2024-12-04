import { useContext } from 'react'
import { WritableModelsContext } from '@/components/providers/writable-models-provider'

export function useWritableModels() {
  const context = useContext(WritableModelsContext)!
  return context
}

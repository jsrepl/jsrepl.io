import { createContext } from 'react'
import { CodeEditorModel } from '@/lib/code-editor-model'

export type ReplModelsContextType = {
  models: Map<string, CodeEditorModel>
  readOnlyModels: Map<string, { message: string }>
}

export const ReplModelsContext = createContext<ReplModelsContextType | null>(null)

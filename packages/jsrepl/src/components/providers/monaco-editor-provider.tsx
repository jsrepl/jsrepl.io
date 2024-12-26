import { createContext, useState } from 'react'
import type * as monaco from 'monaco-editor'

export type MonacoEditorContextType = {
  editor: monaco.editor.IStandaloneCodeEditor | null
  setEditor: (editor: monaco.editor.IStandaloneCodeEditor | null) => void
}

export const MonacoEditorContext = createContext<MonacoEditorContextType | null>(null)

export function MonacoEditorProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null)

  return (
    <MonacoEditorContext.Provider value={{ editor, setEditor }}>
      {children}
    </MonacoEditorContext.Provider>
  )
}

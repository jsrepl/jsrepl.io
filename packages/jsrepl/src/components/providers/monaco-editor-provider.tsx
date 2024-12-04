import { RefObject, createContext, useCallback, useRef } from 'react'
import type * as monaco from 'monaco-editor'

export type MonacoEditorContextType = {
  editorRef: RefObject<monaco.editor.IStandaloneCodeEditor | null>
  setEditor: (editor: monaco.editor.IStandaloneCodeEditor | null) => void
}

export const MonacoEditorContext = createContext<MonacoEditorContextType | null>(null)

export function MonacoEditorProvider({ children }: { children: React.ReactNode }) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const setEditor = useCallback((editor: monaco.editor.IStandaloneCodeEditor | null) => {
    editorRef.current = editor
  }, [])

  return (
    <MonacoEditorContext.Provider value={{ editorRef, setEditor }}>
      {children}
    </MonacoEditorContext.Provider>
  )
}

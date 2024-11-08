import { createContext } from 'react'
import type * as monaco from 'monaco-editor'

export type MonacoEditorContextType = {
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor>
  setEditor: (editor: monaco.editor.IStandaloneCodeEditor | null) => void
}

export const MonacoEditorContext = createContext<MonacoEditorContextType | null>(null)

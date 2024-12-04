import { RefObject, useContext } from 'react'
import type * as monaco from 'monaco-editor'
import { MonacoEditorContext } from '@/components/providers/monaco-editor-provider'

export function useMonacoEditor(): [
  RefObject<monaco.editor.IStandaloneCodeEditor | null>,
  (editor: monaco.editor.IStandaloneCodeEditor | null) => void,
] {
  const { editorRef, setEditor } = useContext(MonacoEditorContext)!
  return [editorRef, setEditor]
}

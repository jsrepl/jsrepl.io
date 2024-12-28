import { useContext, useEffect, useRef } from 'react'
import type * as monaco from 'monaco-editor'
import { MonacoEditorContext } from '@/components/providers/monaco-editor-provider'

export function useMonacoEditor() {
  const { editor, setEditor } = useContext(MonacoEditorContext)!
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(editor)

  useEffect(() => {
    editorRef.current = editor

    return () => {
      editorRef.current = null
    }
  }, [editor])

  return { editor, editorRef, setEditor }
}

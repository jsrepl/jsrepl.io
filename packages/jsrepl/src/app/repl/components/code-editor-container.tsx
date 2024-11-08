import { useCallback, useMemo, useRef } from 'react'
import type * as monaco from 'monaco-editor'
import { MonacoEditorContext } from '@/context/monaco-editor-context'
import { cn } from '@/lib/utils'
import CodeEditor from './code-editor'
import CodeEditorHeader from './code-editor-header'
import { ErrorsNotification } from './errors-notification'
import RewindModePanel from './rewind-mode-panel'

export default function CodeEditorContainer({ className }: { className?: string }) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const setEditor = useCallback((editor: monaco.editor.IStandaloneCodeEditor | null) => {
    editorRef.current = editor
  }, [])

  const contextValue = useMemo(() => ({ editorRef, setEditor }), [editorRef, setEditor])

  return (
    <>
      <MonacoEditorContext.Provider value={contextValue}>
        <div className={cn(className, 'relative flex min-w-24 flex-col [grid-area:editor]')}>
          <CodeEditorHeader />
          <RewindModePanel />
          <CodeEditor />
          <ErrorsNotification />
        </div>
      </MonacoEditorContext.Provider>
    </>
  )
}

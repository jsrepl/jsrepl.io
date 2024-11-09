import { useCallback, useContext, useEffect, useRef } from 'react'
import codeEditorStyles from '@/app/repl/components/code-editor.module.css'
import { MonacoEditorContext } from '@/context/monaco-editor-context'
import { ReplModelsContext } from '@/context/repl-models-context'

export default function useReplDecorationsOutdated() {
  const { editorRef } = useContext(MonacoEditorContext)!
  const { models } = useContext(ReplModelsContext)!

  const decorationsOutdatedRef = useRef(false)
  const timeoutIdRef = useRef<NodeJS.Timeout>()

  const setDecorationsOutdated = useCallback(
    (outdated: boolean) => {
      if (decorationsOutdatedRef.current === outdated) {
        return
      }

      decorationsOutdatedRef.current = outdated

      clearTimeout(timeoutIdRef.current)

      const fn = () => {
        const domNode = editorRef.current!.getContainerDomNode()
        domNode.classList.toggle(codeEditorStyles.jsreplDecorsOutdated!, outdated)
      }

      if (outdated) {
        timeoutIdRef.current = setTimeout(fn, 700)
      } else {
        fn()
      }
    },
    [editorRef]
  )

  useEffect(() => {
    const editor = editorRef.current!
    const disposable = editor.onDidChangeModelContent(() => {
      if (decorationsOutdatedRef.current) {
        return
      }

      const model = editor.getModel()
      if (model && models.has(model.uri.path)) {
        setDecorationsOutdated(true)
      }
    })

    return () => {
      disposable.dispose()
    }
  }, [models, editorRef, setDecorationsOutdated])

  return { setDecorationsOutdated }
}

import { useCallback, useEffect, useRef } from 'react'
import codeEditorStyles from '@/components/code-editor.module.css'
import { useMonacoEditor } from './useMonacoEditor'
import { useReplModels } from './useReplModels'

export default function useReplDecorationsOutdated() {
  const [editorRef] = useMonacoEditor()
  const { models } = useReplModels()

  const decorationsOutdatedRef = useRef(false)
  const timeoutIdRef = useRef<NodeJS.Timeout>(undefined)

  const setDecorationsOutdated = useCallback(
    (outdated: boolean) => {
      if (decorationsOutdatedRef.current === outdated) {
        return
      }

      decorationsOutdatedRef.current = outdated

      clearTimeout(timeoutIdRef.current)

      const fn = () => {
        const domNode = editorRef.current?.getContainerDomNode()
        domNode?.classList.toggle(codeEditorStyles.jsreplDecorsOutdated!, outdated)
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
    const editor = editorRef.current
    if (!editor) {
      return
    }

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

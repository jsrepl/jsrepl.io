import { useEffect, useState } from 'react'
import type { Uri } from 'monaco-editor'
import { useMonacoEditor } from '@/hooks/useMonacoEditor'
import StatusBarButton from './status-bar-button'

export default function ModelLanguageItem() {
  const { editor } = useMonacoEditor()

  const [languageId, setLanguageId] = useState<string | null>(() => {
    const textModel = editor?.getModel()
    return textModel ? textModel.getLanguageId() : null
  })

  const [modelUri, setModelUri] = useState<Uri | null>(() => {
    const textModel = editor?.getModel()
    return textModel ? textModel.uri : null
  })

  useEffect(() => {
    if (!editor) {
      return
    }

    const textModel = editor.getModel()
    setLanguageId(textModel ? textModel.getLanguageId() : null)
    setModelUri(textModel ? textModel.uri : null)

    const disposer = editor.onDidChangeModel((e) => {
      const textModel = editor.getModel()
      setLanguageId(textModel ? textModel.getLanguageId() : null)
      setModelUri(e.newModelUrl)
    })

    return () => {
      disposer.dispose()
    }
  }, [editor])

  if (!languageId || !modelUri) {
    return null
  }

  const text = getLanguageDisplayText(languageId, modelUri)
  return <StatusBarButton>{text}</StatusBarButton>
}

function getLanguageDisplayText(languageId: string, uri: Uri): string {
  switch (languageId) {
    case 'javascript':
      return uri.path.toLowerCase().endsWith('.jsx') ? 'JavaScript (JSX)' : 'JavaScript'
    case 'typescript':
      return uri.path.toLowerCase().endsWith('.tsx') ? 'TypeScript (JSX)' : 'TypeScript'
    case 'css':
    case 'html':
    case 'json':
      return languageId.toUpperCase()
    case '':
      return 'Other'
    default:
      return languageId.charAt(0).toUpperCase() + languageId.slice(1)
  }
}

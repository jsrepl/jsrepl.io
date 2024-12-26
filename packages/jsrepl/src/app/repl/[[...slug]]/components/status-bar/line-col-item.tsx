import { useEffect, useState } from 'react'
import type { Selection } from 'monaco-editor'
import { useMonacoEditor } from '@/hooks/useMonacoEditor'
import StatusBarButton from './status-bar-button'

export default function LineColItem() {
  const { editor } = useMonacoEditor()
  const [selections, setSelections] = useState<Selection[] | null | undefined>(() =>
    editor?.getSelections()
  )

  useEffect(() => {
    if (editor) {
      setSelections(editor.getSelections())
    }
  }, [editor])

  useEffect(() => {
    if (!editor) {
      return
    }

    const disposer = editor.onDidChangeModel(() => {
      setSelections(editor.getSelections())
    })

    return () => {
      disposer.dispose()
    }
  }, [editor])

  useEffect(() => {
    if (!editor) {
      return
    }

    const disposer = editor.onDidChangeCursorSelection((e) => {
      setSelections([e.selection, ...e.secondarySelections])
    })

    return () => {
      disposer.dispose()
    }
  }, [editor])

  const handleClick = () => {
    editor?.focus()
    editor?.getAction('editor.action.gotoLine')?.run()
  }

  if (!editor || !selections || selections.length === 0) {
    return null
  }

  let text: React.ReactNode = null
  let charsSelected = 0

  if (selections.length === 1) {
    const selection = selections[0]!
    text = `Ln ${selection.positionLineNumber}, Col ${selection.positionColumn}`
    charsSelected = selection.isEmpty()
      ? 0
      : editor.getModel()?.getCharacterCountInRange(selection) ?? 0
  } else {
    // Multiple cursors
    text = `${selections.length} cursors`
    charsSelected = selections.reduce((acc, s) => {
      return acc + (s.isEmpty() ? 0 : editor.getModel()?.getCharacterCountInRange(s) ?? 0)
    }, 0)
  }

  if (charsSelected > 0) {
    text += ` (${charsSelected} ${charsSelected === 1 ? 'char' : 'chars'} selected)`
  }

  return <StatusBarButton onClick={handleClick}>{text}</StatusBarButton>
}

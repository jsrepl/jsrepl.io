import { useContext } from 'react'
import { CodeHighlighterContext } from '@/components/providers/code-highlighter-provider'

export function useCodeHighlighter() {
  const context = useContext(CodeHighlighterContext)
  if (!context) {
    throw new Error('useCodeHighlighter must be used within a CodeHighlighterProvider')
  }

  return context
}

'use client'

import { createContext, useCallback, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { BundledLanguage, BundledTheme } from 'shiki'
import { ShikiHighlighter, createShikiHighlighter } from '@/lib/shiki'

type ContextWithNotLoadedHighlighter = {
  highlighter: null
  loadedHighlightTheme: null
}

type ContextWithLoadedHighlighter = {
  highlighter: ShikiHighlighter
  loadedHighlightTheme: BundledTheme
}

export type CodeHighlighterContextType = {
  highlightCode: (code: string, lang: BundledLanguage | null) => string
} & (ContextWithNotLoadedHighlighter | ContextWithLoadedHighlighter)

export const CodeHighlighterContext = createContext<CodeHighlighterContextType | null>(null)

export function CodeHighlighterProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme: themeId } = useTheme()

  const [highlighterAndTheme, setHighlighterAndTheme] = useState<
    ContextWithNotLoadedHighlighter | ContextWithLoadedHighlighter
  >({
    highlighter: null,
    loadedHighlightTheme: null,
  })

  useEffect(() => {
    const theme = themeId as BundledTheme | undefined
    if (!theme) {
      return
    }

    createShikiHighlighter(theme).then((highlighter) => {
      setHighlighterAndTheme({
        highlighter,
        loadedHighlightTheme: theme,
      })
    })
  }, [themeId])

  const highlightCode = useCallback(
    (code: string, lang: BundledLanguage | null) => {
      const { highlighter, loadedHighlightTheme } = highlighterAndTheme
      if (!highlighter || !loadedHighlightTheme || !lang) {
        return escapeHtml(code)
      }

      return highlighter.codeToHtml(code, { lang, theme: loadedHighlightTheme })
    },
    [highlighterAndTheme]
  )

  const value = {
    ...highlighterAndTheme,
    highlightCode,
  }

  return <CodeHighlighterContext.Provider value={value}>{children}</CodeHighlighterContext.Provider>
}

function escapeHtml(str: string) {
  const escapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  }

  return str.replace(/[&<>]/g, (match) => escapeMap[match]!)
}

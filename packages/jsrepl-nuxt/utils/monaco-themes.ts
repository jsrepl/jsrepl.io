import { monacoTypescriptTokenProvider } from '@/utils/monaco-typescript-token-provider'
import { shikiToMonaco } from '@shikijs/monaco'
import * as monaco from 'monaco-editor'
import {
  type BundledLanguage,
  type BundledTheme,
  type HighlighterGeneric,
  createHighlighter,
} from 'shiki'
import type { ThemeDef } from '~/types/repl.types'

let shikiHighlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null

const loadedThemes = new Set<ThemeDef['id']>()

export async function loadMonacoTheme(theme: ThemeDef) {
  if (theme.provider === 'builtin') {
    if (shikiHighlighter) {
      shikiHighlighter.dispose()
      shikiHighlighter = null
    }

    monaco.languages.setMonarchTokensProvider(
      'typescript',
      monacoTypescriptTokenProvider as monaco.languages.IMonarchLanguage
    )

    return
  }

  if (theme.provider === 'custom') {
    if (shikiHighlighter) {
      shikiHighlighter.dispose()
      shikiHighlighter = null
    }

    monaco.languages.setMonarchTokensProvider(
      'typescript',
      monacoTypescriptTokenProvider as monaco.languages.IMonarchLanguage
    )

    if (loadedThemes.has(theme.id)) {
      return
    }

    try {
      const themeData = await theme.load()
      monaco.editor.defineTheme(theme.id, themeData)
      loadedThemes.add(theme.id)
    } catch (e) {
      console.error('loadMonacoTheme (custom)', e)
    }
  }

  if (theme.provider === 'shiki') {
    try {
      await loadShikiMonacoTheme(theme.id)
    } catch (e) {
      console.error('loadMonacoTheme (shiki)', e)
    }
  }
}

export async function loadShikiMonacoTheme(theme: ThemeDef['id']) {
  if (shikiHighlighter) {
    shikiHighlighter.dispose()
    shikiHighlighter = null
  }

  shikiHighlighter = await createHighlighter({
    themes: [theme],
    langs: ['json', 'tsx', /*'javascript',*/ 'html', 'css'],
    langAlias: {
      typescript: 'tsx',
    },
  })

  const setTheme = monaco.editor.setTheme

  try {
    shikiToMonaco(shikiHighlighter, monaco)
  } finally {
    // HACK: restore original setTheme, shikiToMonaco overwrites it, but not restores,
    // so second call `shikiToMonaco` will fail.
    monaco.editor.setTheme = setTheme
  }
}

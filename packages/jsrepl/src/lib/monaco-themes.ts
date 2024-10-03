import { shikiToMonaco } from '@shikijs/monaco'
import * as monaco from 'monaco-editor'
import {
  type BundledLanguage,
  type BundledTheme,
  type HighlighterGeneric,
  createHighlighter,
} from 'shiki'
import type { Theme } from '@/types'

let shikiHighlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null

export async function loadMonacoTheme(theme: Theme) {
  if (shikiHighlighter) {
    await shikiHighlighter.loadTheme(theme.id as BundledTheme)
  } else {
    shikiHighlighter = await createHighlighter({
      themes: [theme.id],
      langs: ['json', 'tsx', /*'javascript',*/ 'html', 'css'],
      langAlias: {
        typescript: 'tsx',
      },
    })
  }

  shikiToMonaco(shikiHighlighter, monaco)

  return () => {
    shikiHighlighter?.dispose()
    shikiHighlighter = null
  }
}

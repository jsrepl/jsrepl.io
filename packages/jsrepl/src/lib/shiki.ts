import {
  type BundledLanguage,
  type BundledTheme,
  type HighlighterGeneric,
  createHighlighter,
} from 'shiki'

export type ShikiHighlighter = HighlighterGeneric<BundledLanguage, BundledTheme>

let highlighter: ShikiHighlighter | null = null

export async function createShikiHighlighter(themeId: BundledTheme) {
  if (highlighter) {
    await highlighter.loadTheme(themeId)
  } else {
    highlighter = await createHighlighter({
      themes: [themeId],
      langs: ['json', 'tsx', 'jsx', 'html', 'css', 'markdown'],
      langAlias: {
        typescript: 'tsx',
        javascript: 'jsx',
      },
    })
  }

  return highlighter
}

export function disposeShikiHighlighter() {
  highlighter?.dispose()
  highlighter = null
}

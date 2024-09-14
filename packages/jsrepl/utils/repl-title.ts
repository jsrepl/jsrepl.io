import type { ReplStoredState } from '@/types/repl.types'

export function getReplTitle(replStoredState: ReplStoredState): string {
  try {
    const tsx = replStoredState.models.get('file:///index.tsx')?.content ?? ''
    const tsxFirstNonEmptyLine = tsx.match(/.+/)?.[0].trim() ?? ''

    if (tsxFirstNonEmptyLine.startsWith('//')) {
      const comment = tsx
        .match(/(\/\/[^\n]*\n?)+/)?.[0]
        .replace(/^\s*\/\/\s*/, '')
        .replace(/\n\s*\/\//, '')
        .trim()
      if (comment) {
        return transformTitle(comment)
      }
    }

    if (tsxFirstNonEmptyLine.startsWith('/*')) {
      const comment = tsx
        .match(/\/\*([\s\S]*?)\*\//)?.[1]
        .replace(/\n(\s+\*)?/g, '')
        .trim()
      if (comment) {
        return transformTitle(comment)
      }
    }

    if (tsxFirstNonEmptyLine) {
      return transformTitle(tsxFirstNonEmptyLine)
    }

    const html = replStoredState.models.get('file:///index.html')?.content ?? ''
    const htmlFirstNonEmptyLine = html.match(/.+/)?.[0].trim() ?? ''

    if (htmlFirstNonEmptyLine.startsWith('<!--')) {
      const comment = html.match(/<!--([\s\S]*?)-->/)?.[1].trim()
      if (comment) {
        return transformTitle(comment)
      }
    }

    if (htmlFirstNonEmptyLine) {
      return transformTitle(htmlFirstNonEmptyLine)
    }
  } catch {
    // ignore
  }

  return 'JSREPL'
}

function transformTitle(title: string) {
  title = title.trim()

  if (title.length > 50) {
    return title.slice(0, 50) + '…'
  }

  return title
}

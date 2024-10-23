import type { ReplStoredState } from '@/types/repl.types'

export function getReplTitle(replStoredState: ReplStoredState): string {
  let title: string | undefined

  try {
    const readme = replStoredState.fs.getFile('/README.md')
    title = readme?.content.match(/^#+\s+(.+)/)?.[1]
    if (title) {
      title = transformTitle(title)
    }
  } catch {
    // ignore
  }

  return title || 'JSREPL'
}

function transformTitle(title: string) {
  title = title.trim()

  if (title.length > 50) {
    return title.slice(0, 50) + '…'
  }

  return title
}

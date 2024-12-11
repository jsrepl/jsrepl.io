import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { LucideGitFork, LucideTrash2 } from 'lucide-react'
import { BundledLanguage, BundledTheme, codeToHtml } from 'shiki'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/datetime'
import * as ReplFS from '@/lib/repl-fs'
import { getPageUrl } from '@/lib/repl-stored-state/adapter-supabase'
import { ReplStoredState } from '@/types'

export default function ReplCard({ repl }: { repl: ReplStoredState }) {
  const { resolvedTheme: themeId } = useTheme()
  const url = useMemo(() => getPageUrl(repl), [repl])

  const filePath = repl.activeModel

  const code = useMemo(() => {
    const file = filePath ? ReplFS.getFile(repl.fs, filePath) : null
    return file ? file.content.trimEnd() : ''
  }, [repl.fs, filePath])

  const lang = useMemo<BundledLanguage | null>(() => {
    if (!filePath) {
      return null
    }

    const ext = filePath.split('.').pop()?.toLowerCase()
    if (!ext) {
      return null
    }

    switch (ext) {
      case 'ts':
        return 'typescript'
      case 'js':
        return 'javascript'
      case 'tsx':
        return 'tsx'
      case 'jsx':
        return 'jsx'
      case 'html':
        return 'html'
      case 'css':
        return 'css'
      case 'md':
        return 'markdown'
      case 'json':
        return 'json'
      default:
        return null
    }
  }, [filePath])

  const [highlightedCode, setHighlightedCode] = useState<string>(code)

  useEffect(() => {
    if (!lang) {
      return
    }

    let disposed = false

    codeToHtml(code, {
      lang: lang,
      theme: themeId as BundledTheme,
    }).then((html) => {
      if (!disposed) {
        setHighlightedCode(html)
      }
    })

    return () => {
      disposed = true
    }
  }, [code, lang, themeId])

  const updatedAtRelativeTime = useMemo(() => {
    return repl.updated_at ? formatRelativeTime(new Date(repl.updated_at)) : null
  }, [repl.updated_at])

  function fork() {
    console.log('fork')
  }

  function remove() {
    console.log('remove')
  }

  return (
    <div className="text-secondary-foreground hover:border-primary bg-secondary border-border group relative inline-flex flex-col overflow-hidden rounded border">
      <Link
        href={url}
        className="focus-visible:ring-primary focus-visible:outline-primary absolute inset-0 rounded ring-inset focus-visible:ring-2"
      />

      <div className="text-muted-foreground absolute right-1 top-1 flex items-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-has-[:focus-visible]:opacity-100">
        <Button variant="ghost" size="icon" onClick={fork}>
          <LucideGitFork size={16} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-destructive hover:text-destructive-foreground"
          onClick={remove}
        >
          <LucideTrash2 size={16} />
        </Button>
      </div>

      <pre
        className="bg-editor-background h-56 overflow-hidden p-5 text-[8px] leading-tight [&>pre]:contents"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />

      <div className="p-5">
        <h2 className="font-medium">Repl title</h2>
        <p className="text-muted-foreground line-clamp-3 text-sm">Repl description</p>
        {updatedAtRelativeTime && (
          <p className="text-muted-foreground mt-2 text-xs">{updatedAtRelativeTime}</p>
        )}
      </div>
    </div>
  )
}

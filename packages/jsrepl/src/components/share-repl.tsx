import { useEffect, useRef, useState } from 'react'
import { LucideClipboardCheck, LucideClipboardCopy, LucideLoader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthHelpers } from '@/hooks/useAuthHelpers'
import { useReplSave } from '@/hooks/useReplSave'
import { useUser } from '@/hooks/useUser'
import { getPageUrl } from '@/lib/repl-stored-state/adapter-default'

export default function ShareRepl() {
  const [savedState, saveReplState, { isNew, isSaving }] = useReplSave()
  const savedStateRef = useRef(savedState)
  useEffect(() => {
    savedStateRef.current = savedState
  }, [savedState])

  const user = useUser()
  const { signInWithGithub } = useAuthHelpers()

  const [copied, setCopied] = useState(false)
  const copiedTimeoutId = useRef<NodeJS.Timeout | undefined>(undefined)

  async function copySharableUrl() {
    if (isNew && user) {
      await saveReplState()
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    const sharableUrl = getPageUrl(savedStateRef.current)
    await navigator.clipboard.writeText(sharableUrl.toString())
    setCopied(true)

    clearTimeout(copiedTimeoutId.current)
    copiedTimeoutId.current = setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  if (isNew && !user) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p>Sign in to share your REPL. Current changes won&apos;t be lost.</p>
        <Button onClick={() => signInWithGithub({ popup: true })}>Sign in with GitHub</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="sm" onClick={copySharableUrl} disabled={isNew && isSaving}>
        {copied ? (
          <>
            <LucideClipboardCheck size={18} className="mr-1" />
            Copied!
          </>
        ) : (
          <>
            {isNew && isSaving ? (
              <LucideLoader size={18} className="mr-1 animate-spin" />
            ) : (
              <LucideClipboardCopy size={18} className="mr-1" />
            )}
            {!isNew ? 'Copy URL to clipboard' : 'Save and copy URL to clipboard'}
          </>
        )}
      </Button>
    </div>
  )
}

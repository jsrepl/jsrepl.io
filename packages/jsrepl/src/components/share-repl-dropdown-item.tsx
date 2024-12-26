import { useEffect, useRef } from 'react'
import { LucideLink } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthHelpers } from '@/hooks/useAuthHelpers'
import { useReplSave } from '@/hooks/useReplSave'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { useUser } from '@/hooks/useUser'
import { getPageUrl } from '@/lib/repl-stored-state/adapter-supabase'
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu'

export default function ShareReplDropdownItem() {
  const [state] = useReplStoredState()
  const [, saveReplState, { isNew, isSaving }] = useReplSave()
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const user = useUser()
  const { signInWithGithub } = useAuthHelpers()

  async function copySharableUrl() {
    if (isNew && user) {
      await saveReplState()
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    const sharableUrl = getPageUrl(stateRef.current, true)
    await navigator.clipboard.writeText(sharableUrl.toString())
    toast.success('Link copied to clipboard')
  }

  if (isNew && !user) {
    return (
      <>
        <DropdownMenuLabel className="text-muted-foreground text-sm font-normal">
          Sign in to share your REPL. Current changes won&apos;t be lost.
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signInWithGithub({ popup: true })}>
          Sign in with GitHub...
        </DropdownMenuItem>
      </>
    )
  }

  return (
    <DropdownMenuItem onClick={copySharableUrl} disabled={isNew && isSaving}>
      <LucideLink size={16} />
      {isNew ? 'Save and copy link...' : 'Copy link...'}
    </DropdownMenuItem>
  )
}

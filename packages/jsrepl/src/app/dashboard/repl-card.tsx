import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { LucideGitFork, LucideLoader2, LucideTrash2 } from 'lucide-react'
import { BundledLanguage, BundledTheme, codeToHtml } from 'shiki'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { useUser } from '@/hooks/useUser'
import { formatRelativeTime } from '@/lib/datetime'
import * as ReplFS from '@/lib/repl-fs'
import { fork, getPageUrl, remove } from '@/lib/repl-stored-state/adapter-supabase'
import { ReplStoredState } from '@/types'

export default function ReplCard({
  repl,
  customTimestamp,
}: {
  repl: ReplStoredState
  customTimestamp?: React.ReactNode
}) {
  const user = useUser()
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { resolvedTheme: themeId } = useTheme()
  const router = useRouter()

  const [isForking, setIsForking] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const isBusy = isForking || isRemoving

  const url = useMemo(() => getPageUrl(repl), [repl])

  const filePath = repl.activeModel

  const code = useMemo(() => {
    const file = filePath ? ReplFS.getFile(repl.fs, filePath) : null
    return file ? file.content.trimEnd() : ''
  }, [repl.fs, filePath])

  const shikiLang = useMemo<BundledLanguage | null>(() => {
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

  const [highlightedCode, setHighlightedCode] = useState<string>(escapeHtml(code))

  useEffect(() => {
    if (!shikiLang) {
      return
    }

    let disposed = false

    codeToHtml(code, {
      lang: shikiLang,
      theme: themeId as BundledTheme,
    }).then((html) => {
      if (!disposed) {
        setHighlightedCode(html)
      }
    })

    return () => {
      disposed = true
    }
  }, [code, shikiLang, themeId])

  async function onForkClick() {
    try {
      setIsForking(true)
      const forkedRepl = await fork(repl, { supabase })
      toast('Forked.', {
        description: forkedRepl.title,
        action: {
          label: 'Open',
          onClick: () => {
            router.push(`/repl/${forkedRepl.id}`)
          },
        },
      })

      const queryKey = ['user-repls', user?.id]
      queryClient.setQueryData<ReplStoredState[]>(queryKey, (prev) => {
        return prev ? [forkedRepl, ...prev] : prev
      })
    } catch (error) {
      console.error(error)
      toast.error('Failed to fork.')
    } finally {
      setIsForking(false)
    }
  }

  return (
    <div className="text-secondary-foreground hover:border-primary bg-secondary border-border group relative inline-flex flex-col overflow-hidden rounded border">
      <pre
        className="bg-editor-background after:to-editor-background relative h-48 overflow-hidden p-5 text-[7px] leading-tight after:absolute after:bottom-0 after:left-0 after:right-0 after:h-6 after:bg-gradient-to-b after:from-transparent [&>pre]:contents"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />

      <Link
        href={url}
        className="focus-visible:ring-primary focus-visible:outline-primary absolute inset-0 rounded ring-inset focus-visible:ring-2"
      />

      <div className="text-muted-foreground absolute right-1 top-1 flex items-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-has-[:focus-visible]:opacity-100">
        {user && (
          <Button variant="ghost" size="icon" onClick={onForkClick} disabled={isBusy}>
            {isForking ? (
              <LucideLoader2 size={16} className="animate-spin" />
            ) : (
              <LucideGitFork size={16} />
            )}
          </Button>
        )}

        {user && repl.user_id === user.id && (
          <RemoveButton
            repl={repl}
            isBusy={isBusy}
            isRemoving={isRemoving}
            setIsRemoving={setIsRemoving}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-medium">{repl.title || 'Untitled'}</h2>
        <p className="text-muted-foreground line-clamp-3 text-sm">{repl.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          {customTimestamp ?? <Timestamp repl={repl} />}
          {repl.user && (
            <div className="text-muted-foreground flex min-w-0 items-center gap-1 text-xs">
              <UserAvatar user={repl.user} size={18} />
              <span className="min-w-0 flex-1 overflow-hidden text-ellipsis">
                {repl.user.user_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Timestamp({ repl }: { repl: ReplStoredState }) {
  const updatedAtRelativeTime = useMemo(() => {
    return repl.updated_at ? formatRelativeTime(new Date(repl.updated_at)) : null
  }, [repl.updated_at])

  return (
    <>
      {updatedAtRelativeTime && (
        <span className="text-muted-foreground text-nowrap text-xs">{updatedAtRelativeTime}</span>
      )}
    </>
  )
}

function RemoveButton({
  repl,
  isBusy,
  isRemoving,
  setIsRemoving,
}: {
  repl: ReplStoredState
  isBusy: boolean
  isRemoving: boolean
  setIsRemoving: Dispatch<SetStateAction<boolean>>
}) {
  const user = useUser()
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)

  async function onRemoveClick(e: React.MouseEvent<HTMLButtonElement>) {
    // Don't close the dialog on click
    e.preventDefault()

    try {
      setIsRemoving(true)
      await remove(repl.id, { supabase })
      toast('Deleted.')

      queryClient.setQueryData<ReplStoredState[]>(['user-repls', user?.id], (prev) => {
        return prev ? prev.filter((x) => x.id !== repl.id) : prev
      })

      queryClient.setQueryData<ReplStoredState[]>(['recently-viewed-repls', user?.id], (prev) => {
        return prev ? prev.filter((x) => x.id !== repl.id) : prev
      })
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete.')
    } finally {
      setIsRemoving(false)
      setRemoveDialogOpen(false)
    }
  }

  return (
    <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-destructive hover:text-destructive-foreground"
          disabled={isBusy}
        >
          {isRemoving ? (
            <LucideLoader2 size={16} className="animate-spin" />
          ) : (
            <LucideTrash2 size={16} />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this REPL?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <b>{repl.title}</b>?
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'destructive' })}
            onClick={onRemoveClick}
            disabled={isBusy}
          >
            {isRemoving ? (
              <>
                <LucideLoader2 size={16} className="mr-1 animate-spin" />
                <span>Deleting</span>
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function escapeHtml(str: string) {
  const escapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  }

  return str.replace(/[&<>]/g, (match) => escapeMap[match]!)
}

'use client'

import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { LucideGitFork, LucideLoader2, LucideTrash2 } from 'lucide-react'
import { BundledLanguage } from 'shiki'
import { toast } from 'sonner'
import { RelativeTime } from '@/components/relative-time'
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
import { useCodeHighlighter } from '@/hooks/useCodeHighlighter'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { useUser } from '@/hooks/useUser'
import * as ReplFS from '@/lib/repl-fs'
import { fork, getPageUrl, remove } from '@/lib/repl-stored-state/adapter-supabase'
import { ReplStoredState } from '@/types'

type Props =
  | {
      repl: ReplStoredState
      mode?: undefined
    }
  | {
      repl: ReplStoredState & {
        viewed_at: string
      }
      mode: 'recently-viewed'
    }

export default function ReplCard({ repl, mode }: Props) {
  const user = useUser()
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { highlightCode } = useCodeHighlighter()

  const [isForking, setIsForking] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const isBusy = isForking || isRemoving

  const url = useMemo(() => getPageUrl(repl), [repl])

  const filePath = repl.activeModel
  const datetime = mode === 'recently-viewed' ? repl.viewed_at : repl.updated_at

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

  const highlightedCode = useMemo<string>(() => {
    return highlightCode(code, shikiLang)
  }, [code, shikiLang, highlightCode])

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

      queryClient.invalidateQueries({ queryKey: ['user-repls', user?.id] })
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
          {datetime && (
            <span className="text-muted-foreground text-nowrap text-xs">
              <RelativeTime value={datetime} />
            </span>
          )}
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

      queryClient.invalidateQueries({ queryKey: ['user-repls', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['recently-viewed-repls', user?.id] })
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

import { createContext } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthHelpers } from '@/hooks/useAuthHelpers'
import { useMonacoEditor } from '@/hooks/useMonacoEditor'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { useUser } from '@/hooks/useUser'
import { useUserStoredState } from '@/hooks/useUserStoredState'
import { useWritableModels } from '@/hooks/useWritableModels'
import { checkDirty, fork, getPageUrl, save } from '@/lib/repl-stored-state/adapter-supabase'
import { ResponseError, isAbortError } from '@/lib/response-error'
import type { ReplStoredState } from '@/types/repl.types'

export type ReplSaveContextType = {
  savedState: ReplStoredState
  saveState: () => Promise<void>
  forkState: () => Promise<void>
  isNew: boolean
  isDirty: boolean
  isSaving: boolean
  allowSave: boolean
  allowFork: boolean
}

export const ReplSaveContext = createContext<ReplSaveContextType | null>(null)

export default function ReplSaveProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const supabase = useSupabaseClient()
  const user = useUser()
  const [state, setState] = useReplStoredState()
  const [userStoredState] = useUserStoredState()
  const [editorRef] = useMonacoEditor()
  const { signInWithGithub } = useAuthHelpers()
  const { flushPendingChanges } = useWritableModels()
  const [savedState, setSavedState] = useState<ReplStoredState>(state)
  const [isSaving, setIsSaving] = useState(false)

  const formatOnSave = useMemo(
    () => userStoredState.workbench.formatOnSave,
    [userStoredState.workbench.formatOnSave]
  )

  const stateRef = useRef<ReplStoredState>(state)
  const abortControllerRef = useRef<AbortController | null>(null)

  const isNew = useMemo<boolean>(() => !state.id, [state.id])
  const isDirty = useMemo<boolean>(() => checkDirty(state, savedState), [state, savedState])

  const allowSave = useMemo<boolean>(
    () => !isSaving && (isNew || isDirty),
    [isSaving, isNew, isDirty]
  )

  const allowFork = useMemo<boolean>(() => !isSaving && !isNew, [isSaving, isNew])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const handleSaveError = useCallback(
    async (error: unknown) => {
      const isAborted = isAbortError(error instanceof ResponseError ? error.cause : error)
      if (isAborted) {
        return
      }

      console.error(error)

      if (error instanceof ResponseError) {
        if (error.status === 401) {
          toast.info('Please sign in to save your changes.', {
            action: {
              label: 'Sign in with Github',
              onClick: () => {
                signInWithGithub({ popup: true })
              },
            },
          })
        } else {
          toast.error(error.message, {
            description: `${error.status} ${error.statusText}: ${error.cause ?? 'Something went wrong :('}`,
          })
        }
      } else {
        toast.error('Failed to save', {
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    },
    [signInWithGithub]
  )

  const saveWrapper = useCallback(
    async (callback: (args: { signal: AbortSignal }) => Promise<void>) => {
      let signal: AbortSignal | null = null

      try {
        setIsSaving(true)

        abortControllerRef.current?.abort()
        abortControllerRef.current = new AbortController()
        signal = abortControllerRef.current.signal

        await callback({ signal })
      } catch (error) {
        handleSaveError(error)
      } finally {
        if (signal === abortControllerRef.current?.signal) {
          setIsSaving(false)
          abortControllerRef.current = null
        }
      }
    },
    [handleSaveError]
  )

  const saveState = useCallback<() => Promise<void>>(async () => {
    await saveWrapper(saveFn)

    async function saveFn({ signal }: { signal: AbortSignal }) {
      // TODO: format all dirty models somehow.
      if (formatOnSave) {
        await editorRef.current?.getAction('editor.action.formatDocument')!.run()
      }

      if (!user) {
        toast.info('Please sign in to save your changes.', {
          duration: 3000,
          action: {
            label: 'Sign in with Github',
            onClick: () => {
              signInWithGithub({ popup: true })
            },
          },
        })
        return
      }

      const flushedState = await Promise.race([
        flushPendingChanges(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ])
      const state = flushedState ?? stateRef.current

      const isNew = !state.id
      const shouldSave = isNew || user.id !== state.user_id || checkDirty(state, savedState)
      if (!shouldSave) {
        return
      }

      let newState: ReplStoredState
      let pageUrl: URL
      if (isNew || user.id === state.user_id) {
        newState = await save(state, { supabase, signal })
        pageUrl = getPageUrl(newState)
        history.replaceState(null, '', pageUrl)

        if (isNew) {
          toast.success('Saved', {
            duration: 2000,
          })
        }
      } else {
        newState = await fork(state, { supabase, signal })
        pageUrl = getPageUrl(newState)
        history.pushState(null, '', pageUrl)

        toast.success(state.user_id ? 'Forked' : 'Saved', {
          duration: 2000,
        })
      }

      setSavedState(newState)
      setState((prev) => ({
        ...newState,
        fs: prev.fs,
        openedModels: prev.openedModels,
        activeModel: prev.activeModel,
        showPreview: prev.showPreview,
      }))

      const queryKey = ['repl', { slug: [newState.id] }, pageUrl.searchParams]
      queryClient.setQueryData(queryKey, newState)
    }
  }, [
    supabase,
    formatOnSave,
    flushPendingChanges,
    user,
    editorRef,
    setState,
    saveWrapper,
    signInWithGithub,
    savedState,
    queryClient,
  ])

  const forkState = useCallback<() => Promise<void>>(async () => {
    await saveWrapper(forkFn)

    async function forkFn({ signal }: { signal: AbortSignal }) {
      if (!user) {
        toast.info('Please sign in to fork this repl.', {
          duration: 3000,
          action: {
            label: 'Sign in with Github',
            onClick: () => {
              signInWithGithub({ popup: true })
            },
          },
        })
        return
      }

      await flushPendingChanges()

      const newState = await fork(stateRef.current, { supabase, signal })
      const pageUrl = getPageUrl(newState)
      history.pushState(null, '', pageUrl)

      toast.success('Forked', {
        duration: 2000,
      })

      setSavedState(newState)
      setState((prev) => ({
        ...newState,
        fs: prev.fs,
        openedModels: prev.openedModels,
        activeModel: prev.activeModel,
        showPreview: prev.showPreview,
      }))

      const queryKey = ['repl', { slug: [newState.id] }, pageUrl.searchParams]
      queryClient.setQueryData(queryKey, newState)
    }
  }, [flushPendingChanges, user, setState, saveWrapper, signInWithGithub, queryClient, supabase])

  useEffect(() => {
    if (!isDirty) {
      return
    }

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }

    window.addEventListener('beforeunload', handler)

    return () => {
      window.removeEventListener('beforeunload', handler)
    }
  }, [isDirty])

  return (
    <ReplSaveContext.Provider
      value={{ savedState, saveState, forkState, isNew, isDirty, isSaving, allowSave, allowFork }}
    >
      {children}
    </ReplSaveContext.Provider>
  )
}

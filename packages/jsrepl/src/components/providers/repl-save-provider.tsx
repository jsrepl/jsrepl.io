import { createContext } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigationGuard } from 'next-navigation-guard'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UnsavedChangesDialog } from '@/components/unsaved-changes-dialog'
import { useAuthHelpers } from '@/hooks/useAuthHelpers'
import { useMonacoEditor } from '@/hooks/useMonacoEditor'
import { replQueryKey } from '@/hooks/useReplParams'
import { useReplSavedState } from '@/hooks/useReplSavedState'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { useUser } from '@/hooks/useUser'
import { useUserStoredState } from '@/hooks/useUserStoredState'
import { useWritableModels } from '@/hooks/useWritableModels'
import {
  checkDirty,
  checkEffectivelyDirty,
  fork,
  getPageUrl,
  save,
} from '@/lib/repl-stored-state/adapter-supabase'
import { ResponseError, isAbortError } from '@/lib/response-error'
import type { ReplStoredState } from '@/types/repl.types'

export type ReplSaveContextType = {
  savedState: ReplStoredState
  saveState: () => Promise<boolean>
  forkState: () => Promise<boolean>
  isNew: boolean
  isDirty: boolean
  isEffectivelyDirty: boolean
  isSaving: boolean
  isForking: boolean
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
  const [savedState, setSavedState] = useReplSavedState()
  const [isSaving, setIsSaving] = useState(false)
  const [isForking, setIsForking] = useState(false)

  const formatOnSave = useMemo(
    () => userStoredState.workbench.formatOnSave,
    [userStoredState.workbench.formatOnSave]
  )

  const stateRef = useRef<ReplStoredState>(state)
  const abortControllerRef = useRef<AbortController | null>(null)

  const isNew = useMemo<boolean>(() => !state.id, [state.id])

  const isEffectivelyDirty = useMemo<boolean>(
    () => checkEffectivelyDirty(state, savedState),
    [state, savedState]
  )

  const isDirty = useMemo<boolean>(() => checkDirty(state, savedState), [state, savedState])

  const allowSave = useMemo<boolean>(
    () => !isSaving && !isForking && (isNew || isEffectivelyDirty),
    [isSaving, isForking, isNew, isEffectivelyDirty]
  )

  const allowFork = useMemo<boolean>(() => !isForking && !isNew, [isForking, isNew])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const handleSaveOrForkError = useCallback(
    async (type: 'save' | 'fork', error: unknown) => {
      const isAborted = isAbortError(error instanceof ResponseError ? error.cause : error)
      if (isAborted) {
        return
      }

      console.error(error)

      if (error instanceof ResponseError) {
        if (error.status === 401) {
          toast.info(
            type === 'save'
              ? 'Please sign in to save your changes.'
              : 'Please sign in to fork this REPL.',
            {
              action: {
                label: 'Sign in with Github',
                onClick: () => {
                  signInWithGithub({ popup: true })
                },
              },
            }
          )
        } else {
          toast.error(error.message, {
            description: `${error.status} ${error.statusText}: ${error.cause ?? 'Something went wrong :('}`,
          })
        }
      } else {
        toast.error(`Failed to ${type}`, {
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    },
    [signInWithGithub]
  )

  const saveWrapper = useCallback(
    async (callback: (args: { signal: AbortSignal }) => Promise<boolean>) => {
      let signal: AbortSignal | null = null

      try {
        setIsSaving(true)

        abortControllerRef.current?.abort()
        abortControllerRef.current = new AbortController()
        signal = abortControllerRef.current.signal

        return await callback({ signal })
      } catch (error) {
        handleSaveOrForkError('save', error)
        return false
      } finally {
        if (signal === abortControllerRef.current?.signal) {
          setIsSaving(false)
          abortControllerRef.current = null
        }
      }
    },
    [handleSaveOrForkError]
  )

  const forkWrapper = useCallback(
    async (callback: (args: { signal: AbortSignal }) => Promise<boolean>) => {
      let signal: AbortSignal | null = null

      try {
        setIsForking(true)

        abortControllerRef.current?.abort()
        abortControllerRef.current = new AbortController()
        signal = abortControllerRef.current.signal

        return await callback({ signal })
      } catch (error) {
        handleSaveOrForkError('fork', error)
        return false
      } finally {
        if (signal === abortControllerRef.current?.signal) {
          setIsForking(false)
          abortControllerRef.current = null
        }
      }
    },
    [handleSaveOrForkError]
  )

  const saveState = useCallback<() => Promise<boolean>>(async () => {
    return await saveWrapper(saveFn)

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
        return false
      }

      const flushedState = await Promise.race([
        flushPendingChanges(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ])
      const state = flushedState ?? stateRef.current

      const isNew = !state.id

      const saveType = isNew
        ? 'create'
        : user.id !== state.user_id
          ? 'fork'
          : checkDirty(state, savedState)
            ? 'update'
            : null

      if (!saveType) {
        return true
      }

      const newState =
        saveType === 'create' || saveType === 'update'
          ? await save(state, { supabase, signal })
          : await fork(state, { supabase, signal })

      setSavedState(newState)
      setState((prev) => ({
        ...newState,
        fs: prev.fs,
        openedModels: prev.openedModels,
        activeModel: prev.activeModel,
        showPreview: prev.showPreview,
      }))

      const pageUrl = getPageUrl(newState)

      const queryKey = replQueryKey({ id: newState.id, searchParams: pageUrl.searchParams })
      queryClient.setQueryData(queryKey, newState)

      queryClient.setQueryData<ReplStoredState[]>(['user-repls', user.id], (prev) => {
        return prev ? [newState, ...prev.filter((repl) => repl.id !== newState.id)] : prev
      })

      if (saveType === 'create') {
        history.replaceState(null, '', pageUrl)
        toast.success('Saved', {
          duration: 2000,
        })
      } else if (saveType === 'fork') {
        history.pushState(null, '', pageUrl)
        toast.success('Forked and saved', {
          duration: 2000,
        })
      }

      return true
    }
  }, [
    supabase,
    formatOnSave,
    flushPendingChanges,
    user,
    editorRef,
    setState,
    setSavedState,
    saveWrapper,
    signInWithGithub,
    savedState,
    queryClient,
  ])

  const forkState = useCallback<() => Promise<boolean>>(async () => {
    return await forkWrapper(forkFn)

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
        return false
      }

      await flushPendingChanges()

      const newState = await fork(stateRef.current, { supabase, signal })

      setSavedState(newState)
      setState((prev) => ({
        ...newState,
        fs: prev.fs,
        openedModels: prev.openedModels,
        activeModel: prev.activeModel,
        showPreview: prev.showPreview,
      }))

      const pageUrl = getPageUrl(newState)

      const queryKey = replQueryKey({ id: newState.id, searchParams: pageUrl.searchParams })
      queryClient.setQueryData(queryKey, newState)

      queryClient.setQueryData<ReplStoredState[]>(['user-repls', user.id], (prev) => {
        return prev ? [newState, ...prev] : prev
      })

      history.pushState(null, '', pageUrl)

      toast.success('Forked', {
        duration: 2000,
      })

      return true
    }
  }, [
    flushPendingChanges,
    user,
    setState,
    setSavedState,
    forkWrapper,
    signInWithGithub,
    queryClient,
    supabase,
  ])

  return (
    <ReplSaveContext.Provider
      value={{
        savedState,
        saveState,
        forkState,
        isNew,
        isEffectivelyDirty,
        isDirty,
        isSaving,
        isForking,
        allowSave,
        allowFork,
      }}
    >
      {children}
      <NavigationGuard isActive={isEffectivelyDirty} saveState={saveState} />
    </ReplSaveContext.Provider>
  )
}

function NavigationGuard({
  isActive,
  saveState,
}: {
  isActive: boolean
  saveState: () => Promise<boolean>
}) {
  const navGuard = useNavigationGuard({ enabled: isActive })
  const user = useUser()
  const { signInWithGithub } = useAuthHelpers()

  return (
    <UnsavedChangesDialog
      title="You have unsaved changes"
      description={
        <>
          Are you sure you want to leave this page?
          <br />
          Changes will be lost.
        </>
      }
      discardAndLeaveButtonText="Discard changes"
      cancelButtonText="No, stay on page"
      saveAndLeaveButtonText={user ? 'Save and leave' : 'Sign in to save...'}
      open={navGuard.active}
      onOpenChange={(open) => {
        if (!open) {
          navGuard.reject()
        }
      }}
      onSaveAndLeave={async () => {
        if (!user) {
          signInWithGithub({ popup: true })
          // Keep the dialog open
          return false
        }

        try {
          const success = await saveState()
          if (success) {
            navGuard.accept()
          } else {
            navGuard.reject()
          }
        } catch {
          navGuard.reject()
        }
      }}
      onDiscardAndLeave={navGuard.accept}
    />
  )
}

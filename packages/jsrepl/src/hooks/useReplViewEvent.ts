import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Database, ReplStoredState } from '@/types'
import { useReplSavedState } from './useReplSavedState'
import { useSupabaseClient } from './useSupabaseClient'
import { useUser } from './useUser'

export function useReplViewEvent() {
  const [savedState] = useReplSavedState()
  const supabase = useSupabaseClient<Database>()
  const user = useUser()
  const queryClient = useQueryClient()

  const viewedAtRef = useRef(new Date().toISOString())

  useEffect(() => {
    if (!user || !savedState.id) {
      return
    }

    viewedAtRef.current = new Date().toISOString()

    supabase
      .from('views')
      .insert({
        repl_id: savedState.id,
      })
      .then(({ error }) => {
        if (error) {
          console.error('Error posting view event', error)
        }
      })
  }, [savedState.id, supabase, user])

  useEffect(() => {
    if (!user) {
      return
    }

    const queryKey = ['recently-viewed-repls', user.id]
    queryClient.setQueryData<
      (ReplStoredState & {
        viewed_at: string
      })[]
    >(queryKey, (prev) => {
      if (!prev) {
        return prev
      }

      return [
        { ...savedState, viewed_at: viewedAtRef.current },
        ...prev.filter(({ id }) => id !== savedState.id),
      ]
    })
  }, [savedState, queryClient, user])
}

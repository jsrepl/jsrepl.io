import { useContext } from 'react'
import { ReplSaveContext } from '@/components/providers/repl-save-provider'
import { ReplStoredState } from '@/types/repl.types'

export function useReplSave(): [
  ReplStoredState,
  () => Promise<void>,
  {
    isNew: boolean
    isDirty: boolean
    isSaving: boolean
    allowSave: boolean
    forkState: () => Promise<void>
    allowFork: boolean
  },
] {
  const { savedState, saveState, forkState, isNew, isDirty, isSaving, allowSave, allowFork } =
    useContext(ReplSaveContext)!
  return [savedState, saveState, { isNew, isDirty, isSaving, allowSave, forkState, allowFork }]
}

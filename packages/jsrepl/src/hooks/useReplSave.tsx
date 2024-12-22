import { useContext } from 'react'
import { ReplSaveContext } from '@/components/providers/repl-save-provider'
import { ReplStoredState } from '@/types/repl.types'

export function useReplSave(): [
  ReplStoredState,
  () => Promise<boolean>,
  {
    isNew: boolean
    isDirty: boolean
    isEffectivelyDirty: boolean
    isSaving: boolean
    isForking: boolean
    allowSave: boolean
    forkState: () => Promise<boolean>
    allowFork: boolean
  },
] {
  const {
    savedState,
    saveState,
    forkState,
    isNew,
    isDirty,
    isEffectivelyDirty,
    isSaving,
    isForking,
    allowSave,
    allowFork,
  } = useContext(ReplSaveContext)!

  return [
    savedState,
    saveState,
    { isNew, isDirty, isEffectivelyDirty, isSaving, isForking, allowSave, forkState, allowFork },
  ]
}

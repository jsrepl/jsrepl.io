import { LucideCheckCheck, LucideLoader, LucideSave } from 'lucide-react'
import { useReplSave } from '@/hooks/useReplSave'
import { cn } from '@/lib/utils'
import StatusBarButton from './status-bar-button'

enum StatusType {
  SAVING,
  DIRTY,
  SAVED,
}

export default function HasChangesItem() {
  const [, saveState, { isSaving, isEffectivelyDirty, isForking, allowSave }] = useReplSave()

  const handleClick = () => {
    if (isSaving || isForking || !allowSave) {
      return
    }

    saveState()
  }

  const type =
    isSaving || isForking
      ? StatusType.SAVING
      : isEffectivelyDirty
        ? StatusType.DIRTY
        : StatusType.SAVED

  return (
    <StatusBarButton onClick={handleClick} className="grid text-start">
      <span
        className={cn(
          'invisible col-span-full row-span-full flex items-center gap-1',
          type === StatusType.SAVING && 'visible'
        )}
      >
        <LucideLoader size={13} className="animate-spin" />
        Saving...
      </span>
      <span
        className={cn(
          'invisible col-span-full row-span-full flex items-center gap-1',
          type === StatusType.DIRTY && 'visible'
        )}
      >
        <LucideSave size={13} strokeWidth={1.5} />
        Has changes
      </span>
      <span
        className={cn(
          'invisible col-span-full row-span-full flex items-center gap-1',
          type === StatusType.SAVED && 'visible'
        )}
      >
        <LucideCheckCheck size={13} />
        Saved
      </span>
    </StatusBarButton>
  )
}

'use client'

import { MouseEvent, ReactNode, useTransition } from 'react'
import { LucideLoader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange?: (open: boolean) => void
  title: ReactNode
  description: ReactNode
  discardAndLeaveButtonText: ReactNode
  cancelButtonText: ReactNode
  saveAndLeaveButtonText: ReactNode
  onSaveAndLeave: () => void | false | Promise<void | false>
  onDiscardAndLeave: () => void
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  title,
  description,
  discardAndLeaveButtonText,
  cancelButtonText,
  saveAndLeaveButtonText,
  onSaveAndLeave,
  onDiscardAndLeave,
}: Props) {
  const [isSaving, startSaveTransition] = useTransition()
  const isBusy = isSaving

  async function saveAndLeave(e: MouseEvent<HTMLButtonElement>) {
    // Don't close the dialog on click
    e.preventDefault()

    startSaveTransition(async () => {
      const result = await onSaveAndLeave()
      if (result !== false) {
        onOpenChange?.(false)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogAction
            className={cn(buttonVariants({ variant: 'destructive' }), 'mr-auto')}
            onClick={onDiscardAndLeave}
            disabled={isBusy}
          >
            {discardAndLeaveButtonText}
          </AlertDialogAction>

          <AlertDialogCancel>{cancelButtonText}</AlertDialogCancel>

          <AlertDialogAction onClick={saveAndLeave} disabled={isBusy}>
            {isSaving ? (
              <>
                <LucideLoader2 size={16} className="mr-1 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              saveAndLeaveButtonText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

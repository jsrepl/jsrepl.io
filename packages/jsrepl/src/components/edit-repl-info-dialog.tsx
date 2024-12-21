import { useEffect, useState } from 'react'
import { DialogProps } from '@radix-ui/react-dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useReplSave } from '@/hooks/useReplSave'
import { useReplStoredState } from '@/hooks/useReplStoredState'

const MIN_TITLE_LENGTH = 3
const MAX_TITLE_LENGTH = 100
const MIN_DESCRIPTION_LENGTH = 0
const MAX_DESCRIPTION_LENGTH = 1000

export default function EditReplInfoDialog(props?: DialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent>
        <EditReplInfoDialogContent closeDialog={() => props?.onOpenChange?.(false)} />
      </DialogContent>
    </Dialog>
  )
}

function EditReplInfoDialogContent({ closeDialog }: { closeDialog: () => void }) {
  const [replState, setReplState] = useReplStoredState()
  const [, saveState] = useReplSave()
  const [title, setTitle] = useState(replState.title)
  const [description, setDescription] = useState(replState.description)

  const onSave = async () => {
    const error = validate({ title, description })
    if (error) {
      toast.error(error)
      return
    }

    setReplState((prev) => ({
      ...prev,
      title,
      description,
    }))

    closeDialog()

    await saveState()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit REPL Info</DialogTitle>
        <DialogDescription className="sr-only">
          Edit the title and description of your REPL
        </DialogDescription>
      </DialogHeader>

      <div className="text-muted-foreground my-2 space-y-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            minLength={MIN_TITLE_LENGTH}
            maxLength={MAX_TITLE_LENGTH}
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            minLength={MIN_DESCRIPTION_LENGTH}
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full text-sm"
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Cancel</Button>
        </DialogClose>

        <Button onClick={onSave}>Save changes</Button>
      </DialogFooter>
    </>
  )
}

function validate({ title, description }: { title: string; description: string }) {
  if (title.length < MIN_TITLE_LENGTH) {
    return `Title must be at least ${MIN_TITLE_LENGTH} characters long`
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return `Title must be at most ${MAX_TITLE_LENGTH} characters long`
  }

  if (description.length < MIN_DESCRIPTION_LENGTH) {
    return `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters long`
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters long`
  }

  return null
}

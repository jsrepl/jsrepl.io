import React from 'react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Toaster } from '../components/ui/sonner'

export default {
  component: Toaster,
}

export const Default = () => {
  const showToast = () => {
    toast('Event has been created.', {
      duration: Infinity,
    })
  }

  const showToastWithDescription = () => {
    toast('Event has been created.', {
      duration: Infinity,
      description: 'This is a description.',
    })
  }

  const showToastWithAction = () => {
    toast('Event has been created.', {
      duration: Infinity,
      action: {
        label: 'Undo',
        onClick: () => {},
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    })
  }

  const showErrorToast = () => {
    toast.error('An error occurred.', {
      duration: Infinity,
      action: {
        label: 'Undo',
        onClick: () => {},
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    })
  }

  const showSuccessToast = () => {
    toast.success('Success!', {
      duration: Infinity,
    })
  }

  const showWarningToast = () => {
    toast.warning('This is a warning.', {
      duration: Infinity,
    })
  }

  return (
    <>
      <Toaster />
      <div className="flex flex-col items-start gap-2">
        <Button onClick={showToast}>Show Toast</Button>
        <Button onClick={showToastWithDescription}>Show Toast with Description</Button>
        <Button onClick={showToastWithAction}>Show Toast with Action</Button>
        <Button onClick={showErrorToast}>Show Error Toast</Button>
        <Button onClick={showSuccessToast}>Show Success Toast</Button>
        <Button onClick={showWarningToast}>Show Warning Toast</Button>
      </div>
    </>
  )
}

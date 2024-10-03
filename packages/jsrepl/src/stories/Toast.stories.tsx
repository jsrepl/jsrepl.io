import React from 'react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Toaster } from '../components/ui/sonner'

export default {
  component: Toaster,
}

export const Default = () => {
  const showToast = () => {
    toast('Event has been created.')
  }

  return (
    <>
      <Toaster />
      <Button onClick={showToast}>Show Toast</Button>
    </>
  )
}

'use client'

import ReplPlaygroundProviders from '@/components/repl-playground-providers'
import { Toaster } from '@/components/ui/sonner'
import ReplPlaygroundMain from './repl-playground-main'
import Toasts from './toasts'

export default function ReplPlaygroundBrowser() {
  return (
    <ReplPlaygroundProviders>
      <ReplPlaygroundMain />
      <Toaster />
      <Toasts />
    </ReplPlaygroundProviders>
  )
}

'use client'

import ReplPlaygroundProviders from '@/components/repl-playground-providers'
import ReplPlaygroundMain from './repl-playground-main'
import Toasts from './toasts'

export default function ReplPlaygroundBrowser() {
  return (
    <ReplPlaygroundProviders>
      <ReplPlaygroundMain />
      <Toasts />
    </ReplPlaygroundProviders>
  )
}

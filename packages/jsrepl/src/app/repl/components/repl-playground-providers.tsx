import React from 'react'
import ReplInfoProvider from '@/components/repl-info-provider'
import ReplStateProvider from '@/components/repl-state-provider'
import UserStateProvider from '@/components/user-state-provider'

export default function ReplPlaygroundProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReplStateProvider>
      <UserStateProvider>
        <ReplInfoProvider>{children}</ReplInfoProvider>
      </UserStateProvider>
    </ReplStateProvider>
  )
}

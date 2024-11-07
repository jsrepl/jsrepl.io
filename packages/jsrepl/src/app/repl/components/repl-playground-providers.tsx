import React from 'react'
import ReplHistoryModeProvider from '@/components/repl-history-mode-provider'
import ReplInfoProvider from '@/components/repl-info-provider'
import ReplPayloadsProvider from '@/components/repl-payloads-provider'
import ReplStateProvider from '@/components/repl-state-provider'
import UserStateProvider from '@/components/user-state-provider'

export default function ReplPlaygroundProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReplStateProvider>
      <UserStateProvider>
        <ReplInfoProvider>
          <ReplHistoryModeProvider>
            <ReplPayloadsProvider>{children}</ReplPayloadsProvider>
          </ReplHistoryModeProvider>
        </ReplInfoProvider>
      </UserStateProvider>
    </ReplStateProvider>
  )
}

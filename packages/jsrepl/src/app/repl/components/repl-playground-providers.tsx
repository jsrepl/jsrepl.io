import React from 'react'
import ReplInfoProvider from '@/components/repl-info-provider'
import ReplModelsProvider from '@/components/repl-models-provider'
import ReplPayloadsProvider from '@/components/repl-payloads-provider'
import ReplRewindModeProvider from '@/components/repl-rewind-mode-provider'
import ReplStateProvider from '@/components/repl-state-provider'
import { SessionContextProvider } from '@/components/session-context'
import UserStateProvider from '@/components/user-state-provider'
import { createClient } from '@/lib/supabase/client'

const supabaseClient = createClient()

export default function ReplPlaygroundProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <ReplStateProvider>
        <UserStateProvider>
          <ReplInfoProvider>
            <ReplRewindModeProvider>
              <ReplModelsProvider>
                <ReplPayloadsProvider>{children}</ReplPayloadsProvider>
              </ReplModelsProvider>
            </ReplRewindModeProvider>
          </ReplInfoProvider>
        </UserStateProvider>
      </ReplStateProvider>
    </SessionContextProvider>
  )
}

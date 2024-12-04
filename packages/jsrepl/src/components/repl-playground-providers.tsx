import React from 'react'
import { MonacoEditorProvider } from '@/components/providers/monaco-editor-provider'
import { ReplFSChangesProvider } from '@/components/providers/repl-fs-changes-provider'
import ReplInfoProvider from '@/components/providers/repl-info-provider'
import ReplModelsProvider from '@/components/providers/repl-models-provider'
import ReplPayloadsProvider from '@/components/providers/repl-payloads-provider'
import ReplRewindModeProvider from '@/components/providers/repl-rewind-mode-provider'
import ReplSaveProvider from '@/components/providers/repl-save-provider'
import ReplStateProvider from '@/components/providers/repl-state-provider'
import UserStateProvider from '@/components/providers/user-state-provider'
import WritableModelsProvider from '@/components/providers/writable-models-provider'

export default function ReplPlaygroundProviders({ children }: { children: React.ReactNode }) {
  return (
    <MonacoEditorProvider>
      <ReplStateProvider>
        <UserStateProvider>
          <ReplInfoProvider>
            <ReplRewindModeProvider>
              <ReplModelsProvider>
                <WritableModelsProvider>
                  <ReplSaveProvider>
                    <ReplFSChangesProvider>
                      <ReplPayloadsProvider>{children}</ReplPayloadsProvider>
                    </ReplFSChangesProvider>
                  </ReplSaveProvider>
                </WritableModelsProvider>
              </ReplModelsProvider>
            </ReplRewindModeProvider>
          </ReplInfoProvider>
        </UserStateProvider>
      </ReplStateProvider>
    </MonacoEditorProvider>
  )
}

import React from 'react'
import { CodeHighlighterProvider } from '@/components/providers/code-highlighter-provider'
import { MonacoEditorProvider } from '@/components/providers/monaco-editor-provider'
import { ReplFSChangesProvider } from '@/components/providers/repl-fs-changes-provider'
import ReplInfoProvider from '@/components/providers/repl-info-provider'
import ReplLoadedStateProvider from '@/components/providers/repl-loaded-state-provider'
import ReplModelsProvider from '@/components/providers/repl-models-provider'
import ReplPayloadsProvider from '@/components/providers/repl-payloads-provider'
import ReplRewindModeProvider from '@/components/providers/repl-rewind-mode-provider'
import ReplSaveProvider from '@/components/providers/repl-save-provider'
import ReplSavedStateProvider from '@/components/providers/repl-saved-state-provider'
import ReplSettingsDialogProvider from '@/components/providers/repl-settings-dialog-provider'
import ReplStateProvider from '@/components/providers/repl-state-provider'
import UserStateProvider from '@/components/providers/user-state-provider'
import WritableModelsProvider from '@/components/providers/writable-models-provider'

export default function ReplPlaygroundProviders({ children }: { children: React.ReactNode }) {
  return (
    <MonacoEditorProvider>
      <CodeHighlighterProvider>
        <ReplLoadedStateProvider>
          <ReplSavedStateProvider>
            <ReplStateProvider>
              <UserStateProvider>
                <ReplInfoProvider>
                  <ReplRewindModeProvider>
                    <ReplModelsProvider>
                      <WritableModelsProvider>
                        <ReplSaveProvider>
                          <ReplFSChangesProvider>
                            <ReplPayloadsProvider>
                              <ReplSettingsDialogProvider>{children}</ReplSettingsDialogProvider>
                            </ReplPayloadsProvider>
                          </ReplFSChangesProvider>
                        </ReplSaveProvider>
                      </WritableModelsProvider>
                    </ReplModelsProvider>
                  </ReplRewindModeProvider>
                </ReplInfoProvider>
              </UserStateProvider>
            </ReplStateProvider>
          </ReplSavedStateProvider>
        </ReplLoadedStateProvider>
      </CodeHighlighterProvider>
    </MonacoEditorProvider>
  )
}

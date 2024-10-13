'use client'

import React, { useCallback, useState } from 'react'
import { useEarlyAccessToast } from '@/hooks/useEarlyAccessToast'
import { useNewVersionToast } from '@/hooks/useNewVersionToast'
import { useReplPreviewShown } from '@/hooks/useReplPreviewShown'
import { useReplPreviewSize } from '@/hooks/useReplPreviewSize'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { useUserStoredState } from '@/hooks/useUserStoredState'
import type { CodeEditorModel } from '@/lib/code-editor-models/code-editor-model'
import { cn } from '@/lib/utils'
import { type ReplInfo } from '@/types'
import CodeEditor from './code-editor'
import { ErrorsNotification } from './errors-notification'
import Header from './header'
import Preview from './preview'

export default function ReplPlayground() {
  const [replInfo, setReplInfo] = useState<ReplInfo | null>(null)
  const [replState, setReplState, saveReplState] = useReplStoredState()
  const [userState, setUserState] = useUserStoredState()
  useEarlyAccessToast()
  useNewVersionToast({ userState, setUserState })

  const previewPos = userState.previewPos
  const [previewSize, setPreviewSize] = useReplPreviewSize({ userState })
  const [previewShown, togglePreview] = useReplPreviewShown({
    replState,
    setReplState,
  })

  const onModelChange = useCallback(
    (editorModel: InstanceType<typeof CodeEditorModel>) => {
      const path = editorModel.monacoModel.uri.path
      const modelDef = replState.models.get(path)
      if (modelDef) {
        modelDef.content = editorModel.getValue()
      }

      saveReplState()
    },
    [replState.models, saveReplState]
  )

  const onRepl = useCallback((replInfo: ReplInfo) => {
    setReplInfo(replInfo)
  }, [])

  return (
    <>
      <Header
        replState={replState}
        setReplState={setReplState}
        userState={userState}
        setUserState={setUserState}
        previewShown={previewShown}
        togglePreview={togglePreview}
        replInfo={replInfo}
      />

      <main className="bg-background relative min-h-0 flex-1">
        <div
          className={cn(
            'grid h-full grid-rows-1',
            previewPos === 'aside-right' && previewShown && 'grid-cols-[1fr,auto]'
          )}
        >
          <CodeEditor
            className="min-w-0"
            modelDefinitions={replState.models}
            activeModel={replState.activeModel}
            onModelChange={onModelChange}
            onRepl={onRepl}
          />

          <Preview
            pos={previewPos}
            size={previewSize}
            setSize={setPreviewSize}
            shown={previewShown}
            toggle={togglePreview}
            userState={userState}
            setUserState={setUserState}
          />
        </div>

        <ErrorsNotification replInfo={replInfo} />
      </main>
    </>
  )
}

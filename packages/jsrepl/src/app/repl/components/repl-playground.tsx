'use client'

import React, { useCallback } from 'react'
import { useEarlyAccessToast } from '@/hooks/useEarlyAccessToast'
import { useNewVersionToast } from '@/hooks/useNewVersionToast'
import { useReplPreviewShown } from '@/hooks/useReplPreviewShown'
import { useReplPreviewSize } from '@/hooks/useReplPreviewSize'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { useUserStoredState } from '@/hooks/useUserStoredState'
import type { CodeEditorModel } from '@/lib/code-editor-models/code-editor-model'
import { cn } from '@/lib/utils'
import CodeEditor from './code-editor'
import Header from './header'
import Preview from './preview'

export default function ReplPlayground() {
  const [replState, setReplState, saveReplState] = useReplStoredState()
  const [userState, setUserState] = useUserStoredState()
  useEarlyAccessToast()
  useNewVersionToast({ userState, setUserState })

  const previewPos = userState.previewPos
  const [previewSize, setPreviewSize] = useReplPreviewSize({ userState })
  const [previewShown, togglePreview, previewShownProps] = useReplPreviewShown({
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

  return (
    <>
      <Header
        replState={replState}
        setReplState={setReplState}
        userState={userState}
        setUserState={setUserState}
        previewShown={previewShown}
        togglePreview={togglePreview}
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
            onRepl={previewShownProps.onRepl}
            onReplBodyMutation={previewShownProps.onReplBodyMutation}
          />

          <Preview
            pos={previewPos}
            size={previewSize}
            setSize={setPreviewSize}
            shown={previewShown}
            mightBeHidden={previewShownProps.mightBeHidden}
            toggle={togglePreview}
          />
        </div>
      </main>
    </>
  )
}

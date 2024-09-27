'use client'

import React from 'react'
import { useReplPreviewShown } from '@/hooks/useReplPreviewShown'
import { useReplPreviewSize } from '@/hooks/useReplPreviewSize'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { useUserStoredState } from '@/hooks/useUserStoredState'
import { CodeEditorModel } from '@/lib/code-editor-model'
import { cn } from '@/lib/utils'
import CodeEditor from './code-editor'
import Header from './header'
import Preview from './preview'

export default function ReplPlayground() {
  const [replState, setReplState, saveReplState] = useReplStoredState()
  const [userState, setUserState] = useUserStoredState()

  const previewPos = userState.previewPos
  const [previewSize, setPreviewSize] = useReplPreviewSize({ userState })
  const [previewShown, togglePreview, previewShownProps] = useReplPreviewShown({
    replState,
    setReplState,
  })

  function onModelChange(editorModel: InstanceType<typeof CodeEditorModel>) {
    const uri = editorModel.monacoModel.uri.toString()
    const modelDef = replState.models.get(uri)
    if (modelDef) {
      modelDef.content = editorModel.getValue()
    } else {
      replState.models.set(uri, {
        uri,
        content: editorModel.getValue(),
      })
    }

    saveReplState()
  }

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

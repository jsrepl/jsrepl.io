'use client'

import React from 'react'
import { useReplPreviewShown } from '@/hooks/useReplPreviewShown'
import { useReplPreviewSize } from '@/hooks/useReplPreviewSize'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { useUserStoredState } from '@/hooks/useUserStoredState'
import { cn } from '@/lib/utils'
import CodeEditor from './code-editor'
import Header from './header'
import Preview from './preview'

export default function ReplPlayground() {
  const [replState, setReplState] = useReplStoredState()
  const [userState, setUserState] = useUserStoredState()

  const previewPos = userState.previewPos
  const [previewSize, setPreviewSize] = useReplPreviewSize({ userState })
  const [previewShown, togglePreview, previewShownProps] = useReplPreviewShown({
    replState,
    setReplState,
  })

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
          <CodeEditor className="min-w-0" />
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

'use client'

import React from 'react'
import { useEarlyAccessToast } from '@/hooks/useEarlyAccessToast'
import { useNewVersionToast } from '@/hooks/useNewVersionToast'
import ActivityBar from './activity-bar'
import CodeEditorContainer from './code-editor-container'
import GridLayout from './grid-layout'
import LeftSidebar from './left-sidebar'
import Preview from './preview'

export default function ReplPlaygroundMain() {
  useEarlyAccessToast()
  useNewVersionToast()

  return (
    <>
      <main className="bg-background relative min-h-0 flex-1">
        <GridLayout>
          <ActivityBar />
          <LeftSidebar />
          <CodeEditorContainer />
          <Preview />
        </GridLayout>
      </main>
    </>
  )
}

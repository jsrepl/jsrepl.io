'use client'

import ReplPlaygroundProviders from '@/components/repl-playground-providers'
import { Toaster } from '@/components/ui/sonner'
import ActivityBar from './activity-bar'
import CodeEditorContainer from './code-editor-container'
import GridLayout from './grid-layout'
import LeftSidebar from './left-sidebar'
import Preview from './preview'
import Toasts from './toasts'

export default function ReplPlaygroundBrowser() {
  return (
    <ReplPlaygroundProviders>
      <main className="bg-background relative min-h-0 flex-1 select-none">
        <GridLayout>
          <ActivityBar />
          <LeftSidebar />
          <CodeEditorContainer />
          <Preview />
        </GridLayout>
      </main>
      <Toaster />
      <Toasts />
    </ReplPlaygroundProviders>
  )
}

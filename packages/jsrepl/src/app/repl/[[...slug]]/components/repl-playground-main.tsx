import { useReplViewEvent } from '@/hooks/useReplViewEvent'
import ActivityBar from './activity-bar'
import CodeEditorContainer from './code-editor-container'
import GridLayout from './grid-layout'
import LeftSidebar from './left-sidebar'
import Preview from './preview'

export default function ReplPlaygroundMain() {
  useReplViewEvent()

  return (
    <main className="bg-background relative min-h-0 flex-1 select-none">
      <GridLayout>
        <ActivityBar />
        <LeftSidebar />
        <CodeEditorContainer />
        <Preview />
      </GridLayout>
    </main>
  )
}

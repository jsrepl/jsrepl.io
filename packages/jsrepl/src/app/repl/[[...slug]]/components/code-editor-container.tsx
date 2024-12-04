import { cn } from '@/lib/utils'
import CodeEditor from './code-editor'
import CodeEditorHeader from './code-editor-header'
import { ErrorsNotification } from './errors-notification'
import RewindModePanel from './rewind-mode-panel'

export default function CodeEditorContainer({ className }: { className?: string }) {
  return (
    <>
      <div className={cn(className, 'relative flex min-w-24 flex-col [grid-area:editor]')}>
        <CodeEditorHeader />
        <RewindModePanel />
        <CodeEditor />
        <ErrorsNotification />
      </div>
    </>
  )
}

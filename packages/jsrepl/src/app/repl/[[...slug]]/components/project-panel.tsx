import { LucideGitFork, LucideLoader, LucideSave } from 'lucide-react'
import { PanelSections } from '@/components/panel-section'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useReplSave } from '@/hooks/useReplSave'
import { useUserStoredState } from '@/hooks/useUserStoredState'
import { isMac } from '@/lib/user-agent'
import FilesPanelSection from './files-panel-section'
import { InfoPanelSection } from './info-panel-section'

export function ProjectPanel() {
  const [userState, setUserState] = useUserStoredState()
  const [, saveState, { isSaving, isForking, allowSave, forkState, allowFork }] = useReplSave()

  return (
    <>
      <div className="h-repl-header text-muted-foreground bg-secondary flex items-center gap-2 pl-4 pr-3 text-xs font-semibold leading-6">
        <span className="flex-1">PROJECT</span>
      </div>

      <div className="flex items-center gap-2 pb-3 pl-4 pt-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="xs"
              variant="secondary"
              className="text-accent-foreground gap-1"
              disabled={!allowSave}
              onClick={() => saveState()}
            >
              {isSaving ? (
                <LucideLoader className="animate-spin" size={15} />
              ) : (
                <LucideSave size={15} className="opacity-80" strokeWidth={1.5} />
              )}
              Save
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save your changes ({isMac ? '⌘+S' : 'Ctrl+S'})</TooltipContent>
        </Tooltip>

        <Button
          size="xs"
          variant="secondary"
          className="text-accent-foreground gap-1"
          disabled={!allowFork}
          onClick={() => forkState()}
        >
          {isForking ? (
            <LucideLoader className="animate-spin" size={15} />
          ) : (
            <LucideGitFork size={15} className="opacity-80" strokeWidth={1.5} />
          )}
          Fork
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <PanelSections
          value={userState.projectPanelExpandedSections}
          onValueChange={(value) =>
            setUserState((prev) => ({ ...prev, projectPanelExpandedSections: value }))
          }
        >
          <InfoPanelSection id="info" />
          <FilesPanelSection id="files" />
        </PanelSections>
      </div>
    </>
  )
}

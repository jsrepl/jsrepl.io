import { PanelSections } from '@/components/panel-section'
import { useUserStoredState } from '@/hooks/useUserStoredState'
import FilesPanelSection from './files-panel-section'
import { InfoPanelSection } from './info-panel-section'

export function ProjectPanel() {
  const [userState, setUserState] = useUserStoredState()

  return (
    <>
      <div className="h-repl-header text-muted-foreground bg-secondary flex items-center gap-2 pl-4 pr-1 text-xs font-semibold leading-6">
        <span className="flex-1">PROJECT</span>
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

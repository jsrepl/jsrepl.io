import { LucideFolderPlus } from 'lucide-react'
import { PanelSectionHeaderAction } from '@/components/panel-section'
import { TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Tooltip } from '@/components/ui/tooltip'
import { useFilesPanel } from './useFilesPanel'

export function NewFolderHeaderAction() {
  const { isReadOnly, createFolder } = useFilesPanel()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <PanelSectionHeaderAction disabled={isReadOnly} onClick={() => createFolder('')}>
          <LucideFolderPlus size={14} />
        </PanelSectionHeaderAction>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={4}>
        New Folder…
      </TooltipContent>
    </Tooltip>
  )
}

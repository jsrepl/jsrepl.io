import { LucideCopyMinus } from 'lucide-react'
import { PanelSectionHeaderAction } from '@/components/panel-section'
import { TooltipContent } from '@/components/ui/tooltip'
import { TooltipTrigger } from '@/components/ui/tooltip'
import { Tooltip } from '@/components/ui/tooltip'
import { useFilesPanel } from './useFilesPanel'

export function CollapseFoldersHeaderAction() {
  const { setExpandedItemIds } = useFilesPanel()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <PanelSectionHeaderAction
          onClick={() => {
            setExpandedItemIds([])
          }}
        >
          <LucideCopyMinus size={14} />
        </PanelSectionHeaderAction>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={4}>
        Collapse Folders
      </TooltipContent>
    </Tooltip>
  )
}

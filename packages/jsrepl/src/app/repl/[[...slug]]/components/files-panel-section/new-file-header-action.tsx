import { LucideFilePlus } from 'lucide-react'
import { PanelSectionHeaderAction } from '@/components/panel-section'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { NewFileMenuItems } from './new-file-menu-items'
import { useFilesPanel } from './useFilesPanel'

export function NewFileHeaderAction() {
  const { isReadOnly, treeViewRef } = useFilesPanel()

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <PanelSectionHeaderAction disabled={isReadOnly}>
              <LucideFilePlus size={14} />
            </PanelSectionHeaderAction>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          New File…
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        onCloseAutoFocus={(e) => {
          const input = treeViewRef.current?.querySelector(
            'input[data-editing]'
          ) as HTMLInputElement | null
          if (input) {
            input.focus()
            e.preventDefault()
          }
        }}
      >
        <NewFileMenuItems dirPath="" />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

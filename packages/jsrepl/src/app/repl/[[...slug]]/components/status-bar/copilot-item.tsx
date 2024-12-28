import CopilotIcon from '@/components/icons/copilot'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import useMonacopilotOptions from '@/hooks/useMonacopilotOptions'
import useReplSettingsDialog from '@/hooks/useReplSettingsDialog'
import StatusBarButton from './status-bar-button'

export default function CopilotItem() {
  const { isEnabled } = useMonacopilotOptions()
  const replSettingsDialog = useReplSettingsDialog()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <StatusBarButton aria-label="AI Autocomplete">
          <CopilotIcon width={14} height={14} className={!isEnabled ? 'opacity-50' : undefined} />
        </StatusBarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="text-xsx space-y-2 font-normal">
          {isEnabled ? (
            <>
              <p>AI Autocomplete is active.</p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => replSettingsDialog.show()}
              >
                Configure
              </Button>
            </>
          ) : (
            <>
              <p>AI Autocomplete is not active.</p>
              <p>Set your API key and provider to enable AI Autocomplete.</p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => replSettingsDialog.show()}
              >
                Configure
              </Button>
            </>
          )}
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

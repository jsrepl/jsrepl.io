import { LucideCheckCheck, LucideCheckCircle2, LucideCircleX, LucideX } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useReplInfo } from '@/hooks/useReplInfo'
import { cn } from '@/lib/utils'
import StatusBarButton from './status-bar-button'

export default function EsbuildStatusItem() {
  const [replInfo] = useReplInfo()
  const isError = replInfo && !replInfo.ok

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <StatusBarButton
          className={cn(
            'gap-1',
            isError && 'bg-destructive text-destructive-foreground hover:bg-destructive/70'
          )}
        >
          {isError ? <LucideX size={13} /> : <LucideCheckCheck size={13} />}
          esbuild
        </StatusBarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="text-xsx font-normal">
          {!replInfo && 'There is no build yet'}
          {replInfo && replInfo.ok && (
            <>
              <LucideCheckCircle2
                className="mr-1 mt-px inline-block align-top text-green-500"
                size={16}
              />
              The latest build finished successfully: {replInfo.errors.length}{' '}
              {replInfo.errors.length === 1 ? 'error' : 'errors'}, {replInfo.warnings.length}{' '}
              {replInfo.warnings.length === 1 ? 'warning' : 'warnings'}
            </>
          )}
          {replInfo && !replInfo.ok && (
            <>
              <p>
                <LucideCircleX
                  className="mr-1 mt-px inline-block align-top text-red-500"
                  size={16}
                />
                The latest build failed with {replInfo.errors.length}{' '}
                {replInfo.errors.length === 1 ? 'error' : 'errors'} and {replInfo.warnings.length}{' '}
                {replInfo.warnings.length === 1 ? 'warning' : 'warnings'}
              </p>
              {replInfo.masterErrorMessage && (
                <pre className="text-muted-foreground mt-2 max-w-prose overflow-auto text-xs">
                  {replInfo.masterErrorMessage}
                </pre>
              )}
            </>
          )}
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

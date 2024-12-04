import { LucideEllipsisVertical, LucideFullscreen, LucideRotateCw, LucideX } from 'lucide-react'
import Resizable from '@/components/resizable'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useReplPreviewShown } from '@/hooks/useReplPreviewShown'
import { useReplPreviewSize } from '@/hooks/useReplPreviewSize'
import { useUserStoredState } from '@/hooks/useUserStoredState'
import { previewPositionOptions } from '@/lib/user-stored-state'
import { cn } from '@/lib/utils'
import { PreviewPosition } from '@/types'

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy#directives
const iframeAllow = [
  'accelerometer',
  'ambient-light-sensor',
  'attribution-reporting',
  'autoplay',
  'bluetooth',
  'camera',
  'compute-pressure',
  'display-capture',
  'encrypted-media',
  'fullscreen',
  'gamepad',
  'geolocation',
  'gyroscope',
  'hid',
  'identity-credentials-get',
  'idle-detection',
  'local-fonts',
  'magnetometer',
  'microphone',
  'midi',
  'otp-credentials',
  'payment',
  'picture-in-picture',
  'publickey-credentials-create',
  'publickey-credentials-get',
  'screen-wake-lock',
  'serial',
  'speaker-selection',
  'usb',
  'web-share',
  'window-management',
  'xr-spatial-tracking',
].join('; ')

export default function ReplPreview({ className }: { className?: string }) {
  const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL

  const [userState, setUserState] = useUserStoredState()
  const { previewShown, setPreviewShown } = useReplPreviewShown()
  const [size, setSize] = useReplPreviewSize()
  const pos = userState.previewPos

  return (
    <div
      className={cn(
        className,
        pos === 'aside-right' && 'relative min-w-0 [grid-area:right-sidebar]',
        pos === 'float-bottom-right' && 'absolute bottom-1 right-4 z-10',
        pos === 'float-top-right' && 'absolute right-4 top-10 z-10',
        !previewShown && 'pointer-events-none !absolute opacity-0'
      )}
    >
      {/* iframe must not be .sr-only or .hidden, otherwise timers will be throttled */}
      <Resizable
        size={size}
        onSizeUpdate={setSize}
        edges={{ left: true, top: pos === 'float-bottom-right', bottom: pos === 'float-top-right' }}
        className={cn(
          pos === 'aside-right' && 'bg-secondary !h-full max-w-full border-l pl-2',
          (pos === 'float-bottom-right' || pos === 'float-top-right') &&
            'max-h-[calc(100vh-0.25rem-var(--hh))] max-w-[calc(100vw-1rem)] p-4'
        )}
      >
        <div
          className={cn(
            'flex h-full w-full flex-col overflow-hidden',
            (pos === 'float-bottom-right' || pos === 'float-top-right') &&
              'border-border bg-secondary rounded border opacity-90 shadow-md'
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2 pl-1.5 pr-0.5 text-xs leading-6',
              pos === 'aside-right' && 'h-repl-header px-2'
            )}
          >
            <span className={cn('text-muted-foreground', pos === 'aside-right' && 'font-semibold')}>
              PREVIEW
            </span>
            <div className="ml-auto flex items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="none"
                    className="text-secondary-foreground/60 h-6 w-6 p-0.5 ring-inset"
                    onClick={() => restartRepl()}
                  >
                    <LucideRotateCw size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reload preview and restart REPL</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="none"
                    className="text-secondary-foreground/60 h-6 w-6 p-0.5 ring-inset"
                  >
                    <LucideEllipsisVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" alignOffset={-16}>
                  <DropdownMenuItem onClick={enterFullscreen}>
                    <LucideFullscreen size={16} />
                    Enter Fullscreen
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    Preview Position
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={userState.previewPos}
                    onValueChange={(value) =>
                      setUserState((prev) => ({ ...prev, previewPos: value as PreviewPosition }))
                    }
                  >
                    {previewPositionOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="none"
                className="text-secondary-foreground/60 h-6 w-6 p-0.5 ring-inset"
                onClick={() => setPreviewShown(false)}
              >
                <LucideX size={18} />
              </Button>
            </div>
          </div>
          <iframe
            id="preview-iframe"
            src={previewUrl}
            className="backdrop:bg-secondary min-h-0 min-w-0 flex-1"
            allow={iframeAllow}
          />
        </div>
      </Resizable>
    </div>
  )
}

function restartRepl() {
  const previewIframe = document.getElementById('preview-iframe') as HTMLIFrameElement | null
  if (previewIframe) {
    previewIframe.src += ''
  }
}

function enterFullscreen() {
  const previewIframe = document.getElementById('preview-iframe') as HTMLIFrameElement | null
  if (previewIframe) {
    previewIframe.requestFullscreen({ navigationUI: 'hide' })
  }
}

import { useContext } from 'react'
import { LucideEllipsisVertical, LucideRotateCw, LucideX } from 'lucide-react'
import Resizable from '@/components/resizable'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ReplStateContext } from '@/context/repl-state-context'
import { UserStateContext } from '@/context/user-state-context'
import { useReplPreviewSize } from '@/hooks/useReplPreviewSize'
import { cn } from '@/lib/utils'
import { PreviewPosition } from '@/types'

const previewPositionOptions = [
  { value: PreviewPosition.FloatTopRight, label: 'Floating: top right' },
  { value: PreviewPosition.FloatBottomRight, label: 'Floating: bottom right' },
  { value: PreviewPosition.AsideRight, label: 'Dock to right' },
]

export default function ReplPreview({ className }: { className?: string }) {
  const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL

  const { replState, setReplState } = useContext(ReplStateContext)!
  const { userState, setUserState } = useContext(UserStateContext)!
  const [size, setSize] = useReplPreviewSize({ userState })
  const pos = userState.previewPos

  return (
    <div
      className={cn(
        className,
        pos === 'aside-right' && 'relative min-w-0 [grid-area:right-sidebar]',
        pos === 'float-bottom-right' && 'absolute bottom-1 right-4 z-10',
        pos === 'float-top-right' && 'absolute right-4 top-10 z-10',
        !replState.showPreview && 'pointer-events-none !absolute !-left-full !right-auto opacity-0'
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
              'border-border bg-secondary rounded border opacity-90 shadow-lg'
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2 pl-1.5 pr-0.5 text-sm leading-6',
              pos === 'aside-right' && 'h-repl-header px-2'
            )}
          >
            <span className={cn('text-muted-foreground', pos === 'aside-right' && 'font-semibold')}>
              Preview
            </span>
            <div className="ml-auto flex items-center">
              <Button
                variant="ghost"
                size="none"
                className="text-secondary-foreground/60 h-6 w-6 p-0.5 ring-inset"
                title="Reload preview and restart REPL"
                onClick={() => restartRepl()}
              >
                <LucideRotateCw size={14} />
              </Button>

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
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Preview Position</DropdownMenuLabel>
                  <DropdownMenuSeparator />
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
                onClick={() => setReplState((prev) => ({ ...prev, showPreview: false }))}
              >
                <LucideX size={18} />
              </Button>
            </div>
          </div>
          <iframe id="preview-iframe" src={previewUrl} className="min-h-0 min-w-0 flex-1" />
        </div>
      </Resizable>
    </div>
  )
}

function restartRepl() {
  const previewIframe = document.getElementById('preview-iframe') as HTMLIFrameElement
  previewIframe.src += ''
}

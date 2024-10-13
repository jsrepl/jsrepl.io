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
import { cn } from '@/lib/utils'
import { PreviewPosition, UserStoredState } from '@/types'

type Props = {
  pos: PreviewPosition
  size: { width: number; height: number }
  setSize: (size: { width: number; height: number }) => void
  shown: boolean
  toggle: (force?: boolean) => void
  userState: UserStoredState
  setUserState: React.Dispatch<React.SetStateAction<UserStoredState>>
}

const previewPositionOptions = [
  { value: PreviewPosition.FloatTopRight, label: 'Floating: top right' },
  { value: PreviewPosition.FloatBottomRight, label: 'Floating: bottom right' },
  { value: PreviewPosition.AsideRight, label: 'Dock to right' },
]

export default function ReplPreview({
  pos,
  size,
  setSize,
  shown,
  toggle,
  userState,
  setUserState,
}: Props) {
  const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL

  return (
    <div
      className={cn(
        pos === 'aside-right' && 'relative',
        pos === 'float-bottom-right' && 'absolute bottom-1 right-4 z-10',
        pos === 'float-top-right' && 'absolute right-4 top-1 z-10',
        !shown && 'pointer-events-none !absolute !-left-full !right-auto opacity-0'
      )}
    >
      {/* iframe must not be .sr-only or .hidden, otherwise timers will be throttled */}
      <Resizable
        size={size}
        onSizeUpdate={setSize}
        edges={{ left: true, top: pos === 'float-bottom-right', bottom: pos === 'float-top-right' }}
        className={cn(
          pos === 'aside-right' && '!h-full pl-2',
          (pos === 'float-bottom-right' || pos === 'float-top-right') &&
            'max-h-[calc(100vh-0.25rem-var(--hh))] max-w-[calc(100vw-1rem)] p-4'
        )}
      >
        <div
          className={cn(
            'bg-secondary flex h-full w-full flex-col overflow-hidden',
            (pos === 'float-bottom-right' || pos === 'float-top-right') &&
              'border-border rounded border opacity-90 shadow-lg',
            pos === 'aside-right' && 'border-l'
          )}
        >
          <div className="border-border/50 flex items-center gap-2 border-b pl-1.5 pr-0.5 text-sm leading-6">
            <span className="text-muted-foreground">Preview</span>
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
                onClick={() => toggle(false)}
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

import Resizable from '@/components/resizable'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PreviewPosition } from '@/types'

type Props = {
  pos: PreviewPosition
  size: { width: number; height: number }
  setSize: (size: { width: number; height: number }) => void
  shown: boolean
  mightBeHidden: boolean
  toggle: (force?: boolean) => void
}

export default function ReplPreview({ pos, size, setSize, shown, mightBeHidden, toggle }: Props) {
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
        <iframe
          src={previewUrl}
          width="100%"
          height="100%"
          className={cn(
            'bg-secondary',
            (pos === 'float-bottom-right' || pos === 'float-top-right') &&
              'border-border rounded border opacity-90 shadow-lg',
            pos === 'aside-right' && 'border-l'
          )}
        />
      </Resizable>

      {mightBeHidden && (
        <Button
          variant="secondary"
          className="text-secondary-foreground absolute inset-0 z-10 m-auto w-fit opacity-60 hover:opacity-100 focus:opacity-100"
          onClick={() => toggle(false)}
        >
          Close Preview
        </Button>
      )}
    </div>
  )
}

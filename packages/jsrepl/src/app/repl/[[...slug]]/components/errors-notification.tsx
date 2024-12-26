import { useMemo, useState } from 'react'
import { LucideCircleAlert, LucideTriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useReplInfo } from '@/hooks/useReplInfo'
import { isBabelParseEsbuildError } from '@/lib/bundler/utils'

export function ErrorsNotification() {
  const [replInfo] = useReplInfo()
  const [expanded, setExpanded] = useState(true)

  const primaryError = replInfo?.errors[0]

  const errorText = useMemo(() => {
    if (!primaryError) {
      return null
    }

    const isBabelParseError = isBabelParseEsbuildError(primaryError)
    return isBabelParseError ? primaryError.detail.shortMessage : primaryError.text
  }, [primaryError])

  if (!replInfo || replInfo.ok || !primaryError) {
    return null
  }

  return (
    <div className="absolute bottom-6 left-6 mr-6">
      <div className="bg-secondary text-secondary-foreground flex items-stretch overflow-hidden rounded-md border text-sm leading-tight shadow-sm">
        <Button
          variant="secondary"
          size="icon-lg"
          className="h-auto min-h-10 rounded-none border-none shadow-none ring-inset"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {replInfo.errors.length === 0 && replInfo.warnings.length > 0 ? (
            <LucideTriangleAlert size={24} className="text-yellow-500" />
          ) : (
            <LucideCircleAlert size={24} className="text-red-500" />
          )}
        </Button>

        {expanded && (
          <span className="flex max-w-prose flex-1 select-text items-center gap-2 whitespace-normal p-2 pr-3 font-normal">
            {primaryError.location?.file && (
              <span className="text-muted-foreground">
                {primaryError.location.file}:{primaryError.location.line}:
                {primaryError.location.column}
              </span>
            )}
            <span className="line-clamp-3">{errorText}</span>
          </span>
        )}
      </div>
    </div>
  )
}

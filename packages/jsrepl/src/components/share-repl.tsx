import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LucideClipboardCheck, LucideClipboardCopy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SetReplStoredState } from '@/hooks/useReplStoredState'

export default function ShareRepl({ setReplState }: { setReplState: SetReplStoredState }) {
  const searchParams = useSearchParams()

  const inputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const [sharableUrl, setSharableUrl] = useState(location.href)
  let copiedTimeoutId: NodeJS.Timeout | undefined

  useEffect(() => {
    setReplState((prev) => prev, { saveImmediate: true })
    setSharableUrl(location.href)
  }, [setReplState, searchParams])

  async function copyUrl() {
    await navigator.clipboard.writeText(sharableUrl)
    setCopied(true)

    clearTimeout(copiedTimeoutId)
    copiedTimeoutId = setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="my-2 self-center font-medium">
        To share, simply copy the current URL from the address bar:
      </span>

      <input
        ref={inputRef}
        value={sharableUrl}
        readOnly
        className="bg-muted text-muted-foreground focus-visible:ring-ring h-8 w-full flex-1 rounded border px-1 leading-8 outline-none focus-visible:ring-2"
        onFocus={(e) => e.target.select()}
      />

      <Button size="sm" onClick={copyUrl}>
        {copied ? (
          <>
            <LucideClipboardCheck size={18} className="mr-1" />
            Copied!
          </>
        ) : (
          <>
            <LucideClipboardCopy size={18} className="mr-1" />
            Copy URL to clipboard
          </>
        )}
      </Button>
    </div>
  )
}

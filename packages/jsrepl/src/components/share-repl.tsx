import { useContext, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LucideClipboardCheck, LucideClipboardCopy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReplStateContext } from '@/context/repl-state-context'

export default function ShareRepl() {
  const { setReplState } = useContext(ReplStateContext)!
  const searchParams = useSearchParams()

  const inputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const [sharableUrl, setSharableUrl] = useState(location.href)
  const copiedTimeoutId = useRef<NodeJS.Timeout | undefined>()

  useEffect(() => {
    setReplState((prev) => prev, { saveImmediate: true })
    setSharableUrl(location.href)
  }, [setReplState, searchParams])

  async function copyUrl() {
    await navigator.clipboard.writeText(sharableUrl)
    setCopied(true)

    clearTimeout(copiedTimeoutId.current)
    copiedTimeoutId.current = setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="mb-2 font-medium">To share, copy the current URL from the address bar:</span>

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

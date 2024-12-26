import { useEffect, useState } from 'react'
import { LucideCheckCheck, LucideCircleX, LucideSquareSlash, LucideX } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMonacoEditor } from '@/hooks/useMonacoEditor'
import {
  PrettierEvent,
  PrettierEventInit,
  SUPPORTED_FORMATTING_LANGUAGES,
} from '@/lib/monaco-prettier-formatting-provider'
import { cn } from '@/lib/utils'
import StatusBarButton from './status-bar-button'

export default function PrettierStatusItem() {
  const { editor } = useMonacoEditor()

  const [status, setStatus] = useState<PrettierEventInit | null>(null)

  const [languageId, setLanguageId] = useState<string | null>(() => {
    const textModel = editor?.getModel()
    return textModel ? textModel.getLanguageId() : null
  })

  const isLanguageSupported = languageId
    ? SUPPORTED_FORMATTING_LANGUAGES.includes(languageId)
    : false

  useEffect(() => {
    const handler = (e: PrettierEvent) => {
      setStatus(e.detail)
    }

    window.addEventListener('jsrepl-prettier', handler)

    return () => {
      window.removeEventListener('jsrepl-prettier', handler)
    }
  }, [])

  useEffect(() => {
    if (!editor) {
      return
    }

    const textModel = editor.getModel()
    setLanguageId(textModel ? textModel.getLanguageId() : null)

    const disposer = editor.onDidChangeModel(() => {
      const textModel = editor.getModel()
      setLanguageId(textModel ? textModel.getLanguageId() : null)
    })

    return () => {
      disposer.dispose()
    }
  }, [editor])

  if (!languageId) {
    return null
  }

  let icon: React.ReactNode

  if (!isLanguageSupported) {
    icon = <LucideSquareSlash size={13} />
  } else if (status === null || status.type === 'success') {
    icon = <LucideCheckCheck size={13} />
  } else if (status.type === 'error') {
    icon = <LucideX size={13} />
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <StatusBarButton
          className={cn(
            'gap-1',
            status?.type === 'error' &&
              'bg-destructive text-destructive-foreground hover:bg-destructive/70',
            !isLanguageSupported && 'opacity-50'
          )}
        >
          {icon}
          Prettier
        </StatusBarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel className="text-xsx font-normal">
          <DropdownContent
            status={status}
            isLanguageSupported={isLanguageSupported}
            languageId={languageId}
          />
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DropdownContent({
  status,
  isLanguageSupported,
  languageId,
}: {
  status: PrettierEventInit | null
  isLanguageSupported: boolean
  languageId: string
}) {
  if (!isLanguageSupported) {
    return `Prettier is not active for ${languageId}`
  }

  if (status === null || status.type === 'success') {
    return 'Prettier is active'
  }

  if (status.type === 'error') {
    return (
      <>
        <p>
          <LucideCircleX className="mr-1 mt-px inline-block align-top text-red-500" size={16} />
          Prettier failed to format:
        </p>
        <pre className="text-muted-foreground mt-2 max-w-prose overflow-auto text-xs">
          {status.error instanceof Error ? status.error.message : String(status.error)}
        </pre>
      </>
    )
  }
}

import { useEffect, useMemo, useState } from 'react'
import type { Message } from 'esbuild-wasm'
import { LucideCheckCircle2, LucideCircleX, LucideTriangleAlert } from 'lucide-react'
import * as monaco from 'monaco-editor'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useReplInfo } from '@/hooks/useReplInfo'
import { isBabelParseEsbuildError } from '@/lib/bundler/utils'
import { cn } from '@/lib/utils'
import { ReplInfo } from '@/types'
import StatusBarButton from './status-bar-button'

export default function ProblemsItem() {
  const [replInfo] = useReplInfo()
  const [markers, setMarkers] = useState<monaco.editor.IMarker[]>([])

  useEffect(() => {
    const disposable = monaco.editor.onDidChangeMarkers(() => {
      const markers = monaco.editor.getModelMarkers({})
      setMarkers(markers)
    })

    return () => {
      disposable.dispose()
    }
  }, [])

  const errorCount = useMemo(() => {
    const buildErrors = replInfo?.errors.length ?? 0
    const markersErrors = markers.filter(
      (marker) => marker.severity === monaco.MarkerSeverity.Error
    ).length
    return buildErrors + markersErrors
  }, [replInfo?.errors, markers])

  const warningCount = useMemo(() => {
    const buildWarnings = replInfo?.warnings.length ?? 0
    const markersWarnings = markers.filter(
      (marker) => marker.severity === monaco.MarkerSeverity.Warning
    ).length
    return buildWarnings + markersWarnings
  }, [replInfo?.warnings, markers])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <StatusBarButton
          className={cn(
            'gap-1',
            warningCount > 0 && 'bg-warning text-warning-foreground hover:bg-warning/70',
            errorCount > 0 && 'bg-destructive text-destructive-foreground hover:bg-destructive/70'
          )}
        >
          <LucideCircleX size={13} />
          <span>{errorCount}</span>
          <LucideTriangleAlert size={13} />
          <span>{warningCount}</span>
        </StatusBarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="text-xsx max-w-[calc(var(--radix-popper-available-width)-2rem)] font-normal">
          <ProblemsList markers={markers} replInfo={replInfo} />
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ProblemsList({
  markers,
  replInfo,
}: {
  markers: monaco.editor.IMarker[]
  replInfo: ReplInfo | null
}) {
  return (
    <ul>
      {replInfo?.errors.map((error) => (
        <EsbuildMessage key={error.id} message={error} severity="error" />
      ))}
      {replInfo?.warnings.map((warning) => (
        <EsbuildMessage key={warning.id} message={warning} severity="warning" />
      ))}
      {markers.map((marker) => (
        <Marker
          key={`${marker.resource.path}-${marker.startLineNumber}-${marker.startColumn}-${marker.endLineNumber}-${marker.endColumn}`}
          marker={marker}
        />
      ))}
      {!replInfo?.errors.length && !replInfo?.warnings.length && !markers.length && (
        <li>
          <LucideCheckCircle2
            className="mr-1 mt-px inline-block align-top text-green-500"
            size={16}
          />
          No problems have been detected
        </li>
      )}
    </ul>
  )
}

function EsbuildMessage({
  message,
  severity,
}: {
  message: Message
  severity: 'error' | 'warning'
}) {
  const isBabelParseError = isBabelParseEsbuildError(message)
  const detailCode = isBabelParseError ? message.detail.name ?? message.detail.code : null
  const text = isBabelParseError ? message.detail.shortMessage : message.text

  return (
    <li className="flex items-start gap-2 py-1">
      {severity === 'error' && (
        <LucideCircleX className="shrink-0 translate-y-px text-red-500" size={16} />
      )}
      {severity === 'warning' && (
        <LucideTriangleAlert className="shrink-0 translate-y-px text-yellow-500" size={16} />
      )}
      {message.location && (
        <span className="text-muted-foreground">
          {message.location.file}:{message.location.line}:{message.location.column}
        </span>
      )}
      <span>
        {text}
        <span className="text-muted-foreground ml-2">
          {message.pluginName || 'esbuild'}
          {typeof detailCode === 'string' && <>({detailCode})</>}
        </span>
      </span>
    </li>
  )
}

function Marker({ marker }: { marker: monaco.editor.IMarker }) {
  const owner = marker.owner === 'typescript' ? 'ts' : marker.owner

  return (
    <li className="flex items-start gap-2 py-1">
      {marker.severity === monaco.MarkerSeverity.Error && (
        <LucideCircleX className="shrink-0 translate-y-px text-red-500" size={16} />
      )}
      {marker.severity === monaco.MarkerSeverity.Warning && (
        <LucideTriangleAlert className="shrink-0 translate-y-px text-yellow-500" size={16} />
      )}
      <span className="text-muted-foreground">
        {marker.resource.path.replace(/^\//, '')}:{marker.startLineNumber}:{marker.startColumn}
      </span>
      <span>
        {marker.message}
        <span className="text-muted-foreground ml-2">
          {owner}
          {typeof marker.code === 'object' && marker.code !== null && <>({marker.code.value})</>}
          {typeof marker.code === 'string' && <>({marker.code})</>}
        </span>
      </span>
    </li>
  )
}

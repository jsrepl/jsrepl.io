'use client'

import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { LucideEllipsisVertical, LucideLock, LucideX } from 'lucide-react'
import IconPrettier from '~icons/simple-icons/prettier'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useMonacoEditor } from '@/hooks/useMonacoEditor'
import { useReplFSChanges } from '@/hooks/useReplFSChanges'
import { useReplInfo } from '@/hooks/useReplInfo'
import { useReplModels } from '@/hooks/useReplModels'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { isMac } from '@/lib/user-agent'
import { cn } from '@/lib/utils'
import { FileIcon } from './file-icon'

type ModelSwitcherOption = {
  value: string
  label: string
  labelDescription: string
  errorCount: number
  warningCount: number
}

export default function CodeEditorHeader() {
  const [replState, setReplState] = useReplStoredState()
  const [replInfo] = useReplInfo()
  const { editorRef } = useMonacoEditor()
  const { readOnlyModels } = useReplModels()
  const { changes: replFSChanges } = useReplFSChanges()

  const headerRef = useRef<HTMLDivElement>(null)

  const isReadOnly = useMemo(() => {
    return readOnlyModels.has(replState.activeModel)
  }, [replState.activeModel, readOnlyModels])

  useEffect(() => {
    requestAnimationFrame(() => {
      const activeModelElement = headerRef.current?.querySelector('[data-active="true"]')
      activeModelElement?.scrollIntoView({ inline: 'nearest' })
    })
  }, [replState.activeModel])

  const modelSwitcherOptions: ModelSwitcherOption[] = useMemo(() => {
    const map: Record<string, ModelSwitcherOption> = {}

    return replState.openedModels.map((path) => {
      const name = path.slice(path.lastIndexOf('/') + 1)

      const option = {
        value: path,
        label: name,
        labelDescription: '',
        errorCount:
          replInfo?.errors.filter((e) => e.location?.file && '/' + e.location.file === path)
            .length ?? 0,
        warningCount:
          replInfo?.warnings.filter((e) => e.location?.file && '/' + e.location.file === path)
            .length ?? 0,
      }

      // Handle duplicate tab titles for files with the same name but in different directories.
      if (map[name]) {
        option.labelDescription = option.value.slice(0, option.value.lastIndexOf('/')) || '/'
        map[name].labelDescription =
          map[name].value.slice(0, map[name].value.lastIndexOf('/')) || '/'
      } else {
        map[name] = option
      }

      return option
    })
  }, [replState.openedModels, replInfo])

  const closeModelTab = useCallback(
    (path: string) => {
      setReplState((prev) => {
        const index = prev.openedModels.indexOf(path)
        if (index === -1) {
          return prev
        }

        const openedModels = prev.openedModels.filter((p) => p !== path)
        const activeModel = openedModels[index] ?? openedModels[openedModels.length - 1] ?? ''

        return {
          ...prev,
          openedModels,
          activeModel,
        }
      })
    },
    [setReplState]
  )

  const closeAllModels = useCallback(() => {
    setReplState((prev) => ({ ...prev, openedModels: [], activeModel: '' }))
  }, [setReplState])

  const closeOtherModels = useCallback(() => {
    setReplState((prev) => ({
      ...prev,
      openedModels: [prev.activeModel],
    }))
  }, [setReplState])

  const onTabClick = useCallback(
    (path: string) => {
      setReplState((prev) => ({ ...prev, activeModel: path }))
      requestAnimationFrame(() => {
        editorRef.current?.focus()
      })
    },
    [setReplState, editorRef]
  )

  const onFormatClick = useCallback(async () => {
    await editorRef.current?.getAction('editor.action.formatDocument')?.run()
    editorRef.current?.focus()
  }, [editorRef])

  return (
    <header ref={headerRef} className="h-repl-header bg-secondary flex items-stretch">
      <ScrollArea scrollHideDelay={0} className="flex-1">
        <div className="flex h-full flex-1 border-b">
          {modelSwitcherOptions.map((modelOption) => (
            <span key={modelOption.value} className="group relative inline-flex items-center">
              <Button
                variant="none"
                size="none"
                data-active={replState.activeModel === modelOption.value}
                className="before:border-border data-[active=true]:before:border-b-editor-background data-[active=true]:before:bg-editor-background group peer py-2 pl-4 pr-8 before:absolute before:inset-0 before:-bottom-px data-[active=true]:cursor-default data-[active=true]:before:border data-[active=true]:before:border-t-0 group-first:data-[active=true]:before:border-l-0"
                onClick={() => onTabClick(modelOption.value)}
              >
                <span
                  className={cn(
                    'relative flex items-center gap-1.5 font-normal',
                    modelOption.warningCount > 0 && 'text-yellow-500',
                    modelOption.errorCount > 0 && 'text-red-500'
                  )}
                >
                  <FileIcon name={modelOption.label} />
                  <span className="opacity-60 group-hover:opacity-100 group-data-[active=true]:opacity-80">
                    {modelOption.label}
                  </span>
                  {modelOption.labelDescription && (
                    <span className="self-end text-xs opacity-40 group-hover:opacity-100 group-data-[active=true]:opacity-80">
                      {modelOption.labelDescription}
                    </span>
                  )}
                  {readOnlyModels.has(modelOption.value) && (
                    <span className="opacity-40 group-hover:opacity-80 group-data-[active=true]:opacity-80">
                      <LucideLock size={14} />
                    </span>
                  )}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="none"
                className="text-muted-foreground hover:text-accent-foreground hover:bg-accent absolute right-2 mt-px self-center p-0.5 opacity-0 group-hover:opacity-100 has-[.changed-marker]:opacity-100 group-has-[:focus-visible]:opacity-100 peer-data-[active=true]:opacity-100 [&_.changed-marker]:hover:opacity-0 [&_.changed-marker]:focus-visible:opacity-0 [&_.close-icon]:has-[.changed-marker]:opacity-0 [&_.close-icon]:has-[.changed-marker]:hover:opacity-100 [&_.close-icon]:has-[.changed-marker]:focus-visible:opacity-100"
                data-close-btn
                onClick={() => closeModelTab(modelOption.value)}
              >
                <div className="grid place-items-center *:col-span-full *:row-span-full">
                  <LucideX size={16} className="close-icon" />
                  {replFSChanges.has(modelOption.value) && (
                    <svg
                      className="changed-marker"
                      width={16}
                      height={16}
                      fill="currentColor"
                      viewBox="0 0 10 10"
                    >
                      <circle cx="5" cy="5" r="2.5" />
                    </svg>
                  )}
                </div>
              </Button>
            </span>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-1 p-0 [&>:first-child]:rounded-none" />
      </ScrollArea>

      <div className="flex items-center border-b px-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground"
              disabled={isReadOnly}
              onClick={onFormatClick}
            >
              <IconPrettier width={15} height={15} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8} align="end">
            Format code with Prettier ({isMac ? '⌘+S' : 'Ctrl+S'})
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs" className="text-muted-foreground">
                  <LucideEllipsisVertical size={18} />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} align="end">
              More Actions...
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent>
            <DropdownMenuItem onClick={closeAllModels}>Close All</DropdownMenuItem>
            <DropdownMenuItem onClick={closeOtherModels}>Close Others</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

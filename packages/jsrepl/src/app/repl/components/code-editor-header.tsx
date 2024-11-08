'use client'

import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { LucideEllipsisVertical, LucideX } from 'lucide-react'
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
import { MonacoEditorContext } from '@/context/monaco-editor-context'
import { ReplInfoContext } from '@/context/repl-info-context'
import { ReplStateContext } from '@/context/repl-state-context'
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
  const { replState, setReplState } = useContext(ReplStateContext)!
  const { replInfo } = useContext(ReplInfoContext)!
  const { editorRef } = useContext(MonacoEditorContext)!
  const headerRef = useRef<HTMLDivElement>(null)

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
                </span>
              </Button>

              <Button
                variant="ghost"
                size="none"
                className="text-muted-foreground hover:text-accent-foreground hover:bg-accent invisible absolute right-2 mt-px self-center p-0.5 group-hover:visible aria-expanded:visible peer-data-[active=true]:visible"
                onClick={() => closeModelTab(modelOption.value)}
              >
                <LucideX size={16} />
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
              onClick={() => {
                editorRef.current?.getAction('editor.action.formatDocument')?.run()
              }}
            >
              <IconPrettier width={15} height={15} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8} align="end">
            Format code with Prettier (⌘+S)
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

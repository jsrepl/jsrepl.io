'use client'

import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { LucideX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ReplInfoContext } from '@/context/repl-info-context'
import { ReplStateContext } from '@/context/repl-state-context'
import { cn } from '@/lib/utils'

export default function CodeEditorHeader() {
  const { replState, setReplState } = useContext(ReplStateContext)!
  const { replInfo } = useContext(ReplInfoContext)!

  useEffect(() => {
    const activeModelElement = document.querySelector(`[data-active="true"]`)
    if (activeModelElement) {
      activeModelElement.scrollIntoView({
        inline: 'nearest',
      })
    }
  }, [replState.activeModel])

  const modelSwitcherOptions = useMemo(() => {
    return replState.openedModels.map((path) => {
      // TODO: handle duplicate file names from different directories
      const name = path.slice(path.lastIndexOf('/') + 1)
      return {
        value: path,
        label: name,
        errorCount:
          replInfo?.errors.filter((e) => e.location?.file && '/' + e.location.file === path)
            .length ?? 0,
        warningCount:
          replInfo?.warnings.filter((e) => e.location?.file && '/' + e.location.file === path)
            .length ?? 0,
      }
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

  return (
    <header className="h-repl-header flex items-stretch gap-2">
      <ScrollArea scrollHideDelay={0}>
        <div className="flex h-full flex-1 border-b">
          {modelSwitcherOptions.map((modelOption) => (
            <span key={modelOption.value} className="group relative inline-flex items-center">
              <Button
                variant="none"
                size="none"
                data-active={replState.activeModel === modelOption.value}
                className="before:border-border data-[active=true]:before:border-b-editor-background data-[active=true]:before:bg-editor-background group peer py-2 pl-4 pr-8 before:absolute before:inset-0 before:-bottom-px data-[active=true]:cursor-default data-[active=true]:before:border data-[active=true]:before:border-t-0 data-[active=true]:before:shadow-inner group-first:data-[active=true]:before:border-l-0"
                onClick={() =>
                  setReplState((prev) => ({ ...prev, activeModel: modelOption.value }))
                }
              >
                <span
                  className={cn(
                    'relative opacity-60 group-hover:opacity-100 group-data-[active=true]:opacity-80',
                    modelOption.warningCount > 0 && 'text-yellow-500',
                    modelOption.errorCount > 0 && 'text-red-500'
                  )}
                >
                  {modelOption.label}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="none"
                className="text-muted-foreground hover:text-accent-foreground invisible absolute right-2 mt-px self-center p-0.5 group-hover:visible aria-expanded:visible peer-data-[active=true]:visible"
                onClick={() => closeModelTab(modelOption.value)}
              >
                <LucideX size={16} />
              </Button>
            </span>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-1 p-0 [&>:first-child]:rounded-none" />
      </ScrollArea>
    </header>
  )
}

'use client'

import React, { useCallback, useContext, useMemo } from 'react'
import { useTheme } from 'next-themes'
import {
  LucideEye,
  LucideMoon,
  LucidePalette,
  LucideShare2,
  LucideSun,
  LucideX,
} from 'lucide-react'
import ShareRepl from '@/components/share-repl'
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
import { ReplInfoContext } from '@/context/repl-info-context'
import { ReplStateContext } from '@/context/repl-state-context'
import { Themes } from '@/lib/themes'
import { cn } from '@/lib/utils'
import HeaderBase from './header-base'

export default function ReplHeader() {
  const { resolvedTheme: themeId, setTheme } = useTheme()
  const { replState, setReplState } = useContext(ReplStateContext)!
  const { replInfo } = useContext(ReplInfoContext)!

  const modelSwitcherOptions = useMemo(() => {
    return replState.openedModels.map((path) => {
      const label = path.replace(/^\//, '')
      return {
        value: path,
        label,
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
    <HeaderBase>
      <div className="-my-px flex flex-1 overflow-x-auto overflow-y-hidden">
        {modelSwitcherOptions.map((modelOption) => (
          <span key={modelOption.value} className="group relative inline-flex items-center">
            <Button
              variant="none"
              size="none"
              data-active={replState.activeModel === modelOption.value}
              className="before:border-border data-[active=true]:before:border-b-editor-background data-[active=true]:before:bg-editor-background group peer mr-4 px-4 py-2 before:absolute before:inset-0 before:-bottom-px data-[active=true]:cursor-default data-[active=true]:before:border data-[active=true]:before:border-t-0 data-[active=true]:before:shadow-inner"
              onClick={() => setReplState((prev) => ({ ...prev, activeModel: modelOption.value }))}
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

      <div className="ml-auto flex items-center self-center">
        <Button
          size="icon-sm"
          variant={replState.showPreview ? 'secondary' : 'ghost'}
          className="text-secondary-foreground/60 mr-1"
          title="Toggle preview window"
          onClick={() => setReplState((prev) => ({ ...prev, showPreview: !prev.showPreview }))}
        >
          <LucideEye size={20} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-secondary-foreground/60"
              title="Choose theme..."
            >
              <LucidePalette size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={themeId} onValueChange={(value) => setTheme(value)}>
              {Themes.map((option) => (
                <DropdownMenuRadioItem key={option.id} value={option.id}>
                  {option.label}
                  {option.isDark ? (
                    <LucideMoon width={18} height={18} className="text-foreground/20 ml-auto" />
                  ) : (
                    <LucideSun width={18} height={18} className="text-foreground/20 ml-auto" />
                  )}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-secondary-foreground/60"
              title="Share..."
            >
              <LucideShare2 size={18} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-96">
            <DropdownMenuLabel className="text-foreground/80 text-sm font-normal">
              <ShareRepl setReplState={setReplState} />
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </HeaderBase>
  )
}

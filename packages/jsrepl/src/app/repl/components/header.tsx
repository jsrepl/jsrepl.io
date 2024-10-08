'use client'

import React, { useMemo } from 'react'
import { useTheme } from 'next-themes'
import {
  LucideEllipsisVertical,
  LucideMoon,
  LucidePalette,
  LucideRotateCw,
  LucideShare2,
  LucideSun,
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
import { SetReplStoredState } from '@/hooks/useReplStoredState'
import { Themes } from '@/lib/themes'
import { PreviewPosition, type ReplStoredState, type UserStoredState } from '@/types'
import HeaderBase from './header-base'

export default function ReplHeader({
  replState,
  setReplState,
  userState,
  setUserState,
  previewShown,
  togglePreview,
}: {
  replState: ReplStoredState
  setReplState: SetReplStoredState
  userState: UserStoredState
  setUserState: React.Dispatch<React.SetStateAction<UserStoredState>>
  previewShown: boolean
  togglePreview: (force?: boolean) => void
}) {
  const { resolvedTheme: themeId, setTheme } = useTheme()

  const modelSwitcherOptions = useMemo(() => {
    return Array.from(replState.models.values()).map((model) => {
      const label = model.path.replace(/^\//, '')
      return { value: model.path, label }
    })
  }, [replState.models])

  const previewPositionOptions = [
    { value: PreviewPosition.FloatTopRight, label: 'Floating: top right' },
    { value: PreviewPosition.FloatBottomRight, label: 'Floating: bottom right' },
    { value: PreviewPosition.AsideRight, label: 'Dock to right' },
  ]

  function restartRepl() {
    const previewIframe = document.getElementById('preview-iframe') as HTMLIFrameElement
    previewIframe.src += ''
  }

  return (
    <HeaderBase>
      <div className="flex">
        {modelSwitcherOptions.map((modelOption) => (
          <span key={modelOption.value} className="group relative inline-flex items-center">
            <Button
              variant="none"
              size="none"
              data-active={replState.activeModel === modelOption.value}
              className="before:border-border data-[active=true]:before:border-b-editor-background data-[active=true]:before:bg-editor-background group peer px-4 py-2 before:absolute before:inset-0 before:-bottom-px data-[active=true]:cursor-default data-[active=true]:before:border data-[active=true]:before:border-t-0 data-[active=true]:before:shadow-inner"
              onClick={() => setReplState((prev) => ({ ...prev, activeModel: modelOption.value }))}
            >
              <span className="relative opacity-60 group-hover:opacity-100 group-data-[active=true]:opacity-80">
                {modelOption.label}
              </span>
            </Button>

            {false && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="none"
                    className="text-muted-foreground hover:text-accent-foreground invisible absolute right-2 mt-px cursor-default self-center p-0.5 aria-expanded:visible peer-data-[active=true]:visible"
                  >
                    <LucideEllipsisVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>{/* TODO */}</DropdownMenuLabel>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </span>
        ))}
      </div>

      <div className="ml-10 flex max-[840px]:ml-2">
        <span className="group relative inline-flex items-center">
          <Button
            variant="none"
            size="none"
            data-active={previewShown}
            className="data-[active=true]:border-border data-[active=true]:bg-editor-background group peer border border-transparent py-1.5 pl-4 pr-8 before:absolute before:inset-0 data-[active=true]:shadow-inner"
            onClick={() => togglePreview()}
          >
            <span className="opacity-60 group-hover:opacity-100 group-data-[active=true]:opacity-80">
              Preview
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="none"
                className="text-muted-foreground hover:text-accent-foreground invisible absolute right-2 mt-px cursor-default self-center p-0.5 aria-expanded:visible peer-data-[active=true]:visible"
              >
                <LucideEllipsisVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Preview Position</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={userState.previewPos}
                onValueChange={(value) =>
                  setUserState((prev) => ({ ...prev, previewPos: value as PreviewPosition }))
                }
              >
                {previewPositionOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </div>

      <div className="ml-auto flex items-center self-center">
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

        <Button
          size="icon-sm"
          variant="ghost"
          className="text-secondary-foreground/60"
          title="Restart REPL"
          onClick={() => restartRepl()}
        >
          <LucideRotateCw size={18} />
        </Button>

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

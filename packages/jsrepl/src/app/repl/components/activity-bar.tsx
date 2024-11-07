import { useCallback, useContext } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { ResumeIcon } from '@radix-ui/react-icons'
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideFiles,
  LucidePause,
  LucidePlay,
} from 'lucide-react'
import { LucideEye, LucideMoon, LucidePalette, LucideShare2, LucideSun } from 'lucide-react'
import IconPause from '~icons/mdi/pause.jsx'
import IconGithub from '~icons/simple-icons/github.jsx'
import Logo from '@/components/logo'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ReplHistoryModeContext } from '@/context/repl-history-mode-context'
import { ReplPayloadsContext } from '@/context/repl-payloads-context'
import { ReplStateContext } from '@/context/repl-state-context'
import { UserStateContext } from '@/context/user-state-context'
import { Themes } from '@/lib/themes'
import { cn } from '@/lib/utils'

export default function ActivityBar() {
  const { resolvedTheme: themeId, setTheme } = useTheme()
  const { replState, setReplState } = useContext(ReplStateContext)!
  const { userState, setUserState } = useContext(UserStateContext)!
  const { historyMode, setHistoryMode } = useContext(ReplHistoryModeContext)!
  const { payloads } = useContext(ReplPayloadsContext)!

  const startRepl = useCallback(() => {
    window.dispatchEvent(new Event('jsrepl-start-repl'))
  }, [])

  const toggleHistoryMode = useCallback(() => {
    const lastPayload = payloads[payloads.length - 1]
    if (!lastPayload) {
      return
    }

    setHistoryMode((prev) => ({ ...prev, currentPayloadId: lastPayload.id }))
  }, [payloads, setHistoryMode])

  const historyModeGoPrev = useCallback(() => {
    if (!historyMode) {
      return
    }

    const currentIndex = payloads.findIndex(
      (payload) => payload.id === historyMode.currentPayloadId
    )
    if (currentIndex === -1) {
      return
    }

    const prevPayload = payloads[currentIndex - 1]
    if (!prevPayload) {
      return
    }

    setHistoryMode((prev) => ({ ...prev, currentPayloadId: prevPayload.id }))
  }, [payloads, setHistoryMode, historyMode])

  const historyModeGoNext = useCallback(() => {
    if (!historyMode) {
      return
    }

    const currentIndex = payloads.findIndex(
      (payload) => payload.id === historyMode.currentPayloadId
    )
    if (currentIndex === -1) {
      return
    }

    const nextPayload = payloads[currentIndex + 1]
    if (!nextPayload) {
      return
    }

    setHistoryMode((prev) => ({ ...prev, currentPayloadId: nextPayload.id }))
  }, [payloads, setHistoryMode, historyMode])

  return (
    <div className="bg-activityBar flex flex-col gap-2 px-1 pb-2 pt-1 [grid-area:activity-bar]">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <Logo width="1.25rem" height="1.25rem" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Go to homepage
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'text-activityBar-foreground',
              userState.showLeftSidebar && 'bg-accent border-activityBar-foreground/30 border'
            )}
            onClick={() =>
              setUserState((prev) => ({ ...prev, showLeftSidebar: !prev.showLeftSidebar }))
            }
          >
            <LucideFiles size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Toggle files sidebar
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'text-activityBar-foreground',
              replState.showPreview && 'bg-accent border-activityBar-foreground/30 border'
            )}
            onClick={() => setReplState((prev) => ({ ...prev, showPreview: !prev.showPreview }))}
          >
            <LucideEye size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Toggle preview window
        </TooltipContent>
      </Tooltip>

      <div className="border-activityBar-foreground/30 mx-2 my-2 border-b" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="text-activityBar-foreground"
            onClick={startRepl}
          >
            <div className="relative">
              <LucidePlay size={20} />
              {!userState.autostartOnCodeChange && (
                <IconPause width={10} height={10} className="absolute -bottom-1 -right-0.5" />
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} align="start">
          Start / Restart REPL
          <div className="bg-secondary text-secondary-foreground border-primary -mx-2 -mb-1 mt-1 rounded-b border px-2 py-2">
            <label className="flex items-center gap-1">
              <span>Autostart on code change</span>
              <input
                type="checkbox"
                defaultChecked={userState.autostartOnCodeChange}
                onChange={(e) =>
                  setUserState((prev) => ({ ...prev, autostartOnCodeChange: e.target.checked }))
                }
              />
            </label>
          </div>
        </TooltipContent>
      </Tooltip>

      <Button
        size="icon"
        variant="ghost"
        className="text-activityBar-foreground"
        onClick={toggleHistoryMode}
      >
        {historyMode ? <ResumeIcon width={18} height={18} /> : <LucidePause size={18} />}
      </Button>

      <Button
        size="icon"
        variant="ghost"
        className="text-activityBar-foreground"
        onClick={historyModeGoPrev}
      >
        <LucideChevronLeft size={18} />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        className="text-activityBar-foreground"
        onClick={historyModeGoNext}
      >
        <LucideChevronRight size={18} />
      </Button>

      <div className="flex-1" />

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="text-activityBar-foreground">
                <LucidePalette size={18} />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Choose theme...
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent side="left" align="end" className="w-56">
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
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="text-activityBar-foreground">
                <LucideShare2 size={18} />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Share...
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent className="w-96" side="left" align="end">
          <DropdownMenuLabel className="text-foreground/80 text-sm font-normal">
            <ShareRepl setReplState={setReplState} />
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="icon" variant="ghost" className="text-activityBar-foreground" asChild>
        <Link href="https://github.com/jsrepl/jsrepl.io" target="_blank">
          <IconGithub width={17} height={17} />
        </Link>
      </Button>
    </div>
  )
}

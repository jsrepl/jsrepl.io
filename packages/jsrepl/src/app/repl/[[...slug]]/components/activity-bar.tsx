import { useCallback, useState } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { ReplPayload } from '@jsrepl/shared-types'
import { LucideFiles, LucidePlay, LucideRewind, LucideRotateCw, LucideSettings } from 'lucide-react'
import { LucideEye, LucideMoon, LucidePalette, LucideShare2, LucideSun } from 'lucide-react'
import IconGithub from '~icons/simple-icons/github.jsx'
import Logo from '@/components/logo'
import ReplSettingsDialog from '@/components/repl-settings-dialog'
import ShareReplDropdownItem from '@/components/share-repl-dropdown-item'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { UserAvatar } from '@/components/user-avatar'
import { UserMenu } from '@/components/user-menu'
import { useReplPayloads } from '@/hooks/useReplPayloads'
import { useReplPreviewShown } from '@/hooks/useReplPreviewShown'
import { useReplRewindMode } from '@/hooks/useReplRewindMode'
import { useUser } from '@/hooks/useUser'
import { useUserStoredState } from '@/hooks/useUserStoredState'
import { Themes } from '@/lib/themes'
import { cn } from '@/lib/utils'

export default function ActivityBar() {
  const user = useUser()
  const { resolvedTheme: themeId, setTheme } = useTheme()
  const [userState, setUserState] = useUserStoredState()
  const [rewindMode, setRewindMode] = useReplRewindMode()
  const { payloads } = useReplPayloads()
  const { previewEnabled, previewShown, setPreviewShown } = useReplPreviewShown()
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

  const restartRepl = useCallback(() => {
    setRewindMode((prev) => ({ ...prev, active: false, currentPayloadId: null }))
    window.dispatchEvent(new Event('jsrepl-restart-repl'))
  }, [setRewindMode])

  const toggleRewindMode = useCallback(() => {
    setRewindMode((prev) => {
      if (prev.active) {
        return { ...prev, active: false, currentPayloadId: null }
      } else {
        const lastPayload: ReplPayload | undefined = payloads[payloads.length - 1]
        return { ...prev, active: true, currentPayloadId: lastPayload ? lastPayload.id : null }
      }
    })
  }, [payloads, setRewindMode])

  return (
    <>
      <div className="bg-activityBar flex flex-col gap-2 px-1 pb-2 pt-1 [grid-area:activity-bar]">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon-lg">
              <Link href={user ? '/dashboard' : '/'}>
                <Logo width="1.25rem" height="1.25rem" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {user ? 'Go to Dashboard' : 'Go to Homepage'}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-lg"
              variant="ghost"
              className={cn(
                'text-activityBar-foreground',
                userState.showLeftSidebar && 'bg-accent border-activityBar-foreground/30 border'
              )}
              onClick={() =>
                setUserState((prev) => ({ ...prev, showLeftSidebar: !prev.showLeftSidebar }))
              }
            >
              <LucideFiles size={22} strokeWidth={1.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Project
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-lg"
              variant="ghost"
              className={cn(
                'text-activityBar-foreground',
                previewShown && 'bg-accent border-activityBar-foreground/30 border'
              )}
              disabled={!previewEnabled}
              onClick={() => setPreviewShown((prev) => !prev)}
            >
              <LucideEye size={22} strokeWidth={1.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Preview Window
          </TooltipContent>
        </Tooltip>

        <div className="border-activityBar-foreground/30 mx-2 my-2 border-b" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-lg"
              variant="ghost"
              className="text-activityBar-foreground group"
              onClick={restartRepl}
            >
              <div className="relative">
                {userState.autostartOnCodeChange ? (
                  <LucideRotateCw
                    size={20}
                    strokeWidth={1.5}
                    className="transition-transform group-active:rotate-90"
                  />
                ) : (
                  <LucidePlay
                    size={21}
                    strokeWidth={1.5}
                    className="transition-transform group-active:translate-x-1"
                  />
                )}
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} align="start">
            {userState.autostartOnCodeChange ? 'Restart REPL' : 'Start REPL'}
            <div className="bg-secondary text-secondary-foreground border-primary -mx-2 -mb-1 mt-1 rounded-b border px-2 py-2">
              <label className="flex cursor-pointer select-none items-center gap-1">
                <span>Restart on code change</span>
                <Checkbox
                  size="sm"
                  checked={userState.autostartOnCodeChange}
                  onCheckedChange={(checked) =>
                    setUserState((prev) => ({ ...prev, autostartOnCodeChange: !!checked }))
                  }
                />
              </label>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-lg"
              variant="ghost"
              className={cn(
                'text-activityBar-foreground',
                rewindMode.active && 'bg-accent border-activityBar-foreground/30 border'
              )}
              onClick={toggleRewindMode}
            >
              <LucideRewind size={20} strokeWidth={1.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Rewind Mode
          </TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button size="icon-lg" variant="ghost" className="text-activityBar-foreground">
                  <LucidePalette size={20} strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Themes
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
                <Button size="icon-lg" variant="ghost" className="text-activityBar-foreground">
                  <LucideShare2 size={20} strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Share
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent className="w-56" side="left" align="end">
            <ShareReplDropdownItem />
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-lg"
              variant="ghost"
              className="text-activityBar-foreground"
              onClick={() => setSettingsDialogOpen(true)}
            >
              <LucideSettings size={21} strokeWidth={1.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Settings
          </TooltipContent>
        </Tooltip>

        <Button size="icon-lg" variant="ghost" className="text-activityBar-foreground" asChild>
          <Link href="https://github.com/jsrepl/jsrepl.io" target="_blank">
            <IconGithub width={19} height={19} />
          </Link>
        </Button>

        <UserMenu
          signInOptions={{ popup: true }}
          trigger={
            <Button size="icon-lg" variant="ghost" className="text-activityBar-foreground">
              <UserAvatar user={user} size={24} />
            </Button>
          }
          dropdownMenuContentProps={{ side: 'right', align: 'end' }}
        />
      </div>

      <ReplSettingsDialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen} />
    </>
  )
}

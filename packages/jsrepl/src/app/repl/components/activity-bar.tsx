import { useContext } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { LucideFiles } from 'lucide-react'
import { LucideEye, LucideMoon, LucidePalette, LucideShare2, LucideSun } from 'lucide-react'
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
import { ReplStateContext } from '@/context/repl-state-context'
import { UserStateContext } from '@/context/user-state-context'
import { Themes } from '@/lib/themes'

export default function ActivityBar() {
  const { resolvedTheme: themeId, setTheme } = useTheme()
  const { replState, setReplState } = useContext(ReplStateContext)!
  const { userState, setUserState } = useContext(UserStateContext)!

  return (
    <div className="bg-secondary flex flex-col gap-2 px-1 pb-2 pt-1 [grid-area:activity-bar]">
      <Button asChild variant="ghost" size="icon" title="Go to homepage">
        <Link href="/">
          <Logo width="1.25rem" height="1.25rem" />
        </Link>
      </Button>

      <Button
        size="icon"
        variant={userState.showLeftSidebar ? 'secondary' : 'ghost'}
        className="text-secondary-foreground/60"
        title="Toggle files sidebar"
        onClick={() =>
          setUserState((prev) => ({ ...prev, showLeftSidebar: !prev.showLeftSidebar }))
        }
      >
        <LucideFiles size={20} />
      </Button>

      <Button
        size="icon"
        variant={replState.showPreview ? 'secondary' : 'ghost'}
        className="text-secondary-foreground/60"
        title="Toggle preview window"
        onClick={() => setReplState((prev) => ({ ...prev, showPreview: !prev.showPreview }))}
      >
        <LucideEye size={20} />
      </Button>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="text-secondary-foreground/60"
            title="Choose theme..."
          >
            <LucidePalette size={18} />
          </Button>
        </DropdownMenuTrigger>
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
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="text-secondary-foreground/60"
            title="Share..."
          >
            <LucideShare2 size={18} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-96" side="left" align="end">
          <DropdownMenuLabel className="text-foreground/80 text-sm font-normal">
            <ShareRepl setReplState={setReplState} />
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="icon" variant="ghost" className="text-secondary-foreground/60" asChild>
        <Link href="https://github.com/jsrepl/jsrepl.io" target="_blank">
          <IconGithub width={17} height={17} />
        </Link>
      </Button>
    </div>
  )
}

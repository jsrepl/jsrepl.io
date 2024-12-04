import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Themes } from '@/lib/themes'
import { cn } from '@/lib/utils'

export default function ThemeSelector({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className={cn('absolute right-3 top-3', className)}>
          Theme: {resolvedTheme}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Themes.map((theme) => (
          <DropdownMenuItem key={theme.id} onClick={() => setTheme(theme.id)}>
            {theme.id}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

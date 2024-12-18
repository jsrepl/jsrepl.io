'use client'

import { useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { Theme } from '@jsrepl/shared-types'
import { LucideMoon } from 'lucide-react'
import { LucideSun } from 'lucide-react'
import { BundledTheme } from 'shiki'
import { Button, ButtonProps } from '@/components/ui/button'
import { Themes } from '@/lib/themes'

type Props = ButtonProps & {
  iconSize?: number
}

export default function ThemeSwitcher({ iconSize = 16, ...props }: Props) {
  const { resolvedTheme, setTheme } = useTheme()

  const theme = useMemo<Theme>(
    () => Themes.find((theme) => theme.id === resolvedTheme) ?? Themes[0]!,
    [resolvedTheme]
  )

  const [themeIdForSwitchTo, setThemeIdForSwitchTo] = useState<BundledTheme>(
    theme.isDark ? 'light-plus' : 'dark-plus'
  )

  function switchTheme() {
    setThemeIdForSwitchTo(theme.id)
    setTheme(themeIdForSwitchTo)
  }

  return (
    <Button variant="ghost" size="icon" onClick={switchTheme} {...props}>
      <LucideSun className="hidden dark:block" size={iconSize} />
      <LucideMoon className="dark:hidden" size={iconSize} />
    </Button>
  )
}

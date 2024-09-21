'use client'

import { Themes } from '@/lib/themes'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { usePathname } from 'next/navigation'

export default function ThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  return (
    <>
      <NextThemeProvider
        storageKey="theme"
        enableSystem={false}
        themes={Themes.map((theme) => theme.id)}
        defaultTheme={Themes[0].id}
        forcedTheme={pathname === '/repl' ? undefined : 'dark-plus'}
        enableColorScheme
        disableTransitionOnChange
        attribute="data-theme"
      >
        {children}
      </NextThemeProvider>
    </>
  )
}

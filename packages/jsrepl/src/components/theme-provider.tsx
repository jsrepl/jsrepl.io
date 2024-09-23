import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { Themes } from '@/lib/themes'

export default function ThemeProvider({
  forcedTheme,
  children,
}: Readonly<{
  forcedTheme?: string
  children: React.ReactNode
}>) {
  return (
    <>
      <NextThemeProvider
        storageKey="theme"
        enableSystem={false}
        themes={Themes.map((theme) => theme.id)}
        defaultTheme={Themes[0].id}
        forcedTheme={forcedTheme}
        enableColorScheme
        disableTransitionOnChange
        attribute="data-theme"
      >
        {children}
      </NextThemeProvider>
    </>
  )
}

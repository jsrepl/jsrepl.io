import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { headers } from 'next/headers'
import { Themes, defaultThemeId } from '@/lib/themes'

export default function ThemeProvider({
  forcedTheme,
  children,
}: Readonly<{
  forcedTheme?: string
  children: React.ReactNode
}>) {
  const nonce = headers().get('x-nonce')!

  return (
    <>
      <NextThemeProvider
        storageKey="theme"
        enableSystem={false}
        themes={Themes.map((theme) => theme.id)}
        defaultTheme={defaultThemeId}
        forcedTheme={forcedTheme}
        enableColorScheme
        disableTransitionOnChange
        attribute="data-theme"
        nonce={nonce}
      >
        {children}
      </NextThemeProvider>
    </>
  )
}

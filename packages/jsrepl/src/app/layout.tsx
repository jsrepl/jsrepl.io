import type { Metadata } from 'next'
import { NavigationGuardProvider } from 'next-navigation-guard'
import Analytics from '@/components/analytics'
import QueryProvider from '@/components/providers/query-provider'
import SessionProvider from '@/components/providers/session-provider'
import ThemeProvider from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: 'JavaScript REPL & Playground',
  description: 'Quickly test and share your code snippets. Ideal for learning and prototyping.',
  openGraph: {
    type: 'website',
    images: {
      url: '/assets/landing-hero.png',
      type: 'image/png',
      width: 1200,
      height: 917,
    },
  },
  keywords: ['JavaScript', 'TypeScript', 'REPL', 'Playground'],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    // suppressHydrationWarning: https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="en" suppressHydrationWarning className="scroll-pt-24">
      <body>
        <NavigationGuardProvider>
          <SessionProvider initialSession={session}>
            <QueryProvider>
              <ThemeProvider>
                <TooltipProvider>{children}</TooltipProvider>
                <Toaster />
              </ThemeProvider>
            </QueryProvider>
          </SessionProvider>
          <Analytics />
        </NavigationGuardProvider>
      </body>
    </html>
  )
}

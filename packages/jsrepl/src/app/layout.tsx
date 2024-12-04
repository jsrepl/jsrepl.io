import type { Metadata } from 'next'
import Analytics from '@/components/analytics'
import QueryProvider from '@/components/providers/query-provider'
import SessionProvider from '@/components/providers/session-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning: https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </QueryProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}

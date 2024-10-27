import type { Metadata } from 'next'
import Script from 'next/script'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

export const metadata: Metadata = {
  title: 'JSREPL',
  description: 'JavaScript REPL & Playground',
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
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
        {process.env.NEXT_PUBLIC_NODE_ENV === 'production' && (
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id="23c57346-41a9-4b0f-a07a-76f8bf7c4ff3"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  )
}

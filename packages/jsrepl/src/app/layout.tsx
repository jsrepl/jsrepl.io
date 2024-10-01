import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
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
        {children}
        <Toaster />
      </body>
    </html>
  )
}

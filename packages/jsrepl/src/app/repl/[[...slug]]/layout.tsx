import type { Metadata } from 'next'
import ThemeProvider from '@/components/providers/theme-provider'

export const metadata: Metadata = {
  title: null,
}

export default function ReplLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider>
      <div className="flex h-screen flex-col">{children}</div>
    </ThemeProvider>
  )
}

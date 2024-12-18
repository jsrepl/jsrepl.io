import type { Metadata } from 'next'
import ThemeProvider from '@/components/providers/theme-provider'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function SessionPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider>
      <main>{children}</main>
    </ThemeProvider>
  )
}

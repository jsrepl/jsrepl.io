import ThemeProvider from '@/components/theme-provider'

export default function ReplLayout({
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

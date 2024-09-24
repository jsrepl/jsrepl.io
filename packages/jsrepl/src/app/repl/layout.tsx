import ThemeProvider from '@/components/theme-provider'

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

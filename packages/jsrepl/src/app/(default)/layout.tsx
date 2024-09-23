import Footer from '@/components/footer'
import Header from '@/components/header'
import ThemeProvider from '@/components/theme-provider'

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider forcedTheme="dark-plus">
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer className="mt-32 max-md:mt-20" />
      </div>
    </ThemeProvider>
  )
}

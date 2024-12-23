import type { Metadata } from 'next'
import Footer from '@/components/footer'
import Header from '@/components/header'
import { CodeHighlighterProvider } from '@/components/providers/code-highlighter-provider'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <CodeHighlighterProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="text-foreground/90 container">{children}</div>
        </main>
        <Footer className="mt-32 max-md:mt-20" />
      </div>
    </CodeHighlighterProvider>
  )
}

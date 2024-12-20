import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: null,
}

export default function ReplLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div className="flex h-screen flex-col">{children}</div>
}

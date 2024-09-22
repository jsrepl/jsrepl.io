import React from 'react'

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-8 py-12">
      <div className="prose prose-stone dark:prose-invert max-w-[80ch]">{children}</div>
    </div>
  )
}

import React from 'react'

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-12">
      <div className="prose prose-stone dark:prose-invert max-w-[80ch]">{children}</div>
    </div>
  )
}

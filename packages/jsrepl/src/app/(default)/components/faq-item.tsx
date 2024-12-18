import { LucideChevronRight } from 'lucide-react'

export function FaqItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group">
      <summary className="text-primary w-max cursor-pointer text-2xl font-semibold marker:content-none">
        <LucideChevronRight className="mr-2 inline-block align-[-0.25rem] transition-transform group-open:rotate-90" />
        {title}
      </summary>
      <div className="prose dark:prose-invert ml-1 mt-4 font-medium">{children}</div>
    </details>
  )
}

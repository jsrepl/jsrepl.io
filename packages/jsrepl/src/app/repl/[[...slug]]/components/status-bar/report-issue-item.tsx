import Link from 'next/link'
import { LucideBug } from 'lucide-react'
import StatusBarButton from './status-bar-button'

export default function ReportIssueItem() {
  return (
    <StatusBarButton asChild>
      <Link href="https://github.com/jsrepl/jsrepl.io/issues" target="_blank">
        <LucideBug size={12} className="mr-1" strokeWidth={1.5} />
        Report issue…
      </Link>
    </StatusBarButton>
  )
}

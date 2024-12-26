import Link from 'next/link'
import { LucideArrowUpRight, LucideBug, LucideGithub, LucideHouse, LucideMail } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import StatusBarButton from './status-bar-button'

export default function TitleItem() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <StatusBarButton
          className="hover:bg-primary aria-expanded:bg-primary hover:text-primary-foreground aria-expanded:text-primary-foreground"
          style={{ fontVariant: 'small-caps' }}
        >
          jsrepl.io
        </StatusBarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/" target="_blank">
            <LucideHouse size={16} className="text-muted-foreground" />
            Homepage
            <LucideArrowUpRight size={16} className="text-muted-foreground" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="https://github.com/jsrepl/jsrepl.io" target="_blank">
            <LucideGithub size={16} className="text-muted-foreground" />
            GitHub
            <LucideArrowUpRight size={16} className="text-muted-foreground" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="https://github.com/jsrepl/jsrepl.io/issues" target="_blank">
            <LucideBug size={16} className="text-muted-foreground" />
            Report an issue
            <LucideArrowUpRight size={16} className="text-muted-foreground" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="mailto:contact@jsrepl.io">
            <LucideMail size={16} className="text-muted-foreground" />
            Contact by email
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

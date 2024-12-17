'use client'

import Link from 'next/link'
import { DropdownMenuContentProps } from '@radix-ui/react-dropdown-menu'
import { LucideLibrary, LucideLogOut } from 'lucide-react'
import IconGithub from '~icons/simple-icons/github.jsx'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthHelpers } from '@/hooks/useAuthHelpers'
import { useUser } from '@/hooks/useUser'
import { cn } from '@/lib/utils'
import { UserAvatar } from './user-avatar'

export function UserMenu({
  className,
  trigger,
  signInOptions,
  dropdownMenuContentProps,
}: {
  className?: string
  trigger?: React.ReactNode
  signInOptions?: {
    popup?: boolean
    next?: string
  }
  dropdownMenuContentProps?: DropdownMenuContentProps
}) {
  const user = useUser()
  const { signInWithGithub, signOut } = useAuthHelpers()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon-lg" className={cn('rounded-full p-0', className)}>
            <UserAvatar user={user} size={32} />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        {...dropdownMenuContentProps}
        className={cn('min-w-40', dropdownMenuContentProps?.className)}
      >
        {user ? (
          <>
            <DropdownMenuLabel className="flex flex-col items-center gap-2">
              <UserAvatar user={user} size={48} className="text-muted-foreground" />
              <span className="text-foreground/90 font-light">
                Hi, {user.user_metadata.user_name}!
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <LucideLibrary size={16} className="text-muted-foreground" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>
              <LucideLogOut size={16} className="text-muted-foreground" />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="flex flex-col items-center gap-2">
              <UserAvatar user={user} size={48} className="text-muted-foreground" />
              <span className="text-foreground/90 font-light">Welcome, anonymous!</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signInWithGithub(signInOptions)}>
              <IconGithub width={16} height={16} className="text-muted-foreground" />
              Sign in with GitHub
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

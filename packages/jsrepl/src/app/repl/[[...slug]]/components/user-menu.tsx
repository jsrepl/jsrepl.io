'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { LucideUserRound } from 'lucide-react'
import IconGithub from '~icons/simple-icons/github.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

export function UserMenu() {
  const user = useUser()
  const { signInWithGithub, signOut } = useAuthHelpers()

  const fallbackInitials = useMemo(() => {
    if (!user) return ''

    const name = user.user_metadata.name as string
    return name
      .split(' ')
      .map((n) => (n[0] ?? '').toUpperCase())
      .join('')
  }, [user])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="text-activityBar-foreground">
          {user ? (
            <Avatar className="h-6 w-6 text-xs">
              <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.name} />
              <AvatarFallback className="border border-current">{fallbackInitials}</AvatarFallback>
            </Avatar>
          ) : (
            <LucideUserRound size={18} />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="left" align="end" className="w-56">
        {user ? (
          <DropdownMenuLabel>
            Logged in as{' '}
            <Link
              href={`https://github.com/${user.user_metadata.user_name}`}
              target="_blank"
              className="underline-offset-4 hover:underline"
            >
              <IconGithub className="mx-1 inline-block align-text-bottom" width={16} height={16} />
              {user.user_metadata.user_name}
            </Link>
          </DropdownMenuLabel>
        ) : (
          <DropdownMenuLabel>Not logged in</DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => signInWithGithub({ popup: true })}>
            Sign in with GitHub…
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

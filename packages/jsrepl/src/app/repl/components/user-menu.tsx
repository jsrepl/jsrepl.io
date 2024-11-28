'use client'

import { useMemo } from 'react'
import { LucideUser } from 'lucide-react'
import { toast } from 'sonner'
import IconGithub from '~icons/simple-icons/github.jsx'
import { useSession, useSupabaseClient, useUser } from '@/components/session-context'
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

export function UserMenu() {
  const user = useUser()
  const session = useSession()
  const supabase = useSupabaseClient()

  console.log('user', user)
  console.log('session', session)

  const fallbackInitials = useMemo(() => {
    if (!user) return ''

    const name = user.user_metadata.name as string
    return name
      .split(' ')
      .map((n) => (n[0] ?? '').toUpperCase())
      .join('')
  }, [user])

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Failed to sign out', {
        description: error.message,
      })
    }
  }

  async function signIn() {
    const currentPath = location.pathname + location.search
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'gist',
        redirectTo: `${location.origin}/api/auth/callback?next=${encodeURIComponent(currentPath)}`,
      },
    })

    if (error) {
      toast.error('Failed to sign in with GitHub', {
        description: error.message,
      })
    }
  }

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
            <LucideUser size={18} />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="left" align="end" className="w-56">
        {user ? (
          <DropdownMenuLabel>
            Logged in as{' '}
            <IconGithub className="ml-1 inline-block align-text-bottom" width={16} height={16} />{' '}
            {user.user_metadata.user_name}
          </DropdownMenuLabel>
        ) : (
          <DropdownMenuLabel>Not logged in</DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={signIn}>Sign in with GitHub…</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

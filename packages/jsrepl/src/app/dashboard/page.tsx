'use client'

import { useQuery } from '@tanstack/react-query'
import { LucideChevronDown, LucideUserRound } from 'lucide-react'
import { toast } from 'sonner'
import IconGithub from '~icons/simple-icons/github.jsx'
import ErrorComponent from '@/components/error'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthHelpers } from '@/hooks/useAuthHelpers'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { useUser } from '@/hooks/useUser'
import { loadAll } from '@/lib/repl-stored-state/adapter-supabase'
import ReplCard from './repl-card'

export default function DashboardPage() {
  const user = useUser()
  const supabase = useSupabaseClient()
  const { signInWithGithub, signOut } = useAuthHelpers()

  const {
    data: repls,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['repls', user?.id],
    queryFn: ({ signal }) => (user ? loadAll(user.id, { supabase, signal }) : []),
    staleTime: 60_000,
  })

  return (
    <>
      <div className="my-3 flex flex-col items-center justify-between">
        <div className="bg-muted rounded-full px-5">
          {user ? (
            <div className="inline-flex items-center gap-1">
              Welcome,
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="lg" className="-mr-3 px-2 text-base font-normal">
                    {user.user_metadata.avatar_url ? (
                      <img
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata.name}
                      />
                    ) : (
                      <LucideUserRound size={18} className="mr-2" />
                    )}
                    {user.user_metadata.user_name}
                    <LucideChevronDown
                      size={16}
                      className="ml-1 inline-block align-middle opacity-30"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-sm">
              <Button
                variant="link"
                size="lg"
                className="px-0"
                onClick={() =>
                  signInWithGithub({
                    popup: false,
                    next: '/dashboard',
                  })
                }
              >
                <IconGithub width={18} height={18} className="mr-2" />
                Log in with Github
              </Button>
              to store your repls on the dashboard
            </div>
          )}
        </div>
      </div>

      <section className="my-8">
        <h1 className="sr-only">Your Work</h1>
        {error && <ErrorComponent error={error} />}
        {isLoading && <div>Loading...</div>}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {repls && repls.map((repl) => <ReplCard key={repl.id} repl={repl} />)}
        </div>
      </section>
    </>
  )
}

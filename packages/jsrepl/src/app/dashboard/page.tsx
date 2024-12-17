'use client'

import { useState } from 'react'
import { usePrefetchQuery } from '@tanstack/react-query'
import { LucideLibrary, LucidePlus } from 'lucide-react'
import IconLanguageCss from '~icons/mdi/language-css3.jsx'
import IconLanguageHtml from '~icons/mdi/language-html5.jsx'
import IconLanguageJavascript from '~icons/mdi/language-javascript.jsx'
import IconLanguageTypescript from '~icons/mdi/language-typescript.jsx'
import IconReact from '~icons/mdi/react.jsx'
import IconTailwind from '~icons/mdi/tailwind.jsx'
import IconGithub from '~icons/simple-icons/github.jsx'
import ReplStarterDialog from '@/components/repl-starter-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthHelpers } from '@/hooks/useAuthHelpers'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { useUser } from '@/hooks/useUser'
import { loadRecentlyViewedRepls, loadUserRepls } from '@/lib/repl-stored-state/adapter-supabase'
import { RecentlyViewed } from './recently-viewed'
import { YourWork } from './your-work'

export default function DashboardPage() {
  const user = useUser()
  const supabase = useSupabaseClient()
  const { signInWithGithub } = useAuthHelpers()
  const [starterDialogOpen, setStarterDialogOpen] = useState(false)

  usePrefetchQuery({
    queryKey: ['recently-viewed-repls', user?.id],
    queryFn: ({ signal }) => (user ? loadRecentlyViewedRepls({ supabase, signal }) : []),
    staleTime: 60_000,
  })

  usePrefetchQuery({
    queryKey: ['user-repls', user?.id],
    queryFn: ({ signal }) => (user ? loadUserRepls(user.id, { supabase, signal }) : []),
    staleTime: 60_000,
  })

  if (!user) {
    return (
      <>
        <div className="my-20 flex flex-col items-center justify-between">
          <LucideLibrary size={128} className="text-muted-foreground/50 mb-4" />
          <div className="bg-muted rounded-full px-5">
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
              to store your REPLs on the Dashboard
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <section className="my-8">
        <Button
          className="bg-secondary border-border hover:border-primary relative inline-flex h-24 w-full max-w-[26rem] items-center justify-start rounded border px-5 text-start"
          variant="none"
          size="none"
          onClick={() => setStarterDialogOpen(true)}
        >
          <LucidePlus size={42} strokeWidth={1} className="mr-4" />
          <div className="flex-1 text-wrap">
            <div>New REPL</div>
            <div className="text-muted-foreground mt-1 text-xs">from one of starter templates</div>
          </div>
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 flex w-20 items-center justify-center overflow-hidden opacity-20">
            <div className="grid grid-cols-2 gap-x-2 *:h-10 *:w-10">
              <IconLanguageTypescript />
              <IconLanguageHtml />
              <IconLanguageCss />
              <IconReact />
              <IconLanguageJavascript />
              <IconTailwind />
            </div>
          </div>
        </Button>
      </section>

      <Tabs defaultValue="recently-viewed" className="my-12">
        <TabsList className="mx-auto grid h-10 w-full max-w-96 grid-cols-2">
          <TabsTrigger value="recently-viewed" className="leading-6">
            Recently Viewed
          </TabsTrigger>
          <TabsTrigger value="your-work" className="leading-6">
            Your Work
          </TabsTrigger>
        </TabsList>
        <TabsContent value="recently-viewed" className="my-10">
          <RecentlyViewed />
        </TabsContent>
        <TabsContent value="your-work" className="my-10">
          <YourWork />
        </TabsContent>
      </Tabs>

      <ReplStarterDialog open={starterDialogOpen} onOpenChange={setStarterDialogOpen} />
    </>
  )
}

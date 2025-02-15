'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LucideLibrary, LucidePlus } from 'lucide-react'
import { MdiLanguageCss3 } from '@/components/icons/mdi/language-css3'
import { MdiLanguageHtml5 } from '@/components/icons/mdi/language-html5'
import { MdiLanguageJavascript } from '@/components/icons/mdi/language-javascript'
import { MdiLanguageTypescript } from '@/components/icons/mdi/language-typescript'
import { MdiReact } from '@/components/icons/mdi/react'
import { MdiTailwind } from '@/components/icons/mdi/tailwind'
import { SimpleIconsGithub } from '@/components/icons/simple-icons/github'
import ReplStarterDialog from '@/components/repl-starter-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthHelpers } from '@/hooks/useAuthHelpers'
import { useUser } from '@/hooks/useUser'
import { RecentlyViewed } from './recently-viewed'
import { YourWork } from './your-work'

enum Tab {
  RecentlyViewed = 'recently-viewed',
  YourWork = 'your-work',
}

const defaultTab = Tab.RecentlyViewed

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const user = useUser()
  const { signInWithGithub } = useAuthHelpers()
  const [starterDialogOpen, setStarterDialogOpen] = useState(false)

  const activeTab: Tab = (searchParams.get('tab') as Tab | null) ?? defaultTab

  function setActiveTab(tab: Tab) {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete('page')

    if (tab === defaultTab) {
      newSearchParams.delete('tab')
    } else {
      newSearchParams.set('tab', tab)
    }

    router.push(`?${newSearchParams.toString()}`, { scroll: false })
  }

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
                <SimpleIconsGithub width={18} height={18} className="mr-2" />
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
              <MdiLanguageTypescript />
              <MdiLanguageHtml5 />
              <MdiLanguageCss3 />
              <MdiReact />
              <MdiLanguageJavascript />
              <MdiTailwind />
            </div>
          </div>
        </Button>
      </section>

      <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as Tab)} className="my-12">
        <TabsList className="mx-auto grid h-10 w-full max-w-96 grid-cols-2">
          <TabsTrigger value={Tab.RecentlyViewed} className="leading-6">
            Recently Viewed
          </TabsTrigger>
          <TabsTrigger value={Tab.YourWork} className="leading-6">
            Your Work
          </TabsTrigger>
        </TabsList>
        <TabsContent value={Tab.RecentlyViewed} className="my-10">
          <RecentlyViewed />
        </TabsContent>
        <TabsContent value={Tab.YourWork} className="my-10">
          <YourWork />
        </TabsContent>
      </Tabs>

      <ReplStarterDialog open={starterDialogOpen} onOpenChange={setStarterDialogOpen} />
    </>
  )
}

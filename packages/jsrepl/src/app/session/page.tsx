'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthError, User } from '@supabase/supabase-js'
import { LucideAlertCircle, LucideCheckCircle2, LucideLoader, LucideUserRoundX } from 'lucide-react'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import { useAuthHelpers } from '@/hooks/useAuthHelpers'
import { useSession } from '@/hooks/useSession'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'

export default function SessionPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<AuthError | Error | null>(null)
  const supabase = useSupabaseClient()
  const session = useSession()
  const { signInWithGithub } = useAuthHelpers()

  useEffect(() => {
    // HACK: Do getSession() here to ensure all tabs receive auth updates.
    // > getSession(): Returns the session, refreshing it if necessary.
    // onAuthStateChange doesn't receive new user & session automatically, even though
    // the documentation says it should: https://supabase.com/docs/reference/javascript/auth-onauthstatechange.
    // This trick works with @/lib/supabase/client, but not with @/lib/supabase/server, so this page is not RSC.
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        setLoading(false)
        setUser(data.session?.user ?? null)
        setError(error)
      })
      .catch((error) => {
        setError(error instanceof Error ? error : new Error('Unknown error'))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [supabase, session])

  return (
    <>
      <Link
        href="/"
        replace
        className="m-3 inline-flex items-center gap-2 text-xl font-light tracking-wide"
      >
        <Logo width="24" height="24" />
        <span className="text-foreground/80">JSREPL</span>
      </Link>

      <div className="my-32 space-y-4 text-center text-lg">
        {loading ? (
          <>
            <LucideLoader size={48} className="mx-auto animate-spin" />
            <h1 className="text-2xl">Checking your session...</h1>
          </>
        ) : error ? (
          <>
            <LucideAlertCircle size={48} className="mx-auto text-red-500" />
            <h1 className="text-2xl">Something went wrong :(</h1>
            <p className="text-muted-foreground">
              {error instanceof AuthError
                ? `${error.status} ${error.code}: ${error.message}`
                : error.message}
            </p>
          </>
        ) : user ? (
          <>
            <LucideCheckCircle2 size={48} className="mx-auto text-green-500" />
            <h1 className="text-2xl">Successfully signed in</h1>
            <p className="text-muted-foreground">
              You can now close this browser window and go back to your REPL
            </p>
          </>
        ) : (
          <>
            <LucideUserRoundX size={48} className="mx-auto text-red-500" />
            <h1 className="text-2xl">You are not signed in</h1>
            <p className="text-muted-foreground">
              If you tried to sign in, it might have failed. Please try again.
            </p>
            <p>
              <Button onClick={() => signInWithGithub({ popup: false, next: '/session' })}>
                Sign in with GitHub
              </Button>
            </p>
          </>
        )}
      </div>
    </>
  )
}

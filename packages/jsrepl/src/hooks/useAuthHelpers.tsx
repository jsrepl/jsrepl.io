import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'

export function useAuthHelpers() {
  const supabase = useSupabaseClient()

  async function signInWithGithub({
    popup = false,
    next,
  }: { popup?: boolean; next?: string } = {}) {
    if (popup) {
      next = '/session'
    }

    let redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`
    if (next) {
      redirectTo += `?next=${encodeURIComponent(next)}`
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo, skipBrowserRedirect: popup },
    })

    if (error) {
      toast.error('Failed to sign in with GitHub', {
        description: error.message,
      })
      return
    }

    if (popup) {
      const win = window.open(data.url, '_blank')
      if (!win) {
        toastPopupBlocked(data.url)
        return
      }

      win.focus()
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Failed to sign out', {
        description: error.message,
      })
    }
  }

  return { signInWithGithub, signOut }
}

function toastPopupBlocked(url: string) {
  toast.error('Sign in window blocked by browser', {
    description: (
      <>
        <p>
          Please{' '}
          <Button asChild variant="link">
            <Link href={url} target="_blank">
              try again
            </Link>
          </Button>
          .
        </p>
        <p>
          If the issue persists, ensure pop-ups are allowed for this site in the browser settings.
        </p>
      </>
    ),
  })
}

import { Button } from '@/components/ui/button'
import { useAuthHelpers } from '@/hooks/useAuthHelpers'
import { useSupabaseClient } from '@/hooks/useSupabaseClient'
import { useUser } from '@/hooks/useUser'

export function CurrentUserInfo() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const { signInWithGithub, signOut } = useAuthHelpers()

  async function signInWithEmailPassword() {
    const email = prompt('Enter email')
    if (!email) return

    const password = prompt('Enter password')
    if (!password) return

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(`Failed to sign in with email/password: ${error.message}`)
      console.error(error)
    }
  }

  async function signUpWithEmailPassword() {
    const email = prompt('Enter email')
    if (!email) return

    const password = prompt('Enter password')
    if (!password) return

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(`Failed to sign up with email/password: ${error.message}`)
      console.error(error)
    }
  }

  return (
    <div>
      <div className="space-x-2">
        <Button variant="secondary" onClick={() => signInWithGithub({ popup: true })}>
          Sign in with GitHub
        </Button>
        <Button variant="secondary" onClick={() => signOut()}>
          Sign out
        </Button>
        <span>|</span>
        <Button variant="secondary" onClick={() => signUpWithEmailPassword()}>
          Sign up with email/password
        </Button>
        <Button variant="secondary" onClick={() => signInWithEmailPassword()}>
          Sign in with email/password
        </Button>
      </div>
      <hr className="my-4" />
      <p>Current user:</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}

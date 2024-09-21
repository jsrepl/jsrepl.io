<template>
  <code class="flex flex-col items-start">
    <span>User id: {{ user?.id }}</span>
    <span>email: {{ user?.email }}</span>
  </code>

  <dl>
    <dt><code>logout</code></dt>
    <dd>
      <Button @click="logout">Log Out</Button>
    </dd>

    <dt><code>sign in with github</code></dt>
    <dd>
      <Button @click="signInWithGithub">Sign In</Button>
    </dd>

    <dt><code>sign in with email</code></dt>
    <dd class="flex flex-col items-start gap-2">
      <input v-model="email" type="email" class="w-full border" />
      <input v-model="password" type="password" class="w-full border" />
      <Button @click="signInWithEmail(email, password)">Sign In</Button>
    </dd>

    <dt><code>sign up with email</code></dt>
    <dd class="flex flex-col items-start gap-2">
      <input v-model="email" type="email" class="w-full border" />
      <input v-model="password" type="password" class="w-full border" />
      <Button @click="signUpWithEmail(email, password)">Sign Up</Button>
    </dd>

    <dt><code>sign in with otp</code></dt>
    <dd class="flex flex-col items-start gap-2">
      <input v-model="email" type="email" class="w-full border" />
      <Button @click="signInWithOtp(email)">Sign In</Button>
    </dd>

    <dt><code>sign up anonymously</code></dt>
    <dd>
      <Button @click="signUpAnonymously">Sign Up</Button>
    </dd>
  </dl>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')

async function signInWithGithub() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: location.origin + '/confirm/?next=/storybook',
    },
  })

  if (error) console.log(error)
}

async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) console.log(error)
}

async function signUpWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: location.origin + '/confirm/?next=/storybook',
    },
  })

  if (error) console.log(error)
}

async function signInWithOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: location.origin + '/confirm/?next=/storybook',
    },
  })

  if (error) console.log(error)
}

async function signUpAnonymously() {
  const { error } = await supabase.auth.signInAnonymously()

  if (error) console.log(error)
}

async function logout() {
  await supabase.auth.signOut()
}
</script>

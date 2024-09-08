<template>
  <Button @click="signIn">Sign In with {{ providerTitle }}</Button>
</template>

<script setup lang="ts">
import { type Provider } from '@supabase/supabase-js'

const props = defineProps<{ provider: Provider }>()

const supabase = useSupabaseClient()

const providerTitle = computed(() => {
  switch (props.provider) {
    case 'github':
      return 'GitHub'
    case 'gitlab':
      return 'GitLab'
    default:
      return props.provider.charAt(0).toUpperCase() + props.provider.slice(1)
  }
})

async function signIn() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: props.provider,
    options: {
      redirectTo: location.origin + '/confirm/',
    },
  })

  if (error) console.log(error)
}
</script>

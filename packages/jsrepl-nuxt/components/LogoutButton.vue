<template>
  <Button @click="signOut">Sign Out</Button>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()

async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) console.log(error)
}
</script>

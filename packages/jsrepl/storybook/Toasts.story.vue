<template>
  <dl>
    <dt><code>demo</code></dt>
    <dd>
      <Button
        @click="
          () => {
            toast({
              title: 'Scheduled: Catch up',
              description: 'Friday, February 10, 2023 at 5:57 PM',
            })
          }
        "
      >
        Add to calendar
      </Button>
    </dd>

    <dt><code>destructive</code></dt>
    <dd>
      <Button
        variant="destructive"
        @click="
          () => {
            toast({
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem with your request.',
              variant: 'destructive',
              action: h(
                ToastAction,
                {
                  altText: 'Try again',
                },
                {
                  default: () => 'Try again',
                }
              ),
            })
          }
        "
      >
        Show Toast
      </Button>
    </dd>
  </dl>
</template>

<script setup lang="ts">
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()
</script>

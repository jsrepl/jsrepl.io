import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/toast/use-toast'
import type { UserStoredState } from '~/types/repl.types'

export function useNewVersionToast(userStoredState: Ref<UserStoredState>) {
  const { toast } = useToast()
  const runtimeConfig = useRuntimeConfig()

  onMounted(() => {
    const userVersion = userStoredState.value.version
    if (
      userVersion /* skip on first launch */ &&
      runtimeConfig.public.appVersion &&
      userVersion !== runtimeConfig.public.appVersion &&
      /^[0-9a-zA-Z.-]+$/.test(userVersion)
    ) {
      setTimeout(async () => {
        const versionData = await useFetch('/api/new-version', {
          query: { a: userVersion, b: runtimeConfig.public.appVersion },
        })

        if (versionData.data.value?.hnc) {
          showToast()
        }
      }, 3000)
    }

    if (userStoredState.value.version !== runtimeConfig.public.appVersion) {
      userStoredState.value.version = runtimeConfig.public.appVersion
    }
  })

  function showToast() {
    const { dismiss } = toast({
      title: `Updated to version ${runtimeConfig.public.appVersion}`,
      description: h('div', { class: 'flex flex-col gap-1' }, [
        h('p', {}, [
          h(
            'a',
            {
              href: `/releases#${runtimeConfig.public.appVersion}`,
              target: '_blank',
              class: 'text-sm underline underline-offset-4 hover:text-primary',
              onClick: () => {
                dismiss()
              },
            },
            'View the Release Notes'
          ),
        ]),
      ]),
      action: h(
        ToastAction,
        {
          altText: 'Close notification',
        },
        {
          default: () => 'Close',
        }
      ),
      duration: Infinity,
    })
  }
}

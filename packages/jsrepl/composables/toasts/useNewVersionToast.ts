import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/toast/use-toast'
import type { UserStoredState } from '~/types/repl.types'
import { parseVersion } from '~/utils/semver'

export function useNewVersionToast(userStoredState: Ref<UserStoredState>) {
  const { toast } = useToast()
  const runtimeConfig = useRuntimeConfig()

  onMounted(() => {
    const userVersion = userStoredState.value.version
    const appVersion = runtimeConfig.public.appVersion

    // Skip on first launch (userVersion is undefined).
    // Skip patch version updates (bug fixes only).
    if (userVersion && isMajorOrMinorUpdated(userVersion, appVersion)) {
      setTimeout(async () => {
        showToast(appVersion)
      }, 3000)
    }

    if (userStoredState.value.version !== runtimeConfig.public.appVersion) {
      userStoredState.value.version = runtimeConfig.public.appVersion
    }
  })

  function isMajorOrMinorUpdated(userVersion: string, appVersion: string) {
    if (userVersion === appVersion) {
      return false
    }

    const userVersionData = parseVersion(userVersion)
    if (!userVersionData) {
      return false
    }

    const appVersionData = parseVersion(runtimeConfig.public.appVersion)
    if (!appVersionData) {
      return false
    }

    return (
      appVersionData.major > userVersionData.major ||
      (appVersionData.major === userVersionData.major &&
        appVersionData.minor > userVersionData.minor)
    )
  }

  function showToast(appVersion: string) {
    const { dismiss } = toast({
      title: `Updated to version ${appVersion}`,
      description: h('div', { class: 'flex flex-col gap-1' }, [
        h('p', {}, [
          h(
            'a',
            {
              href: `https://github.com/jsrepl/jsrepl.io/releases/tag/${appVersion}`,
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

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast/use-toast'
import { useLocalStorage } from '@vueuse/core'

export function useEarlyAccessToast() {
  const { toast } = useToast()
  const toastEarlyAccessDismissed = useLocalStorage('toast-early-access-dismissed', false)

  onMounted(() => {
    !toastEarlyAccessDismissed.value && setTimeout(() => showToast(), 3000)
  })

  function showToast() {
    const { dismiss } = toast({
      title: 'Early access',
      description: h('div', { class: 'flex flex-col gap-1' }, [
        h('div', {}, [
          h(
            'span',
            {},
            'JSREPL is in early access. Some features might be unstable. It would be great if you could try it out and '
          ),
          h(
            'a',
            {
              href: 'https://github.com/jsrepl/jsrepl.io/issues',
              target: '_blank',
              class: 'underline',
            },
            'report any issues'
          ),
          h('span', {}, ' you encounter.'),
        ]),
        h(
          Button,
          {
            size: 'xs',
            class: 'self-start min-w-[3rem] mt-2',
            onClick: () => {
              dismiss()
              toastEarlyAccessDismissed.value = true
            },
          },
          {
            default: () => 'OK',
          }
        ),
      ]),
      duration: Infinity,
    })
  }
}

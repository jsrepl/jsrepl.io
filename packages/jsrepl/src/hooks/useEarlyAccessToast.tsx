import React, { useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function useEarlyAccessToast() {
  useEffect(() => {
    if (localStorage.getItem('toast-early-access-dismissed') === '1') {
      return
    }

    let toastId: string | number | undefined

    const onDismiss = () => {
      localStorage.setItem('toast-early-access-dismissed', '1')
    }

    const onOK = () => {
      onDismiss()
      toast.dismiss(toastId)
    }

    const timeoutId = setTimeout(() => {
      toastId = toast('Early access', {
        description: (
          <div>
            JSREPL is in early access. Some features might be unstable. It would be great if you
            could try it out and{' '}
            <a
              href="https://github.com/jsrepl/jsrepl.io/issues"
              target="_blank"
              className="underline"
            >
              report any issues
            </a>{' '}
            you encounter.
          </div>
        ),
        action: <Button onClick={onOK}>OK</Button>,
        onDismiss,
        duration: Infinity,
      })
    }, 30000)

    return () => {
      clearTimeout(timeoutId)
      if (toastId) {
        toast.dismiss(toastId)
      }
    }
  }, [])
}

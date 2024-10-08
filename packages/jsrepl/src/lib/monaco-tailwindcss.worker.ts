import type { TailwindConfig } from '@nag5000/monaco-tailwindcss'
import { initialize } from '@nag5000/monaco-tailwindcss/tailwindcss.worker'

initialize({
  async prepareTailwindConfig(tailwindConfig?: TailwindConfig | string) {
    if (typeof tailwindConfig === 'string') {
      const blob = new Blob([tailwindConfig], { type: 'application/javascript' })
      const url = URL.createObjectURL(blob)
      try {
        const m = await import(/* webpackIgnore: true */ url)
        return m.default
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    return tailwindConfig ?? {}
  },
})

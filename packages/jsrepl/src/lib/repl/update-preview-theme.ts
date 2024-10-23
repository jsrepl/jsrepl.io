import { Theme } from '@/types'

const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL!

export async function updatePreviewTheme(previewIframe: HTMLIFrameElement, theme: Theme) {
  previewIframe.contentWindow!.postMessage(
    {
      source: 'jsrepl',
      type: 'update-theme',
      theme: {
        id: theme.id,
        isDark: theme.isDark,
      },
    },
    previewUrl
  )
}

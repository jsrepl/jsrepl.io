'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
// Docs: https://sonner.emilkowal.ski/
import { Toaster as Sonner } from 'sonner'
import { Themes } from '@/lib/themes'

type ToasterProps = React.ComponentProps<typeof Sonner>

// Override default width of 356px.
const DEFAULT_WIDTH = '460px'

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme: themeId } = useTheme()
  const idDark = useMemo(() => Themes.find((theme) => theme.id === themeId)?.isDark, [themeId])

  return (
    <Sonner
      theme={idDark ? 'dark' : 'light'}
      position="top-center"
      richColors
      closeButton
      className="toaster group mt-4"
      style={
        {
          '--width': DEFAULT_WIDTH,
          '--toast-close-button-end': '0px',
          '--toast-close-button-start': 'unset',
          '--toast-close-button-transform': 'translate(0, 0)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-lg [--border-radius:4px]',
          default: 'group-[.toaster]:border-border',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            '!bg-secondary !text-secondary-foreground !border-solid !border-1 !border-border hover:!bg-background hover:!border-border',
          cancelButton:
            '!bg-secondary !text-secondary-foreground !border-solid !border-1 !border-border hover:!bg-background hover:!border-border',
          closeButton:
            'w-6 h-6 !static ml-4 order-last !bg-transparent !border-transparent hover:!bg-background hover:!border-border rounded-sm [&>svg]:w-4 [&>svg]:h-4',
          content: 'min-w-0 flex-1',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

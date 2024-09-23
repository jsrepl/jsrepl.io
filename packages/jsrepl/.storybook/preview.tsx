import React from 'react'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import type { Preview, ReactRenderer } from '@storybook/react'
import '../src/app/globals.css'
import { Themes } from '../src/lib/themes'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  decorators: [
    withThemeByDataAttribute<ReactRenderer>({
      themes: Themes.reduce(
        (acc, theme) => {
          acc[theme.id] = theme.id
          return acc
        },
        {} as Record<string, string>
      ),
      defaultTheme: Themes[0].id,
      attributeName: 'data-theme',
    }),
  ],
}

export default preview

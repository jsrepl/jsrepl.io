import React from 'react'
import { ThemeProvider } from 'next-themes'
import type { Preview } from '@storybook/react'
import '../src/app/globals.css'
import { Themes, defaultThemeId } from '../src/lib/themes'
import ThemeSelector from '../src/stories/ThemeSelector'

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
    (Story) => (
      <div className="bg-background text-foreground p-9">
        <ThemeProvider
          storageKey="theme"
          enableSystem={false}
          themes={Themes.map((theme) => theme.id)}
          defaultTheme={defaultThemeId}
          enableColorScheme
          disableTransitionOnChange
          attribute="data-theme"
        >
          <ThemeSelector />
          <Story />
        </ThemeProvider>
      </div>
    ),
  ],
}

export default preview

import type { Preview } from '@storybook/react'
import React from 'react'
import { allFonts } from '../src/app/fonts'
import '../src/app/globals.css'

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
      <div className={`${allFonts.map((font) => font.variable).join(' ')} antialiased`}>
        <Story />
      </div>
    ),
  ],
}

export default preview

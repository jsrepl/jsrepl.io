import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { Button } from '../components/ui/button'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },

  render: ({ ...args }) => <Button {...args}>Button</Button>,
} satisfies Meta<typeof Button>

export default meta

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: ({ ...args }) => (
    <div className="space-x-4 space-y-2">
      <Button {...args}>default</Button>
      <Button {...args} variant="secondary">
        secondary
      </Button>
      <Button {...args} variant="ghost">
        ghost
      </Button>
      <Button {...args} variant="ghost-primary">
        ghost-primary
      </Button>
      <Button {...args} variant="link">
        link
      </Button>
      <Button {...args} variant="destructive">
        destructive
      </Button>
      <Button {...args} variant="none">
        none
      </Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: ({ ...args }) => (
    <div className="space-x-4 space-y-2">
      <Button {...args}>default</Button>
      <Button {...args} size="xs">
        xs
      </Button>
      <Button {...args} size="sm">
        sm
      </Button>
      <Button {...args} size="lg">
        lg
      </Button>
      <Button {...args} size="icon">
        icon
      </Button>
      <Button {...args} size="icon-sm">
        icon-sm
      </Button>
      <Button {...args} size="icon-xs">
        icon-xs
      </Button>
      <Button {...args} size="icon-lg">
        icon-lg
      </Button>
      <Button {...args} size="none">
        none
      </Button>
    </div>
  ),
}

export const AsLink: Story = {
  args: {
    asChild: true,
  },
  render: ({ ...args }) => (
    <Button asChild {...args}>
      <a href="https://example.com" target="_blank">
        Link to https://example.com
      </a>
    </Button>
  ),
}

export const None: Story = {
  args: {
    variant: 'none',
    size: 'none',
  },
}

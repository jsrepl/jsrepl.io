'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'
import { VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const checkboxVariants = cva(
  [
    'focus-visible:ring-ring',
    'peer',
    'shrink-0',
    'border',
    'shadow-sm',
    'focus-visible:outline-none',
    'focus-visible:ring-1',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-primary',
          'data-[state=checked]:bg-primary',
          'data-[state=checked]:text-primary-foreground',
        ],
        secondary: ['border-muted', 'bg-input', 'data-[state=checked]:text-secondary-foreground'],
      },
      size: {
        default: ['h-[1.125rem]', 'w-[1.125rem]', 'rounded-sm'],
        sm: ['h-4', 'w-4', 'rounded'],
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> &
    VariantProps<typeof checkboxVariants>
>(({ className, variant, size, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ variant, size, className }))}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex h-full w-full items-center justify-center text-current')}
    >
      <CheckIcon width="100%" height="100%" className="scale-105" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

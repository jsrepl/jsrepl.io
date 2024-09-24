import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'whitespace-nowrap',
    'text-sm',
    'leading-tight',
    'font-medium',
    'transition-colors',
    'ring-offset-background',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'disabled:pointer-events-none',
    'disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: ['bg-primary', 'text-primary-foreground', 'shadow', 'hover:bg-primary/90'],
        secondary: [
          'border',
          'bg-secondary',
          'text-secondary-foreground',
          'shadow-sm',
          'hover:bg-accent',
          'hover:text-accent-foreground',
        ],
        ghost: ['hover:bg-accent', 'hover:text-accent-foreground'],
        'ghost-primary': [
          'hover:bg-accent',
          'hover:text-accent-foreground',
          'text-primary',
          'hover:text-primary',
        ],
        link: ['text-primary', 'underline-offset-4', 'hover:underline'],
        destructive: [
          'bg-destructive',
          'text-destructive-foreground',
          'shadow-sm',
          'hover:bg-destructive/90',
          'focus-visible:ring-destructive',
        ],
        none: '',
      },
      size: {
        default: 'h-9 px-4 py-2 rounded-md',
        xs: 'h-7 rounded px-2 text-xs',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9 rounded-md',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-xs': 'h-7 w-7 rounded',
        'icon-lg': 'h-10 w-10 rounded-md',
        none: 'rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

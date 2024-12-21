import * as React from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  [
    'border-muted',
    'text-foreground',
    'placeholder:text-muted-foreground',
    'focus-visible:ring-ring',
    'border',
    'bg-input',
    'shadow-sm',
    'transition-colors',
    'file:border-0',
    'file:bg-transparent',
    'file:text-sm',
    'file:font-medium',
    'focus-visible:outline-none',
    'focus-visible:ring-1',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'invalid:ring-destructive',
    'invalid:focus-visible:ring-destructive',
    'invalid:ring-1',
    'invalid:focus-visible:ring-2',
  ],
  {
    variants: {
      variant: {
        default: [],
      },
      variantSize: {
        default: ['h-9', 'px-3', 'py-1', 'rounded-md', 'text-base'],
        sm: ['h-7', 'px-1.5', 'py-0.5', 'rounded', 'text-sm'],
      },
    },
    defaultVariants: {
      variant: 'default',
      variantSize: 'default',
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, variantSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, variantSize, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input, inputVariants }

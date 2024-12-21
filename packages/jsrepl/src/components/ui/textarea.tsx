import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textareaVariants = cva([
  [
    'border-muted',
    'text-foreground',
    'placeholder:text-muted-foreground',
    'focus-visible:ring-ring',
    'border',
    'bg-input',
    'flex',
    'min-h-[60px]',
    'w-full',
    'rounded-md',
    'px-3',
    'py-2',
    'text-base',
    'shadow-sm',
    'focus-visible:outline-none',
    'focus-visible:ring-1',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'invalid:ring-destructive',
    'invalid:focus-visible:ring-destructive',
    'invalid:ring-1',
    'invalid:focus-visible:ring-2',
  ],
])

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return <textarea className={cn(textareaVariants({ className }))} ref={ref} {...props} />
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }

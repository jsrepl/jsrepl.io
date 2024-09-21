import { type VariantProps, cva } from 'class-variance-authority'

export { default as Select } from './Select.vue'

export const selectVariants = cva(
  [
    'whitespace-nowrap',
    'transition-colors',
    'ring-offset-background',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'appearance-none',
    'leading-tight',
    '[background-repeat:no-repeat]',
    '[background-position:right_var(--select-icon-offset)_center]',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-secondary',
          'text-secondary-foreground',
          'hover:bg-accent',
          'hover:text-accent-foreground',
          '[background-image:var(--select-icon)]',
          '[background-size:1rem]',
          'placeholder:text-muted-foreground',
          'border',
        ],
        none: '',
      },
      size: {
        default: [
          'h-9',
          'pl-3',
          'pr-10',
          'py-2',
          '[--select-icon-offset:0.65rem]',
          'rounded-md',
          'text-sm',
          'shadow-sm',
        ],
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type SelectVariants = VariantProps<typeof selectVariants>

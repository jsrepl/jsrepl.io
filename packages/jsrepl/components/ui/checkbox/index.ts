import { type VariantProps, cva } from 'class-variance-authority'

export { default as Checkbox } from './Checkbox.vue'

export const checkboxVariants = cva(
  [
    'shrink-0',
    'rounded-sm',
    'border',
    'border-input',
    'checked:border-primary',
    'shadow',
    'ring-offset-background',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
    'checked:bg-primary',
    'hover:checked:bg-primary',
    'appearance-none',
    '[background-repeat:no-repeat]',
    '[background-size:100%]',
    'checked:[background-image:var(--checkbox-icon)]',
    '[background-origin:border-box]',
  ],
  {
    variants: {
      variant: {
        default: 'bg-secondary hover:bg-accent',
      },
      size: {
        default: 'h-[1.125rem] w-[1.125rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type CheckboxVariants = VariantProps<typeof checkboxVariants>

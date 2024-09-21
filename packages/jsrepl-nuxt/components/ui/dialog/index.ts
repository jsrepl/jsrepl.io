import { type VariantProps, cva } from 'class-variance-authority'

export { default as Dialog } from './Dialog.vue'

export const dialogVariants = cva('rounded-md', {
  variants: {
    variant: {
      default: 'bg-background text-foreground shadow p-10',
    },
    size: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export type DialogVariants = VariantProps<typeof dialogVariants>

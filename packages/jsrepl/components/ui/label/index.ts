import { type VariantProps, cva } from 'class-variance-authority'

export { default as Label } from './Label.vue'

export const labelVariants = cva(['text-sm', 'leading-tight', 'inline-flex'], {
  variants: {
    variant: {
      default: '',
    },
    size: {
      default: '',
    },
    col: {
      true: 'flex-col items-start gap-1',
      false: 'items-center gap-2',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    col: false,
  },
})

export type LabelVariants = VariantProps<typeof labelVariants>

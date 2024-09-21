import { type VariantProps, cva } from 'class-variance-authority'

export { default as ButtonLink } from './ButtonLink.vue'

export const buttonLinkVariants = cva([], {
  variants: {},
  defaultVariants: {},
})

export type ButtonLinkVariants = VariantProps<typeof buttonLinkVariants>

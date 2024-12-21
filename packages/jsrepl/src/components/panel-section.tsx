'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronRightIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { buttonVariants } from './ui/button'

// Based on https://ui.shadcn.com/docs/components/accordion
const PanelSections = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  Omit<
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>,
    'type' | 'value' | 'defaultValue' | 'onValueChange'
  > & {
    value?: string[]
    defaultValue?: string[]
    onValueChange?: (value: string[]) => void
  }
>((props, ref) => <AccordionPrimitive.Root ref={ref} type="multiple" {...props} />)
PanelSections.displayName = 'PanelSections'

const PanelSection = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('group/panel-section border-b last:border-b-0', className)}
    {...props}
  />
))
PanelSection.displayName = 'PanelSection'

const PanelSectionHeader = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Header>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>
>(({ className, children }, ref) => (
  <AccordionPrimitive.Header
    ref={ref}
    className={cn('bg-secondary sticky -top-px z-[1] flex', className)}
  >
    {children}
  </AccordionPrimitive.Header>
))
PanelSectionHeader.displayName = 'PanelSectionHeader'

const PanelSectionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Trigger
    ref={ref}
    className={cn(
      'text-muted-foreground flex flex-1 items-center gap-1 pl-1 text-left text-xs font-semibold uppercase leading-7 [&[data-state=open]>svg]:rotate-90',
      className
    )}
    {...props}
  >
    <ChevronRightIcon className="h-4 w-4 shrink-0" />
    <div className="flex-1">{children}</div>
  </AccordionPrimitive.Trigger>
))
PanelSectionTrigger.displayName = 'PanelSectionTrigger'

const PanelSectionHeaderActions = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => (
  <div
    className={cn(
      'invisible flex items-center pr-0.5 group-hover/panel-section:visible has-[[aria-expanded=true]]/panel-section:visible',
      className
    )}
  >
    {children}
  </div>
)

const PanelSectionHeaderAction = ({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
      'text-muted-foreground h-6 w-6',
      className
    )}
    type="button"
    {...props}
  >
    {children}
  </button>
)

const PanelSectionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
    {...props}
  >
    <div className={cn('pb-4', className)}>{children}</div>
  </AccordionPrimitive.Content>
))
PanelSectionContent.displayName = 'PanelSectionContent'

export {
  PanelSections,
  PanelSection,
  PanelSectionHeader,
  PanelSectionTrigger,
  PanelSectionHeaderActions,
  PanelSectionHeaderAction,
  PanelSectionContent,
}

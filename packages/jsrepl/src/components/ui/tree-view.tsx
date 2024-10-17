'use client'

// Based on https://github.com/MrLightful/shadcn-tree-view
import React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const treeVariants = cva(
  'group hover:before:opacity-100 before:absolute before:rounded-lg before:left-0 px-2 before:w-full before:opacity-0 before:bg-accent/70 before:h-[2rem] before:-z-10'
)

const selectedTreeVariants = cva('before:opacity-100 before:bg-accent/70 text-accent-foreground')

interface TreeDataItem {
  id: string
  name: string
  textClassName?: string
  customText?: React.ReactNode
  title?: string
  icon?: React.ElementType
  selectedIcon?: React.ElementType
  openIcon?: React.ElementType
  children?: TreeDataItem[]
  actions?: React.ReactNode
  onClick?: () => void
}

type TreeProps = React.HTMLAttributes<HTMLDivElement> & {
  data: TreeDataItem[] | TreeDataItem
  // TODO: allow uncontrolled mode
  selectedItemId: string | null
  onSelectChange: (item: TreeDataItem | undefined) => void
  // TODO: allow uncontrolled mode
  expandedItemIds: string[]
  onExpandChange: (item: TreeDataItem, expanded: boolean) => void
  defaultNodeIcon?: React.ElementType
  defaultLeafIcon?: React.ElementType
}

const TreeView = React.forwardRef<HTMLDivElement, TreeProps>(function TreeView(
  {
    data,
    selectedItemId,
    onSelectChange,
    expandedItemIds,
    onExpandChange,
    defaultLeafIcon,
    defaultNodeIcon,
    className,
    ...props
  },
  ref
) {
  const handleSelectChange = React.useCallback(
    (item: TreeDataItem | undefined) => {
      if (onSelectChange) {
        onSelectChange(item)
      }
    },
    [onSelectChange]
  )

  const handleExpandChange = React.useCallback(
    (item: TreeDataItem, expanded: boolean) => {
      if (onExpandChange) {
        onExpandChange(item, expanded)
      }
    },
    [onExpandChange]
  )

  return (
    <div className={cn('relative overflow-hidden p-2', className)}>
      <TreeItem
        data={data}
        ref={ref}
        selectedItemId={selectedItemId}
        handleSelectChange={handleSelectChange}
        expandedItemIds={expandedItemIds}
        handleExpandChange={handleExpandChange}
        defaultLeafIcon={defaultLeafIcon}
        defaultNodeIcon={defaultNodeIcon}
        {...props}
      />
    </div>
  )
})

type TreeItemProps = React.HTMLAttributes<HTMLDivElement> & {
  data: TreeDataItem[] | TreeDataItem
  selectedItemId: string | null
  handleSelectChange: (item: TreeDataItem | undefined) => void
  expandedItemIds: string[]
  handleExpandChange: (item: TreeDataItem, expanded: boolean) => void
  defaultNodeIcon?: React.ElementType
  defaultLeafIcon?: React.ElementType
}

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(function TreeItem(
  {
    className,
    data,
    selectedItemId,
    handleSelectChange,
    expandedItemIds,
    handleExpandChange,
    defaultNodeIcon,
    defaultLeafIcon,
    ...props
  },
  ref
) {
  if (!(data instanceof Array)) {
    data = [data]
  }
  return (
    <div ref={ref} role="tree" className={className} {...props}>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            {item.children ? (
              <TreeNode
                item={item}
                selectedItemId={selectedItemId}
                expandedItemIds={expandedItemIds}
                handleExpandChange={handleExpandChange}
                handleSelectChange={handleSelectChange}
                defaultNodeIcon={defaultNodeIcon}
                defaultLeafIcon={defaultLeafIcon}
              />
            ) : (
              <TreeLeaf
                item={item}
                selectedItemId={selectedItemId}
                handleSelectChange={handleSelectChange}
                defaultLeafIcon={defaultLeafIcon}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
})

const TreeNode = ({
  item,
  handleSelectChange,
  expandedItemIds,
  handleExpandChange,
  selectedItemId,
  defaultNodeIcon,
  defaultLeafIcon,
}: {
  item: TreeDataItem
  handleSelectChange: (item: TreeDataItem | undefined) => void
  expandedItemIds: string[]
  handleExpandChange: (item: TreeDataItem, expanded: boolean) => void
  selectedItemId: string | null
  defaultNodeIcon?: React.ElementType
  defaultLeafIcon?: React.ElementType
}) => {
  const value = React.useMemo(
    () => (expandedItemIds.includes(item.id) ? [item.id] : []),
    [expandedItemIds, item.id]
  )

  return (
    <AccordionPrimitive.Root
      type="multiple"
      value={value}
      onValueChange={(s) => handleExpandChange(item, s.includes(item.id))}
    >
      <AccordionPrimitive.Item value={item.id}>
        <AccordionTrigger
          className={cn(treeVariants(), selectedItemId === item.id && selectedTreeVariants())}
          onClick={() => {
            handleSelectChange(item)
            item.onClick?.()
          }}
          title={item.title}
          data-active={selectedItemId === item.id}
        >
          <TreeIcon
            item={item}
            isSelected={selectedItemId === item.id}
            isOpen={value.includes(item.id)}
            default={defaultNodeIcon}
          />
          {item.customText ? (
            item.customText
          ) : (
            <>
              <span className={cn('flex-grow truncate text-start text-sm', item.textClassName)}>
                {item.name}
              </span>
              <TreeActions isSelected={selectedItemId === item.id}>{item.actions}</TreeActions>
            </>
          )}
        </AccordionTrigger>
        <AccordionContent className="ml-3.5 border-l pl-1">
          <TreeItem
            data={item.children ? item.children : item}
            selectedItemId={selectedItemId}
            handleSelectChange={handleSelectChange}
            expandedItemIds={expandedItemIds}
            handleExpandChange={handleExpandChange}
            defaultLeafIcon={defaultLeafIcon}
            defaultNodeIcon={defaultNodeIcon}
          />
        </AccordionContent>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  )
}

const TreeLeaf = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    item: TreeDataItem
    selectedItemId: string | null
    handleSelectChange: (item: TreeDataItem | undefined) => void
    defaultLeafIcon?: React.ElementType
  }
>(function TreeLeaf(
  { className, item, selectedItemId, handleSelectChange, defaultLeafIcon, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex cursor-pointer items-center py-2 text-left before:right-1',
        treeVariants(),
        className,
        selectedItemId === item.id && selectedTreeVariants()
      )}
      onClick={() => {
        handleSelectChange(item)
        item.onClick?.()
      }}
      title={item.title}
      data-active={selectedItemId === item.id}
      {...props}
    >
      <TreeIcon item={item} isSelected={selectedItemId === item.id} default={defaultLeafIcon} />
      {item.customText ? (
        item.customText
      ) : (
        <>
          <span className={cn('flex-grow truncate text-sm', item.textClassName)}>{item.name}</span>
          <TreeActions isSelected={selectedItemId === item.id}>{item.actions}</TreeActions>
        </>
      )}
    </div>
  )
})

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn('flex w-full flex-1 items-center py-2 transition-all', className)}
      {...props}
    >
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all',
      className
    )}
    {...props}
  >
    <div className="pb-1 pt-0 has-[>[role='tree']>ul:empty]:pb-[0.1px]">{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

const TreeIcon = ({
  item,
  isOpen,
  isSelected,
  default: defaultIcon,
}: {
  item: TreeDataItem
  isOpen?: boolean
  isSelected?: boolean
  default?: React.ElementType
}) => {
  let Icon = defaultIcon
  if (isSelected && item.selectedIcon) {
    Icon = item.selectedIcon
  } else if (isOpen && item.openIcon) {
    Icon = item.openIcon
  } else if (item.icon) {
    Icon = item.icon
  }
  return Icon ? <Icon className="mr-2 h-4 w-4 shrink-0" /> : <></>
}

const TreeActions = ({
  children,
  isSelected,
}: {
  children: React.ReactNode
  isSelected: boolean
}) => {
  return (
    <div
      className={cn(
        isSelected ? 'visible' : 'invisible absolute right-2',
        '-my-8 group-focus-within:visible group-focus-within:static group-hover:visible group-hover:static has-[[aria-expanded="true"]]:visible has-[[aria-expanded="true"]]:static'
      )}
    >
      {children}
    </div>
  )
}

export { TreeView, type TreeDataItem }

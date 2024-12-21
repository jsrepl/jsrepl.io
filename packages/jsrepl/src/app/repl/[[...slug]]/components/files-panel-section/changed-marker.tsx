import { TreeDataItem } from '@/components/ui/tree-view'
import { useReplFSChanges } from '@/hooks/useReplFSChanges'
import { cn } from '@/lib/utils'

export default function ChangedMarker({ item }: { item: TreeDataItem }) {
  const { changes: replFSChanges } = useReplFSChanges()
  const change = replFSChanges.get(item.id)

  let changeType = change?.type
  if (!changeType && item.id === '__new__') {
    changeType = 'created'
  }

  return (
    <svg
      width={8}
      height={8}
      viewBox="0 0 10 10"
      className={cn(
        'mr-2 shrink-0',
        !changeType && 'opacity-0',
        changeType === 'created' && 'fill-green-500 dark:fill-green-600',
        changeType === 'updated' && 'fill-blue-500 dark:fill-blue-600'
      )}
    >
      <circle cx="5" cy="5" r="5" />
    </svg>
  )
}

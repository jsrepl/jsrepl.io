import { useMemo } from 'react'
import {
  PanelSection,
  PanelSectionContent,
  PanelSectionHeader,
  PanelSectionTrigger,
} from '@/components/panel-section'
import { UserAvatar } from '@/components/user-avatar'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { formatRelativeTime } from '@/lib/datetime'

export function InfoPanelSection({ id: sectionId }: { id: string }) {
  const [replState] = useReplStoredState()

  const updatedAtRelativeTime = useMemo(() => {
    return replState.updated_at ? formatRelativeTime(new Date(replState.updated_at)) : null
  }, [replState.updated_at])

  const createdAtRelativeTime = useMemo(() => {
    return replState.created_at ? formatRelativeTime(new Date(replState.created_at)) : null
  }, [replState.created_at])

  return (
    <PanelSection value={sectionId}>
      <PanelSectionHeader>
        <PanelSectionTrigger>Info</PanelSectionTrigger>
      </PanelSectionHeader>
      <PanelSectionContent className="text-muted-foreground flex select-text flex-col p-4 pr-2 pt-2 text-xs">
        <h3 className="text-accent-foreground text-[0.8125rem] font-semibold leading-tight">
          {replState.title}
        </h3>
        {replState.description && <p className="mt-2">{replState.description}</p>}
        {replState.user?.user_name && (
          <div className="mt-3 flex items-center gap-2">
            <UserAvatar user={replState.user} size={22} />
            <span className="text-[0.8125rem]">{replState.user.user_name}</span>
          </div>
        )}
        <div className="mt-3 space-y-1">
          {updatedAtRelativeTime && (
            <div title={'Updated at ' + new Date(replState.updated_at).toLocaleString()}>
              Updated {updatedAtRelativeTime}
            </div>
          )}
          {createdAtRelativeTime && (
            <div title={'Created at ' + new Date(replState.created_at).toLocaleString()}>
              Created {createdAtRelativeTime}
            </div>
          )}
        </div>
      </PanelSectionContent>
    </PanelSection>
  )
}

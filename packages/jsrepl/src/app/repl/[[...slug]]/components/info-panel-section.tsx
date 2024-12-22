import { useMemo, useState } from 'react'
import { LucidePencil } from 'lucide-react'
import EditReplInfoDialog from '@/components/edit-repl-info-dialog'
import {
  PanelSection,
  PanelSectionContent,
  PanelSectionHeader,
  PanelSectionHeaderAction,
  PanelSectionHeaderActions,
  PanelSectionTrigger,
} from '@/components/panel-section'
import { UserAvatar } from '@/components/user-avatar'
import { useReplRewindMode } from '@/hooks/useReplRewindMode'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { useUser } from '@/hooks/useUser'
import { formatRelativeTime } from '@/lib/datetime'

export function InfoPanelSection({ id: sectionId }: { id: string }) {
  const [replState] = useReplStoredState()
  const user = useUser()
  const [rewindMode] = useReplRewindMode()
  const [editInfoDialogOpen, setEditInfoDialogOpen] = useState(false)

  const isReadOnly = rewindMode.active
  const isNew = !replState.id
  const showEditButton = isNew || (user && user.id === replState.user_id)

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

        <PanelSectionHeaderActions>
          {showEditButton && (
            <PanelSectionHeaderAction
              disabled={isReadOnly}
              onClick={() => setEditInfoDialogOpen(true)}
            >
              <LucidePencil size={14} />
            </PanelSectionHeaderAction>
          )}
        </PanelSectionHeaderActions>
      </PanelSectionHeader>

      <PanelSectionContent className="text-muted-foreground flex select-text flex-col p-4 pr-2 pt-2 text-xs">
        <h3 className="text-accent-foreground text-[0.8125rem] font-semibold leading-tight">
          {replState.title || 'Untitled REPL'}
        </h3>
        {replState.description && <p className="mt-2">{replState.description}</p>}
        {replState.user?.user_name ? (
          <div className="mt-3 flex items-center gap-2">
            <UserAvatar user={replState.user} size={22} />
            <span className="text-[0.8125rem]">{replState.user.user_name}</span>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <UserAvatar user={null} size={22} />
            <span className="text-[0.8125rem]">Anonymous</span>
          </div>
        )}
        <div className="mt-3 space-y-1 empty:hidden">
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

      <EditReplInfoDialog open={editInfoDialogOpen} onOpenChange={setEditInfoDialogOpen} />
    </PanelSection>
  )
}

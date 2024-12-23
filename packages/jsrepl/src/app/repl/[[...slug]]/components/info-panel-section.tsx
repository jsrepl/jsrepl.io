import { useState } from 'react'
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
import { RelativeTime } from '@/components/relative-time'
import { UserAvatar } from '@/components/user-avatar'
import { useReplRewindMode } from '@/hooks/useReplRewindMode'
import { useReplStoredState } from '@/hooks/useReplStoredState'
import { useUser } from '@/hooks/useUser'

export function InfoPanelSection({ id: sectionId }: { id: string }) {
  const [replState] = useReplStoredState()
  const user = useUser()
  const [rewindMode] = useReplRewindMode()
  const [editInfoDialogOpen, setEditInfoDialogOpen] = useState(false)

  const isReadOnly = rewindMode.active
  const isNew = !replState.id
  const showEditButton = isNew || (user && user.id === replState.user_id)

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
        <h3 className="text-accent-foreground text-[0.8125rem] font-semibold leading-4">
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
          {replState.updated_at && (
            <div>
              Updated <RelativeTime value={replState.updated_at} />
            </div>
          )}
          {replState.created_at && (
            <div>
              Created <RelativeTime value={replState.created_at} />
            </div>
          )}
        </div>
      </PanelSectionContent>

      <EditReplInfoDialog open={editInfoDialogOpen} onOpenChange={setEditInfoDialogOpen} />
    </PanelSection>
  )
}

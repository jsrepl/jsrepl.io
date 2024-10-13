import { useContext } from 'react'
import { ReplStateContext } from '@/context/repl-state-context'
import { UserStateContext } from '@/context/user-state-context'
import { cn } from '@/lib/utils'

export default function GridLayout({ children }: { children: React.ReactNode }) {
  const { userState } = useContext(UserStateContext)!
  const { replState } = useContext(ReplStateContext)!

  return (
    <div
      className={cn(
        'grid h-full grid-rows-1',
        userState.previewPos === 'aside-right' && replState.showPreview && 'grid-cols-[1fr,auto]'
      )}
    >
      {children}
    </div>
  )
}

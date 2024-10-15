import { useCallback, useContext, useMemo } from 'react'
import Resizable from '@/components/resizable'
import { UserStateContext } from '@/context/user-state-context'
import FilesPanel from './files-panel'

export default function LeftSidebar() {
  const { userState, setUserState } = useContext(UserStateContext)!

  const size = useMemo(
    () => ({ width: userState.leftSidebarWidth, height: 0 }),
    [userState.leftSidebarWidth]
  )

  const setSize = useCallback(
    (size: { width: number; height: number }) => {
      setUserState((state) => ({ ...state, leftSidebarWidth: size.width }))
    },
    [setUserState]
  )

  return (
    <>
      {userState.showLeftSidebar && (
        <div className="min-w-0 [grid-area:left-sidebar]">
          <Resizable
            size={size}
            onSizeUpdate={setSize}
            edges={{ right: true }}
            className="!h-full max-w-full border-r pr-2"
          >
            <FilesPanel />
          </Resizable>
        </div>
      )}
    </>
  )
}

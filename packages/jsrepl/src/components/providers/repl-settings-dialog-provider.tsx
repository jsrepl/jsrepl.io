import { ReactNode, createContext, useState } from 'react'
import ReplSettingsDialog from '@/components/repl-settings-dialog'

export type ReplSettingsDialogContextType = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export const ReplSettingsDialogContext = createContext<ReplSettingsDialogContextType | null>(null)

export default function ReplSettingsDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <ReplSettingsDialogContext.Provider value={{ isOpen, setIsOpen }}>
        {children}
      </ReplSettingsDialogContext.Provider>

      <ReplSettingsDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}

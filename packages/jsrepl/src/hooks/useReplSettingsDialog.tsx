import { useContext } from 'react'
import { ReplSettingsDialogContext } from '@/components/providers/repl-settings-dialog-provider'

export default function useReplSettingsDialog() {
  const { isOpen, setIsOpen } = useContext(ReplSettingsDialogContext)!
  return {
    isOpen,
    show: () => setIsOpen(true),
    hide: () => setIsOpen(false),
  }
}

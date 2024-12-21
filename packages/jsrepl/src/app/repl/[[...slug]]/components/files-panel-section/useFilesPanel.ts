import { useContext } from 'react'
import { FilesPanelContext } from './provider'

export function useFilesPanel() {
  const context = useContext(FilesPanelContext)
  if (!context) {
    throw new Error(`useFilesPanel must be used within a FilesPanelProvider.`)
  }
  return context
}

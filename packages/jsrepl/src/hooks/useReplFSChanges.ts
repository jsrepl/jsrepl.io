import { useContext } from 'react'
import { ReplFSChangesContext } from '@/components/providers/repl-fs-changes-provider'

export function useReplFSChanges() {
  const { changes } = useContext(ReplFSChangesContext)!
  return { changes }
}

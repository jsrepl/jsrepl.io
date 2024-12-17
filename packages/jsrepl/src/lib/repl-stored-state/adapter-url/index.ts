import { DebugLog, debugLog } from '@/lib/debug-log'
import * as ReplFS from '@/lib/repl-fs'
import { atou, utoa } from '@/lib/zip'
import type { ReplStoredState } from '@/types'

const SCHEMA_VERSION = '1'

export function load(searchParams: URLSearchParams): ReplStoredState {
  const versionQP = searchParams.get('v')
  const state: ReplStoredState = {
    id: '',
    created_at: '',
    updated_at: '',
    user_id: '',
    user: null,
    title: '',
    description: '',
    activeModel: '',
    openedModels: [],
    showPreview: true,
    fs: ReplFS.emptyFS,
  }

  if (versionQP === SCHEMA_VERSION) {
    loadSchemaV1(searchParams, state)
  }

  debugLog(DebugLog.REPL, 'loaded', state)
  return state
}

export function save(state: ReplStoredState): URLSearchParams {
  const query = toQueryParams(state)
  const searchParams = new URLSearchParams(query)
  return searchParams
}

export function fork(state: ReplStoredState): URLSearchParams {
  return save(state)
}

function loadSchemaV1(searchParams: URLSearchParams, state: ReplStoredState) {
  const fsQP = searchParams.get('f')
  const openedModelsQP = searchParams.get('o')
  const activeModelQP = searchParams.get('a')
  const showPreviewQP = searchParams.get('p')

  if (typeof fsQP === 'string') {
    state.fs = { root: deserialize(fsQP) as ReplFS.Directory }
  }

  if (typeof openedModelsQP === 'string') {
    state.openedModels = deserialize(openedModelsQP) as string[]
  }

  if (typeof activeModelQP === 'string') {
    state.activeModel = activeModelQP
  }

  if (typeof showPreviewQP === 'string') {
    state.showPreview = showPreviewQP === '1'
  }
}

export function toQueryParams(state: ReplStoredState): Record<string, string> {
  const { activeModel, showPreview, fs, openedModels } = state
  return {
    f: serialize(fs.root),
    o: serialize(openedModels),
    a: activeModel,
    p: showPreview ? '1' : '0',
    v: SCHEMA_VERSION,
  }
}

function deserialize(serialized: string): unknown {
  return JSON.parse(atou(decodeURIComponent(serialized)))
}

function serialize(storedState: unknown): string {
  return encodeURIComponent(utoa(JSON.stringify(storedState)))
}

import * as ReplFS from '@/lib/repl-fs'
import type { Database, ReplStoredState } from '@/types'
import { deepEqual } from '../equal'
import { ResponseError } from '../response-error'

const replsEndpoint = `${process.env.NEXT_PUBLIC_SITE_URL}/api/repls`

type UrlProps = {
  openedModels: string[]
  activeModel: string
  showPreview: boolean
}

export async function load(
  id: string,
  searchParams: URLSearchParams,
  {
    signal,
    cache,
    next,
  }: { signal?: AbortSignal; cache?: RequestCache; next?: NextFetchRequestConfig } = {}
): Promise<ReplStoredState> {
  const response = await fetch(`${replsEndpoint}/${id}`, {
    signal,
    cache,
    next,
  })

  if (!response.ok) {
    throw new ResponseError('Error loading repl', response)
  }

  const urlProps = searchParamsToUrlProps(searchParams)
  const state = fromPayload(await response.json(), urlProps)

  if (state.openedModels.length === 0) {
    const defaultFiles = ['/index.js', '/index.ts', '/index.jsx', '/index.tsx', '/index.html']
    for (const file of defaultFiles) {
      if (ReplFS.exists(state.fs, file)) {
        state.openedModels = [file]
        state.activeModel = file
        break
      }
    }
  }

  if (state.openedModels.length === 0) {
    ReplFS.walk(state.fs, '/', (path, entry) => {
      if (entry.kind === ReplFS.Kind.File) {
        state.openedModels.push(path)
        state.activeModel = path
        return false
      }
    })
  }

  if (
    state.openedModels.length > 0 &&
    (state.activeModel === '' || !state.openedModels.includes(state.activeModel))
  ) {
    state.activeModel = state.openedModels[0]!
  }

  return state
}

export async function fork(
  state: ReplStoredState,
  { signal }: { signal: AbortSignal }
): Promise<ReplStoredState> {
  const response = await fetch(replsEndpoint + '/fork', {
    method: 'POST',
    body: JSON.stringify(toPayload(state)),
    signal,
    keepalive: true,
  })

  if (!response.ok) {
    throw new ResponseError('Error forking repl', response)
  }

  const newState = fromPayload(await response.json(), state)
  return newState
}

export async function save(
  state: ReplStoredState,
  { signal }: { signal?: AbortSignal } = {}
): Promise<ReplStoredState> {
  let response: Response
  if (!state.id) {
    response = await fetch(replsEndpoint, {
      method: 'POST',
      body: JSON.stringify(toPayload(state)),
      signal,
      keepalive: true,
    })

    if (!response.ok) {
      throw new ResponseError('Error saving repl', response)
    }

    const newState = fromPayload(await response.json(), state)
    return newState
  } else {
    response = await fetch(`${replsEndpoint}/${state.id}`, {
      method: 'PATCH',
      body: JSON.stringify(toPayload(state)),
      signal,
      keepalive: true,
    })

    if (!response.ok) {
      throw new ResponseError('Error saving repl', response)
    }

    return state
  }
}

export function getPageUrl(state: ReplStoredState) {
  const { id, openedModels, activeModel, showPreview } = state
  if (!id) {
    return new URL('/repl', process.env.NEXT_PUBLIC_SITE_URL)
  }

  const url = new URL(`/repl/${id}`, process.env.NEXT_PUBLIC_SITE_URL)

  openedModels.forEach((path) => {
    const value = `${path === activeModel ? '*' : ''}${path.slice(1)}`
    url.searchParams.append('file', value)
  })

  if (showPreview) {
    url.searchParams.set('preview', '1')
  }

  return url
}

export function checkDirty(state: ReplStoredState, savedState: ReplStoredState) {
  return !deepEqual(toPayload(state), toPayload(savedState))
}

function fromPayload(
  payload: Database['public']['Tables']['repls']['Row'],
  urlProps: UrlProps
): ReplStoredState {
  const fs = payload.fs ?? ReplFS.emptyFS
  const { openedModels, activeModel, showPreview } = urlProps
  return { ...payload, fs, openedModels, activeModel, showPreview }
}

function toPayload(state: ReplStoredState): Database['public']['Tables']['repls']['Update'] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { created_at, updated_at, user_id, openedModels, activeModel, showPreview, ...payload } =
    state
  return payload
}

function searchParamsToUrlProps(searchParams: URLSearchParams): UrlProps {
  const openedModels: string[] = []
  let activeModel = ''
  const showPreview = searchParams.get('preview') === '1'

  searchParams.getAll('file').forEach((value) => {
    if (value.startsWith('*')) {
      value = value.slice(1)
      activeModel = '/' + value
    }

    openedModels.push('/' + value)
  })

  return { openedModels, activeModel, showPreview }
}

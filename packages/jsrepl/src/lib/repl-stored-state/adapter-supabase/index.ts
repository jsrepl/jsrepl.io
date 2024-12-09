import { SupabaseClient } from '@supabase/supabase-js'
import { deepEqual } from '@/lib/equal'
import * as ReplFS from '@/lib/repl-fs'
import { ResponseError } from '@/lib/response-error'
import type { Database, ReplStoredState } from '@/types'
import { createRepl, forkRepl, getRepl, updateRepl } from './api'

type UrlProps = {
  openedModels: string[]
  activeModel: string
  showPreview: boolean
}

export async function load(
  id: string,
  searchParams: URLSearchParams,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
): Promise<ReplStoredState | null> {
  const { data, error, status, statusText } = await getRepl(id, { supabase, signal })

  if (error) {
    throw new ResponseError(`Error loading repl id=${id}`, {
      status,
      statusText,
      cause: error,
    })
  }

  if (!data) {
    return null
  }

  const urlProps = searchParamsToUrlProps(searchParams)
  const state = fromPayload(data, urlProps)

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
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal: AbortSignal }
): Promise<ReplStoredState> {
  const { data, error, status, statusText } = await forkRepl(state, { supabase, signal })

  if (error) {
    throw new ResponseError(`Error forking repl id=${state.id}`, {
      status,
      statusText,
      cause: error,
    })
  }

  const newState = fromPayload(data, state)
  return newState
}

export async function save(
  state: ReplStoredState,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
): Promise<ReplStoredState> {
  if (!state.id) {
    const { data, error, status, statusText } = await createRepl(state, { supabase, signal })

    if (error) {
      throw new ResponseError(`Error saving repl id=${state.id}`, {
        status,
        statusText,
        cause: error,
      })
    }

    const newState = fromPayload(data, state)
    return newState
  } else {
    const { error, status, statusText } = await updateRepl(state, { supabase, signal })

    if (error) {
      throw new ResponseError(`Error saving repl id=${state.id}`, {
        status,
        statusText,
        cause: error,
      })
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
  payload: Database['public']['Tables']['repls']['Row'] | ReplStoredState,
  urlProps: UrlProps
): ReplStoredState {
  const { openedModels, activeModel, showPreview } = urlProps
  return { ...payload, openedModels, activeModel, showPreview }
}

function toPayload(state: ReplStoredState): Database['public']['Tables']['repls']['Update'] {
  return {
    id: state.id,
    fs: state.fs,
  }
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

import { SupabaseClient } from '@supabase/supabase-js'
import * as ReplFS from '@/lib/repl-fs'
import { ResponseError } from '@/lib/response-error'
import type { Database, ReplStoredState } from '@/types'
import {
  createRepl,
  deleteRepl,
  forkRepl,
  getRecentlyViewedRepls,
  getRepl,
  getRepls,
  getUserRepls,
  updateRepl,
} from './api'
import { fromPayload } from './utils'

type ExtraUrlProps = {
  openedModels?: string[]
  activeModel?: string
  showPreview?: boolean
}

export async function loadUserRepls(
  userId: string,
  {
    supabase,
    page,
    pageSize,
    signal,
  }: { supabase: SupabaseClient<Database>; page?: number; pageSize?: number; signal?: AbortSignal }
): Promise<{ data: ReplStoredState[]; hasMore: boolean }> {
  page ??= 1
  pageSize ??= 20

  const { data, error, status, statusText, count } = await getUserRepls(userId, {
    supabase,
    page,
    pageSize,
    signal,
  })

  if (error) {
    throw new ResponseError(`Error loading repls for user id=${userId}`, {
      status,
      statusText,
      cause: error,
    })
  }

  return {
    data: data.map((repl) => reviveState({ state: fromPayload(repl) })),
    hasMore: count !== null && count > page * pageSize,
  }
}

export async function loadRecentlyViewedRepls({
  supabase,
  page,
  pageSize,
  signal,
}: {
  supabase: SupabaseClient<Database>
  page?: number
  pageSize?: number
  signal?: AbortSignal
}): Promise<{ data: Array<ReplStoredState & { viewed_at: string }>; hasMore: boolean }> {
  page ??= 1
  pageSize ??= 20

  const { data, error, status, statusText, count } = await getRecentlyViewedRepls({
    supabase,
    page,
    pageSize,
    signal,
  })

  if (error) {
    throw new ResponseError(`Error loading recently viewed repls`, {
      status,
      statusText,
      cause: error,
    })
  }

  return {
    data: data.map((repl) => ({
      ...reviveState({ state: fromPayload(repl) }),
      viewed_at: repl.viewed_at,
    })),
    hasMore: count !== null && count > page * pageSize,
  }
}

export async function loadByIds(
  ids: string[],
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
): Promise<ReplStoredState[]> {
  if (ids.length === 0) {
    return []
  }

  const { data, error, status, statusText } = await getRepls(ids, { supabase, signal })

  if (error) {
    throw new ResponseError(`Error loading repls by ids=${ids}`, {
      status,
      statusText,
      cause: error,
    })
  }

  return data.map((repl) => reviveState({ state: fromPayload(repl) }))
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

  const state = reviveState({ state: fromPayload(data), searchParams })
  return state
}

export async function fork(
  state: ReplStoredState,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
): Promise<ReplStoredState> {
  if (!state.title.endsWith(' (forked)')) {
    state = {
      ...state,
      title: state.title + ' (forked)',
    }
  }

  const { data, error, status, statusText } = await forkRepl(state, { supabase, signal })

  if (error) {
    throw new ResponseError(`Error forking repl id=${state.id}`, {
      status,
      statusText,
      cause: error,
    })
  }

  const newState = fromPayload(data)
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

    const newState = fromPayload(data)
    return newState
  } else {
    const { data, error, status, statusText } = await updateRepl(state, { supabase, signal })

    if (error) {
      throw new ResponseError(`Error saving repl id=${state.id}`, {
        status,
        statusText,
        cause: error,
      })
    }

    const newState = fromPayload(data)
    return newState
  }
}

export async function remove(
  id: string,
  { supabase, signal }: { supabase: SupabaseClient<Database>; signal?: AbortSignal }
) {
  const { error, status, statusText } = await deleteRepl(id, { supabase, signal })

  if (error) {
    throw new ResponseError(`Error deleting repl id=${id}`, {
      status,
      statusText,
      cause: error,
    })
  }
}

export function getPageUrl(state: ReplStoredState, extraUrlProps?: ExtraUrlProps | true) {
  const { id } = state
  if (!id) {
    return new URL('/repl', process.env.NEXT_PUBLIC_SITE_URL)
  }

  const url = new URL(`/repl/${id}`, process.env.NEXT_PUBLIC_SITE_URL)

  if (extraUrlProps === true) {
    extraUrlProps = {
      openedModels: state.openedModels,
      activeModel: state.activeModel,
      showPreview: state.showPreview,
    }
  }

  extraUrlProps?.openedModels?.forEach((path) => {
    const value = `${path === extraUrlProps?.activeModel ? '*' : ''}${path.slice(1)}`
    url.searchParams.append('file', value)
  })

  if (extraUrlProps?.showPreview) {
    url.searchParams.set('preview', '1')
  }

  return url
}

function searchParamsToExtraUrlProps(searchParams: URLSearchParams): ExtraUrlProps {
  let openedModels: string[] | undefined
  let activeModel: string | undefined

  searchParams.getAll('file').forEach((value) => {
    if (value.startsWith('*')) {
      value = value.slice(1)
      activeModel = '/' + value
    }

    openedModels ??= []
    openedModels.push('/' + value)
  })

  const showPreviewRaw = searchParams.get('preview')
  const showPreview: boolean | undefined =
    showPreviewRaw === '1' ? true : showPreviewRaw === '0' ? false : undefined

  return { openedModels, activeModel, showPreview }
}

function reviveState({
  state,
  searchParams,
}: {
  state: ReplStoredState
  searchParams?: URLSearchParams
}) {
  const extraUrlProps = searchParams ? searchParamsToExtraUrlProps(searchParams) : undefined

  if (extraUrlProps?.openedModels !== undefined) {
    state.openedModels = extraUrlProps.openedModels
  }

  if (extraUrlProps?.activeModel !== undefined) {
    state.activeModel = extraUrlProps.activeModel
  }

  if (extraUrlProps?.showPreview !== undefined) {
    state.showPreview = extraUrlProps.showPreview
  }

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

  if (!state.title) {
    state.title = 'Untitled'
  }

  return state
}

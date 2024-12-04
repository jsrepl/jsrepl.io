import { useParams, useSearchParams } from 'next/navigation'
import { load } from '@/lib/repl-stored-state/adapter-default'
import { load as loadFromUrl } from '@/lib/repl-stored-state/adapter-url'
import { ResponseError } from '@/lib/response-error'
import { ReplStoredState } from '@/types'

export async function loadRepl(
  params: ReturnType<typeof useParams>,
  searchParams: ReturnType<typeof useSearchParams>
): Promise<ReplStoredState | null> {
  const { slug } = params
  if (slug !== undefined && slug.length === 1) {
    const id = slug[0]!
    try {
      return await load(id, searchParams, {
        cache: 'no-store',
      })
    } catch (error) {
      if (error instanceof ResponseError && error.status === 404) {
        return null
      }

      throw error
    }
  } else if (slug === undefined) {
    return loadFromUrl(searchParams)
  } else {
    return null
  }
}

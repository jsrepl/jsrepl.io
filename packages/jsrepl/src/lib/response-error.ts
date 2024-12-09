import { PostgrestError } from '@supabase/supabase-js'

export class ResponseError extends Error {
  readonly status?: number
  readonly statusText?: string
  readonly url?: string
  readonly cause?: Error | PostgrestError | string | undefined

  constructor(
    message: string,
    {
      status,
      statusText,
      url,
      cause,
    }: {
      status?: number
      statusText?: string
      url?: string
      cause?: Error | PostgrestError | string
    } = {}
  ) {
    super(message)
    this.status = status
    this.statusText = statusText
    this.url = url
    this.cause = cause
  }
}

export function isAbortError(error: unknown): boolean {
  if (error instanceof Error && error.name === 'AbortError') {
    return true
  }

  if (isPostgrestError(error) && error.code === DOMException.ABORT_ERR.toString()) {
    return true
  }

  return false
}

// Confusingly, in types the PostgrestError is a class, but in runtime it's
// a plain object, without name='PostgrestError'.
export function isPostgrestError(error: unknown): error is PostgrestError {
  return error instanceof Object && 'code' in error && 'details' in error && 'hint' in error
}
